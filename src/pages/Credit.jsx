import { useCallback, useEffect, useMemo, useState } from 'react';
import { CreditCard, Plus, Users, Trash2, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CreditStats from '../components/credit/CreditStats';
import CreditFilters from '../components/credit/CreditFilters';
import CreditTable from '../components/credit/CreditTable';
import CreditDetails from '../components/credit/CreditDetails';
import CreditPaymentModal from '../components/credit/CreditPaymentModal';
import CreditSaleForm from '../components/credit/CreditSaleForm';
import { db, initializeDatabase } from '../database/db';
import { addSale } from '../services/salesService';

// ---------- helpers ----------
const normalizeId = (v) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
};

const normalizeNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};

const getDateValue = (r) => r?.date || r?.createdAt || r?.updatedAt || null;

const getTimestamp = (r) => {
    const v = getDateValue(r);
    if (!v) return 0;
    const t = new Date(v).getTime();
    return Number.isFinite(t) ? t : 0;
};

const isToday = (v) => {
    if (!v) return false;
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return false;
    const today = new Date();
    return (
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate()
    );
};

const DB_EVENTS = [
    'sales-updated',
    'credit-sales-updated',
    'credit-payments-updated',
    'customers-updated',
    'database-updated',
];

function Credit() {
    const { t, i18n } = useTranslation();

    const direction =
        typeof i18n.dir === 'function'
            ? i18n.dir()
            : i18n.language === 'en'
                ? 'ltr'
                : 'rtl';

    const isEnglish = String(i18n.language || 'fa').toLowerCase().startsWith('en');

    const refreshLabel = t('common.refresh', {
        defaultValue: isEnglish ? 'Refresh' : 'تازه‌سازی',
    });

    const [credits, setCredits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        sort: 'newest',
    });

    const [showCreditForm, setShowCreditForm] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [deleteCustomer, setDeleteCustomer] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // ---------- load ----------
    const loadCredits = useCallback(
        async ({ silent = false } = {}) => {
            try {
                if (!silent) setLoading(true);
                setError('');
                await initializeDatabase();

                const [customers, creditSales, creditPayments] = await Promise.all([
                    db.customers.toArray(),
                    db.creditSales.toArray(),
                    db.creditPayments.toArray(),
                ]);

                const accounts = customers
                    .map((customer) => {
                        const customerId = normalizeId(customer.id);
                        if (!customerId) return null;

                        const custSales = creditSales.filter(
                            (r) => normalizeId(r.customerId) === customerId
                        );

                        const custPayments = creditPayments.filter(
                            (r) => normalizeId(r.customerId) === customerId
                        );

                        const totalDebt = custSales.reduce(
                            (s, r) => s + normalizeNumber(r.amount),
                            0
                        );

                        const paid = custPayments.reduce(
                            (s, r) => s + normalizeNumber(r.amount),
                            0
                        );

                        const remaining = Math.max(0, totalDebt - paid);

                        let status = 'debt';
                        if (totalDebt <= 0 || remaining <= 0) {
                            status = 'settled';
                        } else if (paid > 0) {
                            status = 'partial';
                        }

                        const latestSale =
                            custSales
                                .slice()
                                .sort((a, b) => getTimestamp(b) - getTimestamp(a))[0] ||
                            null;

                        const latestPayment =
                            custPayments
                                .slice()
                                .sort((a, b) => getTimestamp(b) - getTimestamp(a))[0] ||
                            null;

                        const latestRecord =
                            [latestSale, latestPayment]
                                .filter(Boolean)
                                .sort((a, b) => getTimestamp(b) - getTimestamp(a))[0] ||
                            null;

                        return {
                            id: customerId,
                            customerId,
                            customerName: customer.name || '',
                            name: customer.name || '',
                            phone: customer.phone || '',
                            totalDebt,
                            paid,
                            remaining,
                            status,
                            creditSales: custSales,
                            payments: custPayments,
                            transactions: custSales.length + custPayments.length,
                            lastTransaction: getDateValue(latestRecord),
                            latestCreditSale: latestSale,
                            latestPayment,
                        };
                    })
                    .filter(Boolean);

                setCredits(accounts);
            } catch (err) {
                console.error('Failed to load credit accounts:', err);
                setError(
                    err?.message ||
                        t('credit.errors.load', {
                            defaultValue: isEnglish
                                ? 'Unable to load credit accounts.'
                                : 'بارگذاری حساب‌های نسیه با مشکل مواجه شد.',
                        })
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [t, isEnglish]
    );

    useEffect(() => {
        loadCredits();
    }, [loadCredits]);

    useEffect(() => {
        const handler = () => loadCredits({ silent: true });
        DB_EVENTS.forEach((e) => window.addEventListener(e, handler));
        return () =>
            DB_EVENTS.forEach((e) => window.removeEventListener(e, handler));
    }, [loadCredits]);

    const handleRefresh = async () => {
        if (loading || refreshing) return;
        setRefreshing(true);
        await loadCredits({ silent: true });
    };

    const handleFiltersChange = (changes) => setFilters((p) => ({ ...p, ...changes }));

    const handleResetFilters = () =>
        setFilters({
            search: '',
            status: 'all',
            sort: 'newest',
        });

    // ---------- filter + sort ----------
    const filteredCredits = useMemo(() => {
        let result = [...credits];

        const search = String(filters.search || '')
            .trim()
            .toLocaleLowerCase();

        if (search) {
            result = result.filter((c) => {
                const name = String(c.customerName || c.name || '').toLocaleLowerCase();
                const phone = String(c.phone || '').toLocaleLowerCase();
                return name.includes(search) || phone.includes(search);
            });
        }

        if (filters.status !== 'all') {
            result = result.filter((c) => c.status === filters.status);
        }

        result.sort((a, b) => {
            switch (filters.sort) {
                case 'highest':
                    return (
                        normalizeNumber(b.remaining) - normalizeNumber(a.remaining)
                    );
                case 'lowest':
                    return (
                        normalizeNumber(a.remaining) - normalizeNumber(b.remaining)
                    );
                case 'oldest':
                    return (
                        getTimestamp(a.latestCreditSale) -
                        getTimestamp(b.latestCreditSale)
                    );
                case 'name':
                    return String(a.customerName || a.name || '').localeCompare(
                        String(b.customerName || b.name || ''),
                        isEnglish ? 'en' : 'fa'
                    );
                case 'newest':
                default:
                    return (
                        getTimestamp(b.latestCreditSale) -
                        getTimestamp(a.latestCreditSale)
                    );
            }
        });

        return result;
    }, [credits, filters, isEnglish]);

    // ---------- stats ----------
    const statistics = useMemo(() => {
        const totalDebt = credits.reduce(
            (s, c) => s + normalizeNumber(c.totalDebt),
            0
        );
        const totalPaid = credits.reduce((s, c) => s + normalizeNumber(c.paid), 0);
        const totalRemaining = credits.reduce(
            (s, c) => s + normalizeNumber(c.remaining),
            0
        );
        const debtorCount = credits.filter(
            (c) => normalizeNumber(c.remaining) > 0
        ).length;
        const settledCount = credits.filter((c) => c.status === 'settled').length;
        const partialCount = credits.filter((c) => c.status === 'partial').length;
        const debtCount = credits.filter((c) => c.status === 'debt').length;

        const todayDebt = credits.reduce(
            (sum, c) =>
                sum +
                (c.creditSales || []).reduce((s, sale) => {
                    if (!isToday(getDateValue(sale))) return s;
                    return s + normalizeNumber(sale.amount);
                }, 0),
            0
        );

        return {
            totalDebt,
            totalPaid,
            totalRemaining,
            todayDebt,
            customerCount: credits.length,
            debtorCount,
            settledCount,
            partialCount,
            debtCount,
        };
    }, [credits]);

    // ---------- modals ----------
    const openCreditForm = () => {
        setError('');
        setShowDetails(false);
        setShowPaymentModal(false);
        setShowCreditForm(true);
    };

    const viewDetails = (customer) => {
        if (!customer) return;
        setError('');
        setSelectedCustomer(customer);
        setShowPaymentModal(false);
        setShowDetails(true);
    };

    const closeDetails = () => {
        setShowDetails(false);
        setSelectedCustomer(null);
    };

    const openPayment = (customer) => {
        if (!customer) return;
        if (normalizeNumber(customer.remaining) <= 0) return;
        setError('');
        setSelectedCustomer(customer);
        setShowDetails(false);
        setShowPaymentModal(true);
    };

    const closePayment = () => {
        setShowPaymentModal(false);
        setSelectedCustomer(null);
    };

    // ---------- submit payment ----------
    const submitPayment = async (paymentData) => {
        try {
            setError('');
            if (!selectedCustomer) return;

            const customerId = normalizeId(
                selectedCustomer.customerId ?? selectedCustomer.id
            );

            if (!customerId) {
                throw new Error(
                    t('credit.errors.invalidCustomer', {
                        defaultValue: isEnglish
                            ? 'The selected customer is not valid.'
                            : 'مشتری انتخاب‌شده معتبر نیست.',
                    })
                );
            }

            const amount = Number(paymentData?.amount);
            if (!Number.isFinite(amount) || amount <= 0) {
                throw new Error(
                    t('credit.errors.invalidPayment', {
                        defaultValue: isEnglish
                            ? 'Please enter a valid payment amount.'
                            : 'لطفاً مبلغ پرداختی معتبر وارد کنید.',
                    })
                );
            }

            const remaining = normalizeNumber(selectedCustomer.remaining);
            if (amount > remaining) {
                throw new Error(
                    t('credit.errors.paymentExceedsRemaining', {
                        defaultValue: isEnglish
                            ? 'The payment amount cannot exceed the remaining debt.'
                            : 'مبلغ پرداختی نمی‌تواند بیشتر از بدهی باقی‌مانده باشد.',
                    })
                );
            }

            await initializeDatabase();

            const customer = await db.customers.get(customerId);
            if (!customer) {
                throw new Error(
                    t('credit.errors.invalidCustomer', {
                        defaultValue: isEnglish
                            ? 'The selected customer is not valid.'
                            : 'مشتری انتخاب‌شده معتبر نیست.',
                    })
                );
            }

            const now = new Date().toISOString();

            await db.creditPayments.add({
                customerId,
                amount,
                paymentMethod: paymentData?.paymentMethod || 'cash',
                description: paymentData?.description?.trim() || '',
                date: paymentData?.date || now,
                createdAt: now,
            });

            setShowPaymentModal(false);
            setShowDetails(false);
            setSelectedCustomer(null);

            ['credit-payments-updated', 'credit-sales-updated', 'database-updated'].forEach(
                (e) => window.dispatchEvent(new Event(e))
            );

            await loadCredits({ silent: true });
        } catch (err) {
            console.error('Failed to save credit payment:', err);
            setError(
                err?.message ||
                    t('credit.errors.paymentSave', {
                        defaultValue: isEnglish
                            ? 'Unable to record the payment. Please try again.'
                            : 'ثبت پرداخت انجام نشد. لطفاً دوباره تلاش کنید.',
                    })
            );
        }
    };

    // ---------- submit credit sale (FIXED) ----------
    const submitCredit = async (data) => {
        try {
            setError('');

            // ═══ Customer validation ═══
            const customerName = data?.customerName?.trim() || '';
            if (!customerName) {
                throw new Error(
                    t('credit.saleForm.errors.customerRequired', {
                        defaultValue: isEnglish
                            ? 'Please enter the customer name.'
                            : 'لطفاً نام مشتری را وارد کنید.',
                    })
                );
            }

            // ═══ Resolve productId ═══
            // New form sends productId directly. Older forms may only send
            // a product name — in that case we look it up as a fallback.
            let productId = normalizeId(data?.productId);
            let productSnapshot = null;

            if (!productId) {
                const productName = (data?.productName || data?.product || '').trim();
                if (!productName) {
                    throw new Error(
                        t('credit.saleForm.errors.productRequired', {
                            defaultValue: isEnglish
                                ? 'Please select the product.'
                                : 'لطفاً محصول را انتخاب کنید.',
                        })
                    );
                }

                await initializeDatabase();
                const allProducts = await db.products.toArray();
                const normalized = productName.toLowerCase();
                const found = allProducts.find(
                    (p) =>
                        String(p.name || '')
                            .trim()
                            .toLowerCase() === normalized
                );

                if (!found) {
                    throw new Error(
                        t('credit.errors.productNotFound', {
                            defaultValue: isEnglish
                                ? 'The selected product could not be found.'
                                : 'محصول انتخاب‌شده پیدا نشد.',
                        })
                    );
                }

                productId = found.id;
                productSnapshot = found;
            }

            // ═══ Quantity validation ═══
            const quantity = Number(data?.quantity);
            if (!Number.isFinite(quantity) || quantity <= 0) {
                throw new Error(
                    t('credit.saleForm.errors.quantityRequired', {
                        defaultValue: isEnglish
                            ? 'Quantity must be greater than zero.'
                            : 'تعداد باید بیشتر از صفر باشد.',
                    })
                );
            }

            // ═══ Price validation ═══
            const unitPrice = Number(data?.unitPrice);
            if (!Number.isFinite(unitPrice) || unitPrice < 0) {
                throw new Error(
                    t('credit.saleForm.errors.priceInvalid', {
                        defaultValue: isEnglish
                            ? 'Please enter a valid unit price.'
                            : 'لطفاً قیمت واحد معتبر وارد کنید.',
                    })
                );
            }

            // ═══ Multi-unit fields (with safe fallbacks for legacy callers) ═══
            const saleFactorRaw = Number(data?.saleFactor);
            const saleFactor =
                Number.isFinite(saleFactorRaw) && saleFactorRaw > 0
                    ? saleFactorRaw
                    : 1;

            const quantityInBaseRaw = Number(data?.quantityInBase);
            const quantityInBase =
                Number.isFinite(quantityInBaseRaw) && quantityInBaseRaw > 0
                    ? quantityInBaseRaw
                    : quantity * saleFactor;

            // ═══ Call addSale — it handles stock check + deduction in base units ═══
            await addSale({
                // Product
                productId,
                productName: data?.productName || productSnapshot?.name || '',
                category: data?.category || productSnapshot?.category || '',

                // Quantity (in sale unit + base)
                quantity,
                saleOptionId: data?.saleOptionId || null,
                saleUnit: data?.saleUnit || '',
                saleFactor,
                quantityInBase,

                // Price
                unitPrice,
                total: quantity * unitPrice,

                // Payment
                paymentType: 'credit',

                // Customer
                customerName,
                customerPhone: data?.customerPhone || data?.phone || '',

                // Meta
                note: data?.note || '',
                date: data?.date || new Date().toISOString(),
                dueDate: data?.dueDate || null,
            });

            setShowCreditForm(false);
            setError('');
            await loadCredits({ silent: true });
        } catch (err) {
            console.error('Failed to save credit sale:', err);
            setError(
                err?.message ||
                    t('credit.errors.saleSave', {
                        defaultValue: isEnglish
                            ? 'Unable to record the credit sale. Please try again.'
                            : 'ثبت فروش نسیه انجام نشد. لطفاً دوباره تلاش کنید.',
                    })
            );
        }
    };

    // ---------- delete ----------
    const requestDelete = (customer) => {
        if (!customer) return;

        if (normalizeNumber(customer.remaining) > 0) {
            setError(
                t('credit.errors.cannotDeleteWithDebt', {
                    defaultValue: isEnglish
                        ? 'This customer still has an outstanding debt.'
                        : 'این مشتری هنوز بدهی باقی‌مانده دارد.',
                })
            );
            return;
        }

        setError('');
        setDeleteCustomer(customer);
    };

    const closeDeleteModal = () => {
        if (deleting) return;
        setDeleteCustomer(null);
    };

    const confirmDelete = async () => {
        if (!deleteCustomer || deleting) return;

        try {
            setDeleting(true);
            setError('');

            const customerId = normalizeId(
                deleteCustomer.customerId ?? deleteCustomer.id
            );

            if (!customerId) {
                throw new Error(
                    t('credit.errors.invalidCustomer', {
                        defaultValue: isEnglish
                            ? 'The selected customer is not valid.'
                            : 'مشتری انتخاب‌شده معتبر نیست.',
                    })
                );
            }

            await initializeDatabase();

            const [customer, creditSales, creditPayments] = await Promise.all([
                db.customers.get(customerId),
                db.creditSales.where('customerId').equals(customerId).toArray(),
                db.creditPayments.where('customerId').equals(customerId).toArray(),
            ]);

            if (!customer) {
                throw new Error(
                    t('credit.errors.invalidCustomer', {
                        defaultValue: isEnglish
                            ? 'The selected customer is not valid.'
                            : 'مشتری انتخاب‌شده معتبر نیست.',
                    })
                );
            }

            const totalDebt = creditSales.reduce(
                (s, r) => s + normalizeNumber(r.amount),
                0
            );
            const totalPaid = creditPayments.reduce(
                (s, r) => s + normalizeNumber(r.amount),
                0
            );

            if (Math.max(0, totalDebt - totalPaid) > 0) {
                throw new Error(
                    t('credit.errors.cannotDeleteWithDebt', {
                        defaultValue: isEnglish
                            ? 'This customer still has an outstanding debt.'
                            : 'این مشتری هنوز بدهی باقی‌مانده دارد.',
                    })
                );
            }

            const relatedSales = await db.sales
                .where('customerId')
                .equals(customerId)
                .toArray();

            await db.transaction(
                'rw',
                db.customers,
                db.creditSales,
                db.creditPayments,
                db.sales,
                async () => {
                    for (const sale of relatedSales) {
                        await db.sales.update(sale.id, { customerId: null });
                    }
                    await db.creditPayments
                        .where('customerId')
                        .equals(customerId)
                        .delete();
                    await db.creditSales
                        .where('customerId')
                        .equals(customerId)
                        .delete();
                    await db.customers.delete(customerId);
                }
            );

            setDeleteCustomer(null);
            setSelectedCustomer(null);
            setShowDetails(false);
            setShowPaymentModal(false);

            [
                'customers-updated',
                'sales-updated',
                'credit-sales-updated',
                'credit-payments-updated',
                'database-updated',
            ].forEach((e) => window.dispatchEvent(new Event(e)));

            await loadCredits({ silent: true });
        } catch (err) {
            console.error('Failed to delete customer:', err);
            setError(
                err?.message ||
                    t('credit.errors.deleteCustomer', {
                        defaultValue: isEnglish
                            ? 'Unable to delete the customer account. Please try again.'
                            : 'حذف حساب مشتری انجام نشد. لطفاً دوباره تلاش کنید.',
                    })
            );
        } finally {
            setDeleting(false);
        }
    };

    const getDeleteName = () =>
        deleteCustomer?.customerName || deleteCustomer?.name || '';

    return (
        <div
            dir={direction}
            className="relative min-w-0 space-y-4 pb-6 text-[var(--text)] sm:space-y-5 lg:space-y-6"
        >
            {/* header */}
            <section className="ui-card relative overflow-hidden rounded-2xl p-4 sm:p-5 md:p-6">
                <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-500/15 bg-amber-500/10 shadow-[var(--shadow-xs)] sm:h-12 sm:w-12">
                            <CreditCard size={21} strokeWidth={2} className="text-amber-500" />
                        </div>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight text-[var(--text)] sm:text-2xl lg:text-[28px]">
                                    {t('credit.page.title')}
                                </h1>
                                <span className="inline-flex items-center rounded-lg border border-amber-500/15 bg-amber-500/10 px-2.5 py-1 text-[9px] font-bold text-amber-500 sm:text-[10px]">
                                    {t('credit.page.badge')}
                                </span>
                            </div>
                            <p className="mt-1 max-w-2xl text-[11px] leading-5 text-[var(--text-muted)] sm:text-xs sm:leading-6">
                                {t('credit.page.description')}
                            </p>
                        </div>
                    </div>

                    <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end lg:w-auto">
                        <div className="order-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 sm:order-1 sm:w-auto sm:min-w-[125px]">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)]">
                                <Users size={14} className="text-[var(--text-muted)]" />
                            </div>
                            <span className="text-[11px] font-medium text-[var(--text-secondary)]">
                                {t('credit.page.debtorCustomers')}
                            </span>
                            <span
                                dir="ltr"
                                className="number-font text-sm font-bold text-[var(--text)]"
                            >
                                {statistics.debtorCount}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)]">
                                {t('credit.page.person')}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={handleRefresh}
                            disabled={loading || refreshing}
                            className="ui-button-secondary order-2 min-h-11 w-full px-3.5 sm:w-auto"
                        >
                            <RefreshCw
                                size={15}
                                className={refreshing ? 'animate-spin' : ''}
                            />
                            <span>{refreshLabel}</span>
                        </button>

                        <button
                            type="button"
                            onClick={openCreditForm}
                            className="ui-button-primary group order-1 min-h-11 w-full rounded-xl px-4 sm:order-3 sm:w-auto"
                        >
                            <Plus
                                size={16}
                                strokeWidth={2.2}
                                className="transition-transform duration-200 group-hover:rotate-90"
                            />
                            <span>{t('credit.page.newCredit')}</span>
                        </button>
                    </div>
                </div>
            </section>

            {error && (
                <div
                    role="alert"
                    className="rounded-2xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-xs leading-5 text-[var(--danger)] sm:text-sm"
                >
                    {error}
                </div>
            )}

            <CreditStats statistics={statistics} loading={loading} />

            <CreditFilters
                filters={filters}
                onChange={handleFiltersChange}
                onReset={handleResetFilters}
            />

            <CreditTable
                credits={filteredCredits}
                filters={filters}
                loading={loading}
                onViewDetails={viewDetails}
                onPayment={openPayment}
                onDelete={requestDelete}
            />

            {showCreditForm && (
                <CreditSaleForm
                    onClose={() => setShowCreditForm(false)}
                    onSubmit={submitCredit}
                />
            )}

            {showDetails && selectedCustomer && (
                <CreditDetails
                    customer={selectedCustomer}
                    onClose={closeDetails}
                    onPayment={openPayment}
                />
            )}

            {showPaymentModal && selectedCustomer && (
                <CreditPaymentModal
                    customer={selectedCustomer}
                    onClose={closePayment}
                    onSubmit={submitPayment}
                />
            )}

            {/* delete modal */}
            {deleteCustomer && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/[0.28] p-3 backdrop-blur-[18px] backdrop-saturate-[0.72] animate-[profileBackdropIn_180ms_ease-out] sm:p-4 dark:bg-black/[0.50]"
                    onMouseDown={closeDeleteModal}
                    role="presentation"
                >
                    <div
                        className="ui-modal w-full max-w-sm animate-[profileModalIn_180ms_ease-out]"
                        onMouseDown={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="ui-modal-header relative overflow-hidden px-4 py-4 sm:px-5 sm:py-5">
                            <div className="relative flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-rose-500/10 bg-rose-500/10">
                                    <Trash2 size={19} className="text-rose-500" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-sm font-bold text-[var(--text)] sm:text-base">
                                        {t('credit.table.delete.title', {
                                            defaultValue: isEnglish
                                                ? 'Delete Customer Account'
                                                : 'حذف حساب مشتری',
                                        })}
                                    </h2>
                                    <p className="mt-1 text-[11px] leading-5 text-[var(--text-muted)]">
                                        {t('credit.table.delete.description', {
                                            defaultValue: isEnglish
                                                ? 'This account is fully settled.'
                                                : 'این حساب به‌طور کامل تسویه شده است.',
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="px-4 py-4 sm:px-5 sm:py-5">
                            <div className="rounded-2xl border border-rose-500/10 bg-rose-500/5 p-4">
                                <div className="flex items-center gap-2 text-[10px] font-medium text-rose-500">
                                    <Trash2 size={13} />
                                    <span>
                                        {t('credit.table.delete.confirm', {
                                            defaultValue: isEnglish
                                                ? 'Delete Account'
                                                : 'حذف حساب',
                                        })}
                                    </span>
                                </div>
                                <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                                    {t('credit.table.deleteConfirm', {
                                        customer: getDeleteName(),
                                        defaultValue: isEnglish
                                            ? `Are you sure you want to delete "${getDeleteName()}"?`
                                            : `آیا مطمئن هستید که حساب «${getDeleteName()}» حذف شود؟`,
                                    })}
                                </p>
                                <p className="mt-2 text-[10px] leading-5 text-[var(--text-muted)]">
                                    {isEnglish
                                        ? 'The credit account and payment records will be removed. Sales history will be preserved.'
                                        : 'حساب نسیه و سوابق پرداخت حذف می‌شود، اما سابقه فروش حفظ خواهد شد.'}
                                </p>
                            </div>
                        </div>

                        <div className="ui-modal-footer flex flex-col-reverse gap-2 px-4 py-3 sm:flex-row sm:justify-end sm:px-5 sm:py-4">
                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                disabled={deleting}
                                className="ui-button-secondary min-h-10 w-full rounded-xl px-4 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                            >
                                {t('credit.table.delete.cancel', {
                                    defaultValue: isEnglish ? 'Cancel' : 'انصراف',
                                })}
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                disabled={deleting}
                                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-rose-500/15 bg-rose-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-rose-500/20 transition-all hover:bg-rose-600 hover:shadow-md active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                            >
                                {deleting ? (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                ) : (
                                    <Trash2 size={15} />
                                )}
                                <span>
                                    {deleting
                                        ? isEnglish
                                            ? 'Deleting...'
                                            : 'در حال حذف...'
                                        : t('credit.table.delete.confirm', {
                                            defaultValue: isEnglish
                                                ? 'Delete Account'
                                                : 'حذف حساب',
                                        })}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Credit;