import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    CreditCard,
    Plus,
    Users,
    Trash2,
    RefreshCw,
} from 'lucide-react';

import {
    useTranslation,
} from 'react-i18next';

import CreditStats
    from '../components/credit/CreditStats';

import CreditFilters
    from '../components/credit/CreditFilters';

import CreditTable
    from '../components/credit/CreditTable';

import CreditDetails
    from '../components/credit/CreditDetails';

import CreditPaymentModal
    from '../components/credit/CreditPaymentModal';

import CreditSaleForm
    from '../components/credit/CreditSaleForm';

import {
    db,
    initializeDatabase,
} from '../database/db';

import {
    addSale,
} from '../services/salesService';


// =========================================================
// Helpers
// =========================================================

const normalizeId = (
    value
) => {

    const id =
        Number(value);


    return Number.isFinite(id) &&
        id > 0
        ? id
        : null;

};


const normalizeNumber = (
    value
) => {

    const number =
        Number(value);


    return Number.isFinite(number)
        ? number
        : 0;

};


const getDateValue = (
    record
) => {

    return (
        record?.date ||
        record?.createdAt ||
        record?.updatedAt ||
        null
    );

};


const getTimestamp = (
    record
) => {

    const value =
        getDateValue(
            record
        );


    if (!value) {
        return 0;
    }


    const timestamp =
        new Date(
            value
        ).getTime();


    return Number.isFinite(
        timestamp
    )
        ? timestamp
        : 0;

};


const isToday = (
    value
) => {

    if (!value) {
        return false;
    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return false;

    }


    const today =
        new Date();


    return (
        date.getFullYear() ===
            today.getFullYear() &&

        date.getMonth() ===
            today.getMonth() &&

        date.getDate() ===
            today.getDate()
    );

};


// =========================================================
// Credit Page
// =========================================================

function Credit() {

    const {
        t,
        i18n,
    } = useTranslation();


    const direction =
        typeof i18n.dir === 'function'
            ? i18n.dir()
            : i18n.language === 'en'
                ? 'ltr'
                : 'rtl';


    const isEnglish =
        i18n.language === 'en';


    const refreshLabel =
        t(
            'common.refresh',
            {
                defaultValue:
                    isEnglish
                        ? 'Refresh'
                        : 'تازه‌سازی',
            }
        );


    // =======================================================
    // Data
    // =======================================================

    const [
        credits,
        setCredits,
    ] = useState([]);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        refreshing,
        setRefreshing,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState('');


    // =======================================================
    // Filters
    // =======================================================

    const [
        filters,
        setFilters,
    ] = useState({
        search: '',
        status: 'all',
        sort: 'newest',
    });


    // =======================================================
    // Modals
    // =======================================================

    const [
        showCreditForm,
        setShowCreditForm,
    ] = useState(false);


    const [
        showDetails,
        setShowDetails,
    ] = useState(false);


    const [
        showPaymentModal,
        setShowPaymentModal,
    ] = useState(false);


    const [
        selectedCustomer,
        setSelectedCustomer,
    ] = useState(null);


    const [
        deleteCustomer,
        setDeleteCustomer,
    ] = useState(null);


    const [
        deleting,
        setDeleting,
    ] = useState(false);


    // =======================================================
    // Load Credit Accounts
    // =======================================================

    const loadCredits = useCallback(
        async ({
            silent = false,
        } = {}) => {

            try {

                if (!silent) {
                    setLoading(true);
                }


                setError('');


                await initializeDatabase();


                const [
                    customers,
                    creditSales,
                    creditPayments,
                ] = await Promise.all([

                    db.customers.toArray(),

                    db.creditSales.toArray(),

                    db.creditPayments.toArray(),

                ]);


                const accounts =
                    customers

                        .map(
                            (
                                customer
                            ) => {

                                const customerId =
                                    normalizeId(
                                        customer.id
                                    );


                                if (!customerId) {
                                    return null;
                                }


                                const customerCreditSales =
                                    creditSales.filter(
                                        (
                                            record
                                        ) =>
                                            normalizeId(
                                                record.customerId
                                            ) ===
                                            customerId
                                    );


                                const customerPayments =
                                    creditPayments.filter(
                                        (
                                            record
                                        ) =>
                                            normalizeId(
                                                record.customerId
                                            ) ===
                                            customerId
                                    );


                                const totalDebt =
                                    customerCreditSales.reduce(
                                        (
                                            sum,
                                            record
                                        ) =>
                                            sum +
                                            normalizeNumber(
                                                record.amount
                                            ),
                                        0
                                    );


                                const paid =
                                    customerPayments.reduce(
                                        (
                                            sum,
                                            record
                                        ) =>
                                            sum +
                                            normalizeNumber(
                                                record.amount
                                            ),
                                        0
                                    );


                                const remaining =
                                    Math.max(
                                        0,
                                        totalDebt -
                                            paid
                                    );


                                let status =
                                    'debt';


                                if (
                                    totalDebt <=
                                    0
                                ) {

                                    status =
                                        'settled';

                                } else if (
                                    remaining <=
                                    0
                                ) {

                                    status =
                                        'settled';

                                } else if (
                                    paid > 0
                                ) {

                                    status =
                                        'partial';

                                }


                                const latestCreditSale =
                                    customerCreditSales
                                        .slice()
                                        .sort(
                                            (
                                                a,
                                                b
                                            ) =>
                                                getTimestamp(
                                                    b
                                                ) -
                                                getTimestamp(
                                                    a
                                                )
                                        )[0] ||
                                    null;


                                const latestPayment =
                                    customerPayments
                                        .slice()
                                        .sort(
                                            (
                                                a,
                                                b
                                            ) =>
                                                getTimestamp(
                                                    b
                                                ) -
                                                getTimestamp(
                                                    a
                                                )
                                        )[0] ||
                                    null;


                                const latestRecord =
                                    [
                                        latestCreditSale,
                                        latestPayment,
                                    ]
                                        .filter(
                                            Boolean
                                        )
                                        .sort(
                                            (
                                                a,
                                                b
                                            ) =>
                                                getTimestamp(
                                                    b
                                                ) -
                                                getTimestamp(
                                                    a
                                                )
                                        )[0] ||
                                    null;


                                return {

                                    id:
                                        customerId,

                                    customerId,

                                    customerName:
                                        customer.name ||
                                        '',

                                    name:
                                        customer.name ||
                                        '',

                                    phone:
                                        customer.phone ||
                                        '',

                                    totalDebt,

                                    paid,

                                    remaining,

                                    status,

                                    creditSales:
                                        customerCreditSales,

                                    payments:
                                        customerPayments,

                                    transactions:
                                        customerCreditSales.length +
                                        customerPayments.length,

                                    lastTransaction:
                                        getDateValue(
                                            latestRecord
                                        ),

                                    latestCreditSale,

                                    latestPayment,

                                };

                            }
                        )

                        .filter(
                            Boolean
                        );


                setCredits(
                    accounts
                );

            } catch (
                loadError
            ) {

                console.error(
                    'Failed to load credit accounts:',
                    loadError
                );


                setError(
                    loadError?.message ||
                    t(
                        'credit.errors.load',
                        {
                            defaultValue:
                                isEnglish
                                    ? 'Unable to load credit accounts.'
                                    : 'بارگذاری حساب‌های نسیه با مشکل مواجه شد.',
                        }
                    )
                );

            } finally {

                setLoading(false);

                setRefreshing(false);

            }

        },
        [
            t,
            isEnglish,
        ]
    );


    // =======================================================
    // Initial Load
    // =======================================================

    useEffect(() => {

        loadCredits();

    }, [
        loadCredits,
    ]);


    // =======================================================
    // Database Events
    // =======================================================

    useEffect(() => {

        const handleDatabaseUpdate = () => {

            loadCredits({
                silent: true,
            });

        };


        const events = [

            'sales-updated',

            'credit-sales-updated',

            'credit-payments-updated',

            'customers-updated',

            'database-updated',

        ];


        events.forEach(
            (
                eventName
            ) => {

                window.addEventListener(
                    eventName,
                    handleDatabaseUpdate
                );

            }
        );


        return () => {

            events.forEach(
                (
                    eventName
                ) => {

                    window.removeEventListener(
                        eventName,
                        handleDatabaseUpdate
                    );

                }
            );

        };

    }, [
        loadCredits,
    ]);


    // =======================================================
    // Refresh
    // =======================================================

    const handleRefresh = async () => {

        if (
            loading ||
            refreshing
        ) {

            return;

        }


        setRefreshing(true);


        await loadCredits({
            silent: true,
        });

    };


    // =======================================================
    // Filters
    // =======================================================

    const handleFiltersChange = (
        changes
    ) => {

        setFilters(
            (
                previous
            ) => ({
                ...previous,
                ...changes,
            })
        );

    };


    const handleResetFilters = () => {

        setFilters({
            search: '',
            status: 'all',
            sort: 'newest',
        });

    };


    // =======================================================
    // Filtered Credits
    // =======================================================

    const filteredCredits =
        useMemo(
            () => {

                let result =
                    [
                        ...credits,
                    ];


                const search =
                    String(
                        filters.search ||
                        ''
                    )
                        .trim()
                        .toLocaleLowerCase();


                if (search) {

                    result =
                        result.filter(
                            (
                                customer
                            ) => {

                                const name =
                                    String(
                                        customer.customerName ||
                                        customer.name ||
                                        ''
                                    )
                                        .toLocaleLowerCase();


                                const phone =
                                    String(
                                        customer.phone ||
                                        ''
                                    )
                                        .toLocaleLowerCase();


                                return (
                                    name.includes(
                                        search
                                    ) ||
                                    phone.includes(
                                        search
                                    )
                                );

                            }
                        );

                }


                if (
                    filters.status !==
                    'all'
                ) {

                    result =
                        result.filter(
                            (
                                customer
                            ) =>
                                customer.status ===
                                filters.status
                        );

                }


                result.sort(
                    (
                        a,
                        b
                    ) => {

                        switch (
                            filters.sort
                        ) {

                            case 'highest':

                                return (
                                    normalizeNumber(
                                        b.remaining
                                    ) -
                                    normalizeNumber(
                                        a.remaining
                                    )
                                );


                            case 'lowest':

                                return (
                                    normalizeNumber(
                                        a.remaining
                                    ) -
                                    normalizeNumber(
                                        b.remaining
                                    )
                                );


                            case 'oldest':

                                return (
                                    getTimestamp(
                                        a.latestCreditSale
                                    ) -
                                    getTimestamp(
                                        b.latestCreditSale
                                    )
                                );


                            case 'name':

                                return String(
                                    a.customerName ||
                                    a.name ||
                                    ''
                                ).localeCompare(
                                    String(
                                        b.customerName ||
                                        b.name ||
                                        ''
                                    ),
                                    isEnglish
                                        ? 'en'
                                        : 'fa'
                                );


                            case 'newest':
                            default:

                                return (
                                    getTimestamp(
                                        b.latestCreditSale
                                    ) -
                                    getTimestamp(
                                        a.latestCreditSale
                                    )
                                );

                        }

                    }
                );


                return result;

            },
            [
                credits,
                filters,
                isEnglish,
            ]
        );


    // =======================================================
    // Statistics
    // =======================================================

    const statistics =
        useMemo(
            () => {

                const totalDebt =
                    credits.reduce(
                        (
                            sum,
                            customer
                        ) =>
                            sum +
                            normalizeNumber(
                                customer.totalDebt
                            ),
                        0
                    );


                const totalPaid =
                    credits.reduce(
                        (
                            sum,
                            customer
                        ) =>
                            sum +
                            normalizeNumber(
                                customer.paid
                            ),
                        0
                    );


                const totalRemaining =
                    credits.reduce(
                        (
                            sum,
                            customer
                        ) =>
                            sum +
                            normalizeNumber(
                                customer.remaining
                            ),
                        0
                    );


                const debtorCount =
                    credits.filter(
                        (
                            customer
                        ) =>
                            normalizeNumber(
                                customer.remaining
                            ) > 0
                    ).length;


                const settledCount =
                    credits.filter(
                        (
                            customer
                        ) =>
                            customer.status ===
                            'settled'
                    ).length;


                const partialCount =
                    credits.filter(
                        (
                            customer
                        ) =>
                            customer.status ===
                            'partial'
                    ).length;


                const debtCount =
                    credits.filter(
                        (
                            customer
                        ) =>
                            customer.status ===
                            'debt'
                    ).length;


                const todayDebt =
                    credits.reduce(
                        (
                            sum,
                            customer
                        ) => {

                            const todayCredit =
                                (
                                    customer.creditSales ||
                                    []
                                ).reduce(
                                    (
                                        saleSum,
                                        sale
                                    ) => {

                                        if (
                                            !isToday(
                                                getDateValue(
                                                    sale
                                                )
                                            )
                                        ) {

                                            return saleSum;

                                        }


                                        return (
                                            saleSum +
                                            normalizeNumber(
                                                sale.amount
                                            )
                                        );

                                    },
                                    0
                                );


                            return (
                                sum +
                                todayCredit
                            );

                        },
                        0
                    );


                return {

                    totalDebt,

                    totalPaid,

                    totalRemaining,

                    todayDebt,

                    customerCount:
                        credits.length,

                    debtorCount,

                    settledCount,

                    partialCount,

                    debtCount,

                };

            },
            [
                credits,
            ]
        );


    // =======================================================
    // Credit Form
    // =======================================================

    const handleOpenCreditForm =
        () => {

            setError('');

            setShowDetails(false);

            setShowPaymentModal(false);

            setShowCreditForm(true);

        };


    const handleCloseCreditForm =
        () => {

            setShowCreditForm(false);

        };


    // =======================================================
    // Details
    // =======================================================

    const handleViewDetails =
        (
            customer
        ) => {

            if (!customer) {
                return;
            }


            setError('');


            setSelectedCustomer(
                customer
            );


            setShowPaymentModal(false);


            setShowDetails(true);

        };


    const handleCloseDetails =
        () => {

            setShowDetails(false);

            setSelectedCustomer(
                null
            );

        };


    // =======================================================
    // Payment
    // =======================================================

    const handleOpenPayment =
        (
            customer
        ) => {

            if (!customer) {
                return;
            }


            const remaining =
                normalizeNumber(
                    customer.remaining
                );


            if (remaining <= 0) {
                return;
            }


            setError('');


            setSelectedCustomer(
                customer
            );


            setShowDetails(false);

            setShowPaymentModal(true);

        };


    const handleClosePayment =
        () => {

            setShowPaymentModal(false);

            setSelectedCustomer(
                null
            );

        };


    // =======================================================
    // Submit Payment
    // =======================================================

    const handleSubmitPayment =
        async (
            paymentData
        ) => {

            try {

                setError('');


                if (!selectedCustomer) {
                    return;
                }


                const customerId =
                    normalizeId(
                        selectedCustomer.customerId ??
                        selectedCustomer.id
                    );


                if (!customerId) {

                    throw new Error(
                        t(
                            'credit.errors.invalidCustomer',
                            {
                                defaultValue:
                                    isEnglish
                                        ? 'The selected customer is not valid.'
                                        : 'مشتری انتخاب‌شده معتبر نیست.',
                            }
                        )
                    );

                }


                const amount =
                    Number(
                        paymentData?.amount
                    );


                if (
                    !Number.isFinite(
                        amount
                    ) ||
                    amount <= 0
                ) {

                    throw new Error(
                        t(
                            'credit.errors.invalidPayment',
                            {
                                defaultValue:
                                    isEnglish
                                        ? 'Please enter a valid payment amount.'
                                        : 'لطفاً مبلغ پرداختی معتبر وارد کنید.',
                            }
                        )
                    );

                }


                const remaining =
                    normalizeNumber(
                        selectedCustomer.remaining
                    );


                if (
                    amount >
                    remaining
                ) {

                    throw new Error(
                        t(
                            'credit.errors.paymentExceedsRemaining',
                            {
                                defaultValue:
                                    isEnglish
                                        ? 'The payment amount cannot exceed the remaining debt.'
                                        : 'مبلغ پرداختی نمی‌تواند بیشتر از بدهی باقی‌مانده باشد.',
                            }
                        )
                    );

                }


                await initializeDatabase();


                const customer =
                    await db.customers.get(
                        customerId
                    );


                if (!customer) {

                    throw new Error(
                        t(
                            'credit.errors.invalidCustomer',
                            {
                                defaultValue:
                                    isEnglish
                                        ? 'The selected customer is not valid.'
                                        : 'مشتری انتخاب‌شده معتبر نیست.',
                            }
                        )
                    );

                }


                const now =
                    new Date()
                        .toISOString();


                await db.creditPayments.add({

                    customerId,

                    amount,

                    paymentMethod:
                        paymentData?.paymentMethod ||
                        'cash',

                    description:
                        paymentData?.description?.trim() ||
                        '',

                    date:
                        paymentData?.date ||
                        now,

                    createdAt:
                        now,

                });


                setShowPaymentModal(
                    false
                );


                setShowDetails(
                    false
                );


                setSelectedCustomer(
                    null
                );


                [
                    'credit-payments-updated',
                    'credit-sales-updated',
                    'database-updated',
                ].forEach(
                    (
                        eventName
                    ) => {

                        window.dispatchEvent(
                            new Event(
                                eventName
                            )
                        );

                    }
                );


                await loadCredits({
                    silent: true,
                });

            } catch (
                paymentError
            ) {

                console.error(
                    'Failed to save credit payment:',
                    paymentError
                );


                setError(
                    paymentError?.message ||
                    t(
                        'credit.errors.paymentSave',
                        {
                            defaultValue:
                                isEnglish
                                    ? 'Unable to record the payment. Please try again.'
                                    : 'ثبت پرداخت انجام نشد. لطفاً دوباره تلاش کنید.',
                        }
                    )
                );

            }

        };


    // =======================================================
    // Submit Credit Sale
    // =======================================================

    const handleSubmitCredit =
        async (
            data
        ) => {

            try {

                setError('');


                const customerName =
                    data?.customerName?.trim() ||
                    '';


                const customerPhone =
                    data?.phone?.trim() ||
                    '';


                const productName =
                    data?.product?.trim() ||
                    '';


                const quantity =
                    Number(
                        data?.quantity
                    );


                const unitPrice =
                    Number(
                        data?.unitPrice
                    );


                if (!customerName) {

                    throw new Error(
                        t(
                            'credit.saleForm.errors.customerRequired',
                            {
                                defaultValue:
                                    isEnglish
                                        ? 'Please enter the customer name.'
                                        : 'لطفاً نام مشتری را وارد کنید.',
                            }
                        )
                    );

                }


                if (!productName) {

                    throw new Error(
                        t(
                            'credit.saleForm.errors.productRequired',
                            {
                                defaultValue:
                                    isEnglish
                                        ? 'Please select the product.'
                                        : 'لطفاً محصول را انتخاب کنید.',
                            }
                        )
                    );

                }


                if (
                    !Number.isFinite(
                        quantity
                    ) ||
                    quantity <= 0
                ) {

                    throw new Error(
                        t(
                            'credit.saleForm.errors.quantityRequired',
                            {
                                defaultValue:
                                    isEnglish
                                        ? 'Quantity must be greater than zero.'
                                        : 'تعداد باید بیشتر از صفر باشد.',
                            }
                        )
                    );

                }


                if (
                    !Number.isFinite(
                        unitPrice
                    ) ||
                    unitPrice < 0
                ) {

                    throw new Error(
                        t(
                            'credit.saleForm.errors.priceInvalid',
                            {
                                defaultValue:
                                    isEnglish
                                        ? 'Please enter a valid unit price.'
                                        : 'لطفاً قیمت واحد معتبر وارد کنید.',
                            }
                        )
                    );

                }


                await initializeDatabase();


                const products =
                    await db.products.toArray();


                const normalizedProductName =
                    productName
                        .trim()
                        .toLocaleLowerCase();


                const product =
                    products.find(
                        (
                            item
                        ) =>
                            String(
                                item.name ||
                                ''
                            )
                                .trim()
                                .toLocaleLowerCase() ===
                            normalizedProductName
                    );


                if (!product) {

                    throw new Error(
                        t(
                            'credit.errors.productNotFound',
                            {
                                defaultValue:
                                    isEnglish
                                        ? 'The selected product could not be found.'
                                        : 'محصول انتخاب‌شده پیدا نشد.',
                            }
                        )
                    );

                }


                const stock =
                    normalizeNumber(
                        product.stock
                    );


                if (
                    stock <
                    quantity
                ) {

                    throw new Error(
                        `${t(
                            'credit.errors.insufficientStock',
                            {
                                defaultValue:
                                    isEnglish
                                        ? 'Insufficient stock. Available quantity:'
                                        : 'موجودی محصول کافی نیست. موجودی فعلی:',
                            }
                        )} ${stock}`
                    );

                }


                await addSale({

                    productId:
                        product.id,

                    category:
                        product.category ||
                        '',

                    quantity,

                    unitPrice,

                    paymentType:
                        'credit',

                    customerName,

                    customerPhone,

                    date:
                        data?.date ||
                        new Date()
                            .toISOString(),

                });


                setShowCreditForm(
                    false
                );


                setError('');


                await loadCredits({
                    silent: true,
                });

            } catch (
                creditError
            ) {

                console.error(
                    'Failed to save credit sale:',
                    creditError
                );


                setError(
                    creditError?.message ||
                    t(
                        'credit.errors.saleSave',
                        {
                            defaultValue:
                                isEnglish
                                    ? 'Unable to record the credit sale. Please try again.'
                                    : 'ثبت فروش نسیه انجام نشد. لطفاً دوباره تلاش کنید.',
                        }
                    )
                );

            }

        };


    // =======================================================
    // Delete Customer
    // =======================================================

    const handleDeleteCustomer =
        (
            customer
        ) => {

            if (!customer) {
                return;
            }


            const remaining =
                normalizeNumber(
                    customer.remaining
                );


            if (
                remaining > 0
            ) {

                setError(
                    t(
                        'credit.errors.cannotDeleteWithDebt',
                        {
                            defaultValue:
                                isEnglish
                                    ? 'This customer still has an outstanding debt.'
                                    : 'این مشتری هنوز بدهی باقی‌مانده دارد.',
                        }
                    )
                );


                return;

            }


            setError('');


            setDeleteCustomer(
                customer
            );

        };


    const handleCloseDeleteModal =
        () => {

            if (deleting) {
                return;
            }


            setDeleteCustomer(
                null
            );

        };


    // =======================================================
    // Confirm Delete
    // =======================================================

    const handleConfirmDelete =
        async () => {

            if (
                !deleteCustomer ||
                deleting
            ) {

                return;

            }


            try {

                setDeleting(true);

                setError('');


                const customerId =
                    normalizeId(
                        deleteCustomer.customerId ??
                        deleteCustomer.id
                    );


                if (!customerId) {

                    throw new Error(
                        t(
                            'credit.errors.invalidCustomer',
                            {
                                defaultValue:
                                    isEnglish
                                        ? 'The selected customer is not valid.'
                                        : 'مشتری انتخاب‌شده معتبر نیست.',
                            }
                        )
                    );

                }


                await initializeDatabase();


                // ---------------------------------------------------
                // Read Current State
                // ---------------------------------------------------

                const [
                    customer,
                    creditSales,
                    creditPayments,
                ] = await Promise.all([

                    db.customers.get(
                        customerId
                    ),

                    db.creditSales
                        .where(
                            'customerId'
                        )
                        .equals(
                            customerId
                        )
                        .toArray(),

                    db.creditPayments
                        .where(
                            'customerId'
                        )
                        .equals(
                            customerId
                        )
                        .toArray(),

                ]);


                if (!customer) {

                    throw new Error(
                        t(
                            'credit.errors.invalidCustomer',
                            {
                                defaultValue:
                                    isEnglish
                                        ? 'The selected customer is not valid.'
                                        : 'مشتری انتخاب‌شده معتبر نیست.',
                            }
                        )
                    );

                }


                // ---------------------------------------------------
                // Verify Debt Is Fully Settled
                // ---------------------------------------------------

                const totalDebt =
                    creditSales.reduce(
                        (
                            sum,
                            record
                        ) =>
                            sum +
                            normalizeNumber(
                                record.amount
                            ),
                        0
                    );


                const totalPaid =
                    creditPayments.reduce(
                        (
                            sum,
                            record
                        ) =>
                            sum +
                            normalizeNumber(
                                record.amount
                            ),
                        0
                    );


                const remaining =
                    Math.max(
                        0,
                        totalDebt -
                            totalPaid
                    );


                if (
                    remaining > 0
                ) {

                    throw new Error(
                        t(
                            'credit.errors.cannotDeleteWithDebt',
                            {
                                defaultValue:
                                    isEnglish
                                        ? 'This customer still has an outstanding debt.'
                                        : 'این مشتری هنوز بدهی باقی‌مانده دارد.',
                            }
                        )
                    );

                }


                // ---------------------------------------------------
                // Preserve Historical Sales
                // ---------------------------------------------------

                const relatedSales =
                    await db.sales
                        .where(
                            'customerId'
                        )
                        .equals(
                            customerId
                        )
                        .toArray();


                // ---------------------------------------------------
                // Delete Account Safely
                // ---------------------------------------------------

                await db.transaction(
                    'rw',
                    db.customers,
                    db.creditSales,
                    db.creditPayments,
                    db.sales,
                    async () => {

                        for (
                            const sale of
                                relatedSales
                        ) {

                            await db.sales.update(
                                sale.id,
                                {
                                    customerId:
                                        null,
                                }
                            );

                        }


                        await db.creditPayments
                            .where(
                                'customerId'
                            )
                            .equals(
                                customerId
                            )
                            .delete();


                        await db.creditSales
                            .where(
                                'customerId'
                            )
                            .equals(
                                customerId
                            )
                            .delete();


                        await db.customers.delete(
                            customerId
                        );

                    }
                );


                // ---------------------------------------------------
                // Close UI
                // ---------------------------------------------------

                setDeleteCustomer(
                    null
                );


                setSelectedCustomer(
                    null
                );


                setShowDetails(
                    false
                );


                setShowPaymentModal(
                    false
                );


                // ---------------------------------------------------
                // Notify
                // ---------------------------------------------------

                [
                    'customers-updated',
                    'sales-updated',
                    'credit-sales-updated',
                    'credit-payments-updated',
                    'database-updated',
                ].forEach(
                    (
                        eventName
                    ) => {

                        window.dispatchEvent(
                            new Event(
                                eventName
                            )
                        );

                    }
                );


                await loadCredits({
                    silent: true,
                });

            } catch (
                deleteError
            ) {

                console.error(
                    'Failed to delete customer:',
                    deleteError
                );


                setError(
                    deleteError?.message ||
                    t(
                        'credit.errors.deleteCustomer',
                        {
                            defaultValue:
                                isEnglish
                                    ? 'Unable to delete the customer account. Please try again.'
                                    : 'حذف حساب مشتری انجام نشد. لطفاً دوباره تلاش کنید.',
                        }
                    )
                );

            } finally {

                setDeleting(false);

            }

        };


    // =======================================================
    // Customer Name
    // =======================================================

    const getCustomerName =
        () => {

            if (!deleteCustomer) {
                return '';
            }


            return (
                deleteCustomer.customerName ||
                deleteCustomer.name ||
                ''
            );

        };


    // =======================================================
    // Render
    // =======================================================

    return (

        <div
            dir={direction}

            className="
                relative
                min-w-0
                space-y-4
                sm:space-y-5
                lg:space-y-6
                pb-6
                text-[var(--text)]
            "
        >

            {/* =================================================
                Header
            ================================================== */}

            <section
                className="
                    relative
                    overflow-hidden

                    rounded-2xl

                    border
                    border-[var(--border-subtle)]

                    bg-[var(--surface)]

                    p-4

                    shadow-[var(--shadow-sm)]

                    transition-colors
                    duration-300

                    sm:p-5
                    md:p-6
                "
            >

                {/* Decorative Glow */}

                <div
                    aria-hidden="true"
                    className="
                        pointer-events-none

                        absolute
                        -start-16
                        -top-20

                        h-48
                        w-48

                        rounded-full

                        bg-amber-500/[0.06]

                        blur-3xl

                        dark:bg-amber-400/[0.055]
                    "
                />


                <div
                    aria-hidden="true"
                    className="
                        pointer-events-none

                        absolute
                        -end-16
                        -bottom-24

                        h-44
                        w-44

                        rounded-full

                        bg-cyan-500/[0.025]

                        blur-3xl

                        dark:bg-cyan-400/[0.035]
                    "
                />


                <div
                    className="
                        relative
                        z-10

                        flex
                        flex-col

                        gap-4

                        lg:flex-row
                        lg:items-center
                        lg:justify-between
                        lg:gap-6
                    "
                >

                    {/* Title */}

                    <div
                        className="
                            flex
                            min-w-0
                            items-center
                            gap-3
                            sm:gap-4
                        "
                    >

                        <div
                            className="
                                flex
                                h-11
                                w-11
                                shrink-0
                                items-center
                                justify-center

                                rounded-2xl

                                border
                                border-amber-500/15

                                bg-amber-500/10

                                shadow-[var(--shadow-xs)]

                                sm:h-12
                                sm:w-12
                            "
                        >

                            <CreditCard
                                size={21}
                                strokeWidth={2}
                                className="
                                    text-amber-500
                                "
                            />

                        </div>


                        <div
                            className="
                                min-w-0
                            "
                        >

                            <div
                                className="
                                    flex
                                    flex-wrap
                                    items-center
                                    gap-2
                                "
                            >

                                <h1
                                    className="
                                        text-xl
                                        font-bold
                                        tracking-tight
                                        text-[var(--text)]

                                        sm:text-2xl

                                        lg:text-[28px]
                                    "
                                >
                                    {
                                        t(
                                            'credit.page.title'
                                        )
                                    }
                                </h1>


                                <span
                                    className="
                                        inline-flex
                                        items-center

                                        rounded-lg

                                        border
                                        border-amber-500/15

                                        bg-amber-500/10

                                        px-2.5
                                        py-1

                                        text-[9px]
                                        font-bold

                                        text-amber-500

                                        sm:text-[10px]
                                    "
                                >
                                    {
                                        t(
                                            'credit.page.badge'
                                        )
                                    }
                                </span>

                            </div>


                            <p
                                className="
                                    mt-1

                                    max-w-2xl

                                    text-[11px]
                                    leading-5

                                    text-[var(--text-muted)]

                                    sm:text-xs
                                    sm:leading-6
                                "
                            >
                                {
                                    t(
                                        'credit.page.description'
                                    )
                                }
                            </p>

                        </div>

                    </div>


                    {/* Actions */}

                    <div
                        className="
                            flex
                            w-full
                            flex-col
                            gap-2

                            sm:flex-row
                            sm:items-center
                            sm:justify-end

                            lg:w-auto
                        "
                    >

                        {/* Debtors */}

                        <div
                            className="
                                order-3

                                inline-flex

                                min-h-11
                                w-full

                                items-center
                                justify-center
                                gap-2

                                rounded-xl

                                border
                                border-[var(--border)]

                                bg-[var(--surface-muted)]

                                px-3
                                py-2

                                sm:order-1
                                sm:w-auto
                                sm:min-w-[125px]
                            "
                        >

                            <div
                                className="
                                    flex
                                    h-7
                                    w-7
                                    shrink-0

                                    items-center
                                    justify-center

                                    rounded-lg

                                    bg-[var(--surface)]

                                    border
                                    border-[var(--border-subtle)]
                                "
                            >

                                <Users
                                    size={14}
                                    className="
                                        text-[var(--text-muted)]
                                    "
                                />

                            </div>


                            <span
                                className="
                                    text-[11px]
                                    font-medium
                                    text-[var(--text-secondary)]
                                "
                            >
                                {
                                    t(
                                        'credit.page.debtorCustomers'
                                    )
                                }
                            </span>


                            <span
                                dir="ltr"
                                className="
                                    text-sm
                                    font-bold
                                    number-font
                                    text-[var(--text)]
                                "
                            >
                                {
                                    statistics.debtorCount
                                }
                            </span>


                            <span
                                className="
                                    text-[10px]
                                    text-[var(--text-muted)]
                                "
                            >
                                {
                                    t(
                                        'credit.page.person'
                                    )
                                }
                            </span>

                        </div>


                        {/* Refresh */}

                        <button
                            type="button"
                            onClick={
                                handleRefresh
                            }
                            disabled={
                                loading ||
                                refreshing
                            }
                            className="
                                ui-button-secondary

                                order-2

                                min-h-11
                                w-full

                                px-3.5

                                sm:w-auto
                            "
                        >

                            <RefreshCw
                                size={15}
                                className={
                                    refreshing
                                        ? 'animate-spin'
                                        : ''
                                }
                            />

                            <span>
                                {
                                    refreshLabel
                                }
                            </span>

                        </button>


                        {/* New Credit */}

                        <button
                            type="button"
                            onClick={
                                handleOpenCreditForm
                            }
                            className="
                                ui-button-primary

                                group

                                order-1

                                min-h-11
                                w-full

                                rounded-xl

                                px-4

                                sm:order-3
                                sm:w-auto
                            "
                        >

                            <Plus
                                size={16}
                                strokeWidth={2.2}
                                className="
                                    transition-transform
                                    duration-200
                                    group-hover:rotate-90
                                "
                            />

                            <span>
                                {
                                    t(
                                        'credit.page.newCredit'
                                    )
                                }
                            </span>

                        </button>

                    </div>

                </div>

            </section>


            {/* =================================================
                Error
            ================================================= */}

            {error && (

                <div
                    role="alert"
                    className="
                        rounded-2xl

                        border
                        border-red-500/20

                        bg-red-500/[0.06]

                        px-4
                        py-3

                        text-xs
                        leading-5

                        text-[var(--danger)]

                        sm:text-sm
                    "
                >
                    {error}
                </div>

            )}


            {/* =================================================
                Stats
            ================================================= */}

            <CreditStats
                statistics={
                    statistics
                }

                loading={
                    loading
                }
            />


            {/* =================================================
                Filters
            ================================================= */}

            <CreditFilters
                filters={
                    filters
                }

                onChange={
                    handleFiltersChange
                }

                onReset={
                    handleResetFilters
                }
            />


            {/* =================================================
                Table
            ================================================= */}

            <CreditTable
                credits={
                    filteredCredits
                }

                filters={
                    filters
                }

                loading={
                    loading
                }

                onViewDetails={
                    handleViewDetails
                }

                onPayment={
                    handleOpenPayment
                }

                onDelete={
                    handleDeleteCustomer
                }
            />


            {/* =================================================
                Credit Sale Form
            ================================================= */}

            {showCreditForm && (

                <CreditSaleForm
                    onClose={
                        handleCloseCreditForm
                    }

                    onSubmit={
                        handleSubmitCredit
                    }
                />

            )}


            {/* =================================================
                Details
            ================================================= */}

            {showDetails &&
                selectedCustomer && (

                    <CreditDetails
                        customer={
                            selectedCustomer
                        }

                        onClose={
                            handleCloseDetails
                        }

                        onPayment={
                            handleOpenPayment
                        }
                    />

                )}


            {/* =================================================
                Payment
            ================================================= */}

            {showPaymentModal &&
                selectedCustomer && (

                    <CreditPaymentModal
                        customer={
                            selectedCustomer
                        }

                        onClose={
                            handleClosePayment
                        }

                        onSubmit={
                            handleSubmitPayment
                        }
                    />

                )}


            {/* =================================================
                Delete Confirmation Modal
            ================================================= */}

            {deleteCustomer && (

                <div
                    className="
                        fixed
                        inset-0

                        z-[200]

                        flex
                        items-center
                        justify-center

                        bg-slate-950/[0.28]
                        dark:bg-black/[0.50]

                        backdrop-blur-[18px]
                        backdrop-saturate-[0.72]

                        p-3
                        sm:p-4

                        animate-[profileBackdropIn_180ms_ease-out]
                    "

                    onMouseDown={
                        handleCloseDeleteModal
                    }

                    role="presentation"
                >

                    <div
                        className="
                            w-full
                            max-w-sm

                            overflow-hidden

                            rounded-2xl
                            sm:rounded-3xl

                            border
                            border-[var(--border)]

                            bg-[var(--surface)]

                            shadow-[var(--shadow-xl)]

                            animate-[profileModalIn_180ms_ease-out]
                        "

                        onMouseDown={
                            (event) =>
                                event.stopPropagation()
                        }

                        role="dialog"

                        aria-modal="true"

                        aria-labelledby="delete-credit-title"
                    >

                        {/* Modal Header */}

                        <div
                            className="
                                relative

                                overflow-hidden

                                border-b
                                border-[var(--border)]

                                px-4
                                py-4

                                sm:px-5
                                sm:py-5
                            "
                        >

                            <div
                                className="
                                    pointer-events-none

                                    absolute

                                    -end-10
                                    -top-10

                                    h-28
                                    w-28

                                    rounded-full

                                    bg-rose-500/10

                                    blur-2xl
                                "
                            />


                            <div
                                className="
                                    relative

                                    flex
                                    items-start

                                    gap-3
                                "
                            >

                                <div
                                    className="
                                        flex
                                        h-11
                                        w-11

                                        shrink-0

                                        items-center
                                        justify-center

                                        rounded-2xl

                                        border
                                        border-rose-500/10

                                        bg-rose-500/10
                                    "
                                >

                                    <Trash2
                                        size={19}
                                        className="
                                            text-rose-500
                                        "
                                    />

                                </div>


                                <div
                                    className="
                                        min-w-0
                                        flex-1
                                    "
                                >

                                    <h2
                                        id="delete-credit-title"
                                        className="
                                            text-sm
                                            font-bold
                                            text-[var(--text)]

                                            sm:text-base
                                        "
                                    >
                                        {
                                            t(
                                                'credit.table.delete.title',
                                                {
                                                    defaultValue:
                                                        isEnglish
                                                            ? 'Delete Customer Account'
                                                            : 'حذف حساب مشتری',
                                                }
                                            )
                                        }
                                    </h2>


                                    <p
                                        className="
                                            mt-1

                                            text-[11px]

                                            leading-5

                                            text-[var(--text-muted)]
                                        "
                                    >
                                        {
                                            t(
                                                'credit.table.delete.description',
                                                {
                                                    defaultValue:
                                                        isEnglish
                                                            ? 'This account is fully settled.'
                                                            : 'این حساب به‌طور کامل تسویه شده است.',
                                                }
                                            )
                                        }
                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* Modal Content */}

                        <div
                            className="
                                px-4
                                py-4

                                sm:px-5
                                sm:py-5
                            "
                        >

                            <div
                                className="
                                    rounded-2xl

                                    border
                                    border-rose-500/10

                                    bg-rose-500/5

                                    p-4
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center

                                        gap-2

                                        text-[10px]

                                        font-medium

                                        text-rose-500
                                    "
                                >

                                    <Trash2
                                        size={13}
                                    />

                                    <span>
                                        {
                                            t(
                                                'credit.table.delete.confirm',
                                                {
                                                    defaultValue:
                                                        isEnglish
                                                            ? 'Delete Account'
                                                            : 'حذف حساب',
                                                }
                                            )
                                        }
                                    </span>

                                </div>


                                <p
                                    className="
                                        mt-2

                                        text-sm
                                        leading-7

                                        text-[var(--text-secondary)]
                                    "
                                >
                                    {
                                        t(
                                            'credit.table.deleteConfirm',
                                            {
                                                customer:
                                                    getCustomerName(),

                                                defaultValue:
                                                    isEnglish
                                                        ? `Are you sure you want to delete “${getCustomerName()}”?`
                                                        : `آیا مطمئن هستید که حساب «${getCustomerName()}» حذف شود؟`,
                                            }
                                        )
                                    }
                                </p>


                                <p
                                    className="
                                        mt-2

                                        text-[10px]
                                        leading-5

                                        text-[var(--text-muted)]
                                    "
                                >
                                    {
                                        isEnglish
                                            ? 'The credit account and payment records will be removed. Sales history will be preserved.'
                                            : 'حساب نسیه و سوابق پرداخت حذف می‌شود، اما سابقه فروش حفظ خواهد شد.'
                                    }
                                </p>

                            </div>

                        </div>


                        {/* Modal Footer */}

                        <div
                            className="
                                flex
                                flex-col-reverse

                                gap-2

                                border-t
                                border-[var(--border)]

                                px-4
                                py-3

                                sm:flex-row
                                sm:justify-end

                                sm:px-5
                                sm:py-4
                            "
                        >

                            <button
                                type="button"
                                onClick={
                                    handleCloseDeleteModal
                                }
                                disabled={
                                    deleting
                                }
                                className="
                                    ui-button-secondary

                                    min-h-10
                                    w-full

                                    rounded-xl

                                    px-4

                                    disabled:cursor-not-allowed
                                    disabled:opacity-50

                                    sm:w-auto
                                "
                            >
                                {
                                    t(
                                        'credit.table.delete.cancel',
                                        {
                                            defaultValue:
                                                isEnglish
                                                    ? 'Cancel'
                                                    : 'انصراف',
                                        }
                                    )
                                }
                            </button>


                            <button
                                type="button"
                                onClick={
                                    handleConfirmDelete
                                }
                                disabled={
                                    deleting
                                }
                                className="
                                    inline-flex

                                    min-h-10
                                    w-full

                                    items-center
                                    justify-center

                                    gap-2

                                    rounded-xl

                                    border
                                    border-rose-500/15

                                    bg-rose-500

                                    px-4
                                    py-2.5

                                    text-xs
                                    font-bold

                                    text-white

                                    shadow-sm
                                    shadow-rose-500/20

                                    transition-all

                                    hover:bg-rose-600
                                    hover:shadow-md

                                    active:scale-[0.99]

                                    disabled:cursor-not-allowed
                                    disabled:opacity-60

                                    sm:w-auto
                                "
                            >

                                {deleting ? (

                                    <span
                                        className="
                                            h-4
                                            w-4

                                            animate-spin

                                            rounded-full

                                            border-2
                                            border-white/30
                                            border-t-white
                                        "
                                    />

                                ) : (

                                    <Trash2
                                        size={15}
                                    />

                                )}


                                <span>
                                    {
                                        deleting
                                            ? (
                                                isEnglish
                                                    ? 'Deleting...'
                                                    : 'در حال حذف...'
                                            )
                                            : t(
                                                'credit.table.delete.confirm',
                                                {
                                                    defaultValue:
                                                        isEnglish
                                                            ? 'Delete Account'
                                                            : 'حذف حساب',
                                                }
                                            )
                                    }
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