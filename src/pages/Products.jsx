import { useEffect, useMemo, useState } from 'react';
import { Package, Plus, Loader2, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import ProductStats from '../components/products/ProductStats';
import ProductFilters from '../components/products/ProductFilters';
import ProductTable from '../components/products/ProductTable';
import ProductForm from '../components/products/ProductForm';
import ProductDetails from '../components/products/ProductDetails';

import {
    getProducts,
    getCategories,
    addProduct,
    updateProduct,
    deleteProduct,
} from '../database/db';

// =========================================================
// Helpers
// =========================================================

const toEnglishNumbers = (value) =>
    String(value ?? '')
        .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
        .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

// =========================================================
// Products Page
// =========================================================

function Products() {
    const { t, i18n } = useTranslation();

    const language = i18n.language || 'fa';
    const isEnglish = String(language).toLowerCase().startsWith('en');
    const direction = isEnglish ? 'ltr' : 'rtl';

    // =====================================================
    // Data
    // =====================================================

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);

    // =====================================================
    // Filters
    // =====================================================

    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [stockStatus, setStockStatus] = useState('all');

    // =====================================================
    // Modals
    // =====================================================

    const [formOpen, setFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [viewingProduct, setViewingProduct] = useState(null);
    const [deletingProduct, setDeletingProduct] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // =====================================================
    // Load Products & Categories
    // =====================================================

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                setLoading(true);
                setError('');

                const [productsData, categoriesData] = await Promise.all([
                    getProducts(),
                    getCategories(),
                ]);

                if (cancelled) return;

                setProducts(Array.isArray(productsData) ? productsData : []);
                setCategories(Array.isArray(categoriesData) ? categoriesData : []);
            } catch (err) {
                console.error('Failed to load products:', err);
                if (!cancelled) {
                    setProducts([]);
                    setError(t('products.errors.load', {
                        defaultValue: isEnglish
                            ? 'Failed to load products.'
                            : 'بارگذاری محصولات انجام نشد.',
                    }));
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [refreshKey, t, isEnglish]);

    // =====================================================
    // Filtered List
    // =====================================================

    const filteredProducts = useMemo(() => {
        const query = search.trim().toLowerCase();

        return products.filter((product) => {
            // Search
            if (query) {
                const name = String(product.name || '').toLowerCase();
                const id = String(product.id || '');
                if (!name.includes(query) && !id.includes(query)) return false;
            }

            // Category
            if (category !== 'all' && product.category !== category) return false;

            // Stock status
            if (stockStatus !== 'all') {
                const stock = Number(toEnglishNumbers(product.stock)) || 0;
                const minStock = Number(toEnglishNumbers(product.minStock)) || 0;

                if (stockStatus === 'out' && stock !== 0) return false;
                if (stockStatus === 'low' && !(stock > 0 && stock <= minStock)) return false;
                if (stockStatus === 'available' && stock <= minStock) return false;
            }

            return true;
        });
    }, [products, search, category, stockStatus]);

    // =====================================================
    // Handlers
    // =====================================================

    const handleAdd = () => {
        setEditingProduct(null);
        setFormOpen(true);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setViewingProduct(null);
        setFormOpen(true);
    };

    const handleView = (product) => {
        setViewingProduct(product);
    };

    const handleDeleteRequest = (product) => {
        setViewingProduct(null);
        setDeletingProduct(product);
    };

    const handleFormClose = () => {
        setFormOpen(false);
        setEditingProduct(null);
    };

    const handleFormSubmit = async (productData) => {
        if (editingProduct) {
            await updateProduct(editingProduct.id, productData);
        } else {
            await addProduct(productData);
        }
        handleFormClose();
        setRefreshKey((key) => key + 1);
    };

    const handleConfirmDelete = async () => {
        if (!deletingProduct || deleting) return;

        try {
            setDeleting(true);
            await deleteProduct(deletingProduct.id);
            setDeletingProduct(null);
            setRefreshKey((key) => key + 1);
        } catch (err) {
            console.error('Failed to delete product:', err);
        } finally {
            setDeleting(false);
        }
    };

    const handleClearFilters = () => {
        setSearch('');
        setCategory('all');
        setStockStatus('all');
    };

    // =====================================================
    // Render
    // =====================================================

    return (
        <div dir={direction} className="min-h-full space-y-5 pb-6 text-[var(--text-secondary)]">

            {/* ================= Header ================= */}
            <section className="ui-card-tint p-4 sm:p-5 md:p-6">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
                >
                    <div className="absolute -start-20 -top-20 h-52 w-52 rounded-full bg-[var(--accent-soft-heavy)] blur-3xl" />
                    <div className="absolute -end-16 -bottom-24 h-44 w-44 rounded-full bg-[var(--accent-soft)] blur-3xl" />
                </div>

                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent-500)]">
                            <Package size={20} strokeWidth={1.9} />
                        </div>

                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--accent-500)] shadow-[0_0_12px_var(--accent-glow)]" />
                                <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--accent-600)]">
                                    Taqwa
                                </span>
                            </div>

                            <h1 className="mt-2 truncate text-xl font-semibold tracking-[-0.02em] text-[var(--text)] sm:text-2xl lg:text-3xl">
                                {t('products.page.title')}
                            </h1>

                            <p className="mt-1.5 max-w-2xl text-xs leading-5 text-[var(--text-muted)] sm:text-sm">
                                {t('products.page.description')}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={loading}
                        className="ui-button-primary group w-full px-4 text-xs font-medium sm:w-auto"
                    >
                        <Plus size={15} />
                        {t('products.page.addProduct')}
                    </button>
                </div>
            </section>

            {/* ================= Error ================= */}
            {error && (
                <div
                    role="alert"
                    className="rounded-2xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-xs leading-5 text-red-500 dark:text-red-400 sm:text-sm"
                >
                    {error}
                </div>
            )}

            {/* ================= Stats ================= */}
            <ProductStats refreshKey={refreshKey} />

            {/* ================= Filters ================= */}
            <ProductFilters
                search={search}
                category={category}
                stockStatus={stockStatus}
                categories={categories}
                onSearchChange={setSearch}
                onCategoryChange={setCategory}
                onStockStatusChange={setStockStatus}
                onClearFilters={handleClearFilters}
            />

            {/* ================= Table ================= */}
            <ProductTable
                products={filteredProducts}
                loading={loading}
                onViewDetails={handleView}
                onEdit={handleEdit}
                onDelete={handleDeleteRequest}
            />

            {/* ================= Form Modal ================= */}
            {formOpen && (
                <ProductForm
                    product={editingProduct}
                    onClose={handleFormClose}
                    onSubmit={handleFormSubmit}
                />
            )}

            {/* ================= Details Modal ================= */}
            {viewingProduct && (
                <ProductDetails
                    product={viewingProduct}
                    onClose={() => setViewingProduct(null)}
                    onEdit={handleEdit}
                    onDelete={handleDeleteRequest}
                />
            )}

            {/* ================= Delete Confirmation ================= */}
            {deletingProduct && (
                <DeleteConfirm
                    product={deletingProduct}
                    loading={deleting}
                    isEnglish={isEnglish}
                    t={t}
                    onCancel={() => setDeletingProduct(null)}
                    onConfirm={handleConfirmDelete}
                />
            )}
        </div>
    );
}

// =========================================================
// Delete Confirmation
// =========================================================

function DeleteConfirm({ product, loading, isEnglish, t, onCancel, onConfirm }) {
    const handleOverlay = (event) => {
        if (event.target === event.currentTarget && !loading) onCancel?.();
    };

    return (
        <div
            dir={isEnglish ? 'ltr' : 'rtl'}
            onMouseDown={handleOverlay}
            className="fixed inset-0 z-[80] flex items-center justify-center p-3 backdrop-blur-[20px] sm:p-4"
            style={{
                background:
                    'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.45), rgba(0,0,0,0.62))',
            }}
        >
            <div className="ui-glass-tint relative w-full max-w-md overflow-hidden rounded-2xl border border-[var(--glass-border)] shadow-[var(--shadow-xl)]">
                <div className="flex items-start gap-3 border-b border-[var(--border-subtle)] px-5 py-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-rose-500/15 bg-rose-500/10">
                        <AlertTriangle size={19} className="text-rose-500 dark:text-rose-400" />
                    </div>

                    <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-[var(--text)]">
                            {t('products.delete.title', {
                                defaultValue: isEnglish
                                    ? 'Delete product'
                                    : 'حذف محصول',
                            })}
                        </h3>
                        <p className="mt-1 text-[11px] leading-5 text-[var(--text-muted)]">
                            {t('products.delete.message', {
                                name: product.name,
                                defaultValue: isEnglish
                                    ? `Are you sure you want to delete "${product.name}"? This action cannot be undone.`
                                    : `آیا از حذف «${product.name}» مطمئن هستید؟ این عملیات قابل بازگشت نیست.`,
                            })}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col-reverse gap-3 px-5 py-4 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="ui-button-secondary w-full sm:w-auto"
                    >
                        {t('products.delete.cancel', {
                            defaultValue: isEnglish ? 'Cancel' : 'انصراف',
                        })}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className="ui-button-danger w-full sm:w-auto"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={15} className="animate-spin" />
                                {t('products.delete.deleting', {
                                    defaultValue: isEnglish ? 'Deleting...' : 'در حال حذف...',
                                })}
                            </>
                        ) : (
                            t('products.delete.confirm', {
                                defaultValue: isEnglish ? 'Delete' : 'حذف',
                            })
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Products;