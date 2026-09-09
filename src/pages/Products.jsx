import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    Plus,
    Package,
    Trash2,
    AlertTriangle,
    X,
} from 'lucide-react';

import {
    useTranslation,
} from 'react-i18next';

import ProductForm
    from '../components/products/ProductForm';

import ProductStats
    from '../components/products/ProductStats';

import ProductFilters
    from '../components/products/ProductFilters';

import ProductTable
    from '../components/products/ProductTable';

import ProductDetails
    from '../components/products/ProductDetails';

import {
    addProduct,
    getProducts,
    getCategories,
    deleteProduct,
    updateProduct,
} from '../database/db';


// =========================================================
// Products
// =========================================================

function Products() {

    const {
        t,
    } = useTranslation();


    // =====================================================
    // Data
    // =====================================================

    const [
        products,
        setProducts,
    ] = useState([]);


    const [
        categories,
        setCategories,
    ] = useState([]);


    // =====================================================
    // UI State
    // =====================================================

    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState('');


    const [
        refreshKey,
        setRefreshKey,
    ] = useState(0);


    // =====================================================
    // Form / Details
    // =====================================================

    const [
        showForm,
        setShowForm,
    ] = useState(false);


    const [
        showDetails,
        setShowDetails,
    ] = useState(false);


    const [
        selectedProduct,
        setSelectedProduct,
    ] = useState(null);


    const [
        editingProduct,
        setEditingProduct,
    ] = useState(null);


    // =====================================================
    // Delete
    // =====================================================

    const [
        productToDelete,
        setProductToDelete,
    ] = useState(null);


    const [
        deleting,
        setDeleting,
    ] = useState(false);


    // =====================================================
    // Filters
    // =====================================================

    const [
        search,
        setSearch,
    ] = useState('');


    const [
        category,
        setCategory,
    ] = useState('all');


    const [
        stockStatus,
        setStockStatus,
    ] = useState('all');


    // =====================================================
    // Load Products
    // =====================================================

    const loadProducts = async () => {

        try {

            setLoading(true);
            setError('');


            const data =
                await getProducts();


            setProducts(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (loadError) {

            console.error(
                'Failed to load products:',
                loadError
            );


            setError(
                t(
                    'products.error.load'
                )
            );

        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // Load Categories
    // =====================================================

    const loadCategories = async () => {

        try {

            const data =
                await getCategories();


            setCategories(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (loadError) {

            console.error(
                'Failed to load categories:',
                loadError
            );


            setCategories([]);

        }

    };


    // =====================================================
    // Initial Load
    // =====================================================

    useEffect(() => {

        loadProducts();
        loadCategories();

    }, []);


    // =====================================================
    // Refresh
    // =====================================================

    const refreshData = async () => {

        await Promise.all([
            loadProducts(),
            loadCategories(),
        ]);


        setRefreshKey(
            (current) =>
                current + 1
        );

    };


    // =====================================================
    // Add Product
    // =====================================================

    const handleOpenAdd = () => {

        setError('');
        setEditingProduct(null);
        setSelectedProduct(null);
        setShowDetails(false);
        setShowForm(true);

    };


    // =====================================================
    // Edit Product
    // =====================================================

    const handleEdit = (product) => {

        if (!product) {
            return;
        }


        setError('');
        setSelectedProduct(null);
        setShowDetails(false);
        setEditingProduct(product);
        setShowForm(true);

    };


    // =====================================================
    // Close Product Form
    // =====================================================

    const handleCloseForm = () => {

        setShowForm(false);
        setEditingProduct(null);

    };


    // =====================================================
    // Submit Product
    // =====================================================

    const handleSubmitProduct =
        async (product) => {

            try {

                setError('');


                if (editingProduct) {

                    await updateProduct(
                        editingProduct.id,
                        product
                    );

                } else {

                    await addProduct(
                        product
                    );

                }


                await refreshData();


                setShowForm(false);
                setEditingProduct(null);

            } catch (saveError) {

                console.error(
                    'Failed to save product:',
                    saveError
                );


                setError(
                    editingProduct
                        ? t(
                            'products.error.update'
                        )
                        : t(
                            'products.error.add'
                        )
                );


                throw saveError;

            }

        };


    // =====================================================
    // Request Delete
    // =====================================================

    const handleDelete = (product) => {

        if (!product) {
            return;
        }


        setError('');
        setShowDetails(false);
        setSelectedProduct(null);
        setProductToDelete(product);

    };


    // =====================================================
    // Cancel Delete
    // =====================================================

    const handleCancelDelete = () => {

        if (deleting) {
            return;
        }


        setProductToDelete(null);

    };


    // =====================================================
    // Confirm Delete
    // =====================================================

    const handleConfirmDelete =
        async () => {

            if (
                !productToDelete ||
                deleting
            ) {

                return;

            }


            try {

                setDeleting(true);
                setError('');


                await deleteProduct(
                    productToDelete.id
                );


                setProductToDelete(null);


                await refreshData();

            } catch (deleteError) {

                console.error(
                    'Failed to delete product:',
                    deleteError
                );


                setError(
                    t(
                        'products.error.delete'
                    )
                );

            } finally {

                setDeleting(false);

            }

        };


    // =====================================================
    // View Details
    // =====================================================

    const handleViewDetails = (
        product
    ) => {

        if (!product) {
            return;
        }


        setSelectedProduct(product);
        setShowDetails(true);

    };


    // =====================================================
    // Close Details
    // =====================================================

    const handleCloseDetails = () => {

        setShowDetails(false);
        setSelectedProduct(null);

    };


    // =====================================================
    // Clear Filters
    // =====================================================

    const handleClearFilters = () => {

        setSearch('');
        setCategory('all');
        setStockStatus('all');

    };


    // =====================================================
    // Filter Products
    // =====================================================

    const filteredProducts =
        useMemo(
            () => {

                const query =
                    search
                        .trim()
                        .toLowerCase();


                return products.filter(
                    (product) => {

                        if (query) {

                            const name =
                                String(
                                    product.name || ''
                                ).toLowerCase();


                            const productCategory =
                                String(
                                    product.category || ''
                                ).toLowerCase();


                            const description =
                                String(
                                    product.description || ''
                                ).toLowerCase();


                            const matchesSearch =
                                name.includes(query) ||
                                productCategory.includes(query) ||
                                description.includes(query);


                            if (!matchesSearch) {
                                return false;
                            }

                        }


                        if (
                            category !== 'all' &&
                            product.category !== category
                        ) {

                            return false;

                        }


                        const stock =
                            Number(
                                product.stock
                            ) || 0;


                        const minStock =
                            Number(
                                product.minStock
                            ) || 0;


                        if (
                            stockStatus === 'available' &&
                            (
                                stock === 0 ||
                                stock <= minStock
                            )
                        ) {

                            return false;

                        }


                        if (
                            stockStatus === 'low' &&
                            (
                                stock === 0 ||
                                stock > minStock
                            )
                        ) {

                            return false;

                        }


                        if (
                            stockStatus === 'out' &&
                            stock !== 0
                        ) {

                            return false;

                        }


                        return true;

                    }
                );

            },
            [
                products,
                search,
                category,
                stockStatus,
            ]
        );


    // =====================================================
    // Render
    // =====================================================

    return (

        <div
            className="
                min-h-full
                space-y-5
                pb-2
                text-[var(--text-secondary)]
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

                {/* Accent glow */}

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

                        bg-emerald-500/[0.06]

                        blur-3xl

                        dark:bg-emerald-400/[0.055]
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

                        flex
                        flex-col
                        gap-4

                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                    "
                >

                    <div
                        className="
                            flex
                            min-w-0
                            items-center
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

                                rounded-xl

                                border
                                border-emerald-500/10

                                bg-emerald-500/10
                            "
                        >

                            <Package
                                size={20}
                                className="
                                    text-emerald-500
                                    dark:text-emerald-400
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
                                    items-center
                                    gap-2
                                "
                            >

                                <span
                                    className="
                                        h-2
                                        w-2
                                        shrink-0
                                        rounded-full
                                        bg-emerald-500
                                        shadow-[0_0_12px_rgba(16,185,129,0.35)]
                                    "
                                />

                                <span
                                    className="
                                        text-[10px]
                                        font-medium
                                        uppercase
                                        tracking-[0.12em]
                                        text-emerald-600
                                        dark:text-emerald-400
                                    "
                                >
                                    Taqwa
                                </span>

                            </div>


                            <h1
                                className="
                                    mt-2

                                    truncate

                                    text-xl
                                    font-semibold
                                    tracking-[-0.02em]

                                    text-[var(--text)]

                                    sm:text-2xl
                                    lg:text-3xl
                                "
                            >
                                {
                                    t(
                                        'products.pageTitle'
                                    )
                                }
                            </h1>


                            <p
                                className="
                                    mt-1.5

                                    max-w-2xl

                                    text-xs
                                    leading-5

                                    text-[var(--text-muted)]

                                    sm:text-sm
                                "
                            >
                                {
                                    t(
                                        'products.pageDescription'
                                    )
                                }
                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        onClick={handleOpenAdd}
                        className="
                            ui-button-primary

                            w-full
                            sm:w-auto

                            !bg-emerald-500
                            hover:!bg-emerald-400
                        "
                    >

                        <Plus
                            size={17}
                        />

                        {
                            t(
                                'products.addProduct'
                            )
                        }

                    </button>

                </div>

            </section>


            {/* =================================================
                Error
            ================================================== */}

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
                Statistics
            ================================================== */}

            <ProductStats
                refreshKey={
                    refreshKey
                }
            />


            {/* =================================================
                Filters
            ================================================== */}

            <ProductFilters

                search={
                    search
                }

                category={
                    category
                }

                stockStatus={
                    stockStatus
                }

                categories={
                    categories
                }

                onSearchChange={
                    setSearch
                }

                onCategoryChange={
                    setCategory
                }

                onStockStatusChange={
                    setStockStatus
                }

                onClearFilters={
                    handleClearFilters
                }

            />


            {/* =================================================
                Table
            ================================================== */}

            <ProductTable

                products={
                    filteredProducts
                }

                loading={
                    loading
                }

                onViewDetails={
                    handleViewDetails
                }

                onEdit={
                    handleEdit
                }

                onDelete={
                    handleDelete
                }

            />


            {/* =================================================
                Product Form
            ================================================== */}

            {showForm && (

                <ProductForm

                    product={
                        editingProduct
                    }

                    onClose={
                        handleCloseForm
                    }

                    onSubmit={
                        handleSubmitProduct
                    }

                />

            )}


            {/* =================================================
                Product Details
            ================================================== */}

            {showDetails &&
                selectedProduct && (

                    <ProductDetails

                        product={
                            selectedProduct
                        }

                        onClose={
                            handleCloseDetails
                        }

                        onEdit={
                            handleEdit
                        }

                        onDelete={
                            handleDelete
                        }

                    />

                )}


            {/* =================================================
                Delete Modal
            ================================================== */}

            {productToDelete && (

                <div
                    className="
                        fixed
                        inset-0
                        z-[60]

                        flex
                        items-center
                        justify-center

                        bg-slate-950/[0.45]

                        p-3

                        backdrop-blur-[20px]

                        dark:bg-black/[0.58]

                        sm:p-4
                    "
                >

                    <div
                        className="
                            w-full
                            max-w-md

                            max-h-[calc(100vh-1.5rem)]

                            overflow-y-auto

                            rounded-2xl

                            border
                            border-[var(--border)]

                            bg-[var(--surface)]

                            shadow-2xl

                            sm:max-h-[calc(100vh-2rem)]
                        "
                    >

                        {/* Header */}

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                gap-3

                                border-b
                                border-[var(--border)]

                                px-4
                                py-4

                                sm:px-5
                            "
                        >

                            <div
                                className="
                                    flex
                                    min-w-0
                                    items-center
                                    gap-3
                                "
                            >

                                <div
                                    className="
                                        flex
                                        h-10
                                        w-10
                                        shrink-0
                                        items-center
                                        justify-center

                                        rounded-xl

                                        border
                                        border-rose-500/10

                                        bg-rose-500/10
                                    "
                                >

                                    <Trash2
                                        size={18}
                                        className="
                                            text-rose-500
                                        "
                                    />

                                </div>


                                <div
                                    className="
                                        min-w-0
                                    "
                                >

                                    <h2
                                        className="
                                            truncate
                                            text-sm
                                            font-semibold
                                            text-[var(--text-primary)]
                                        "
                                    >
                                        {
                                            t(
                                                'products.deleteModal.title'
                                            )
                                        }
                                    </h2>


                                    <p
                                        className="
                                            mt-1
                                            text-[10px]
                                            text-[var(--text-muted)]
                                        "
                                    >
                                        {
                                            t(
                                                'products.deleteModal.subtitle'
                                            )
                                        }
                                    </p>

                                </div>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    handleCancelDelete
                                }
                                disabled={
                                    deleting
                                }
                                className="
                                    ui-icon-button
                                    shrink-0
                                "
                            >

                                <X
                                    size={17}
                                />

                            </button>

                        </div>


                        {/* Content */}

                        <div
                            className="
                                p-4
                                sm:p-5
                            "
                        >

                            <div
                                className="
                                    rounded-xl

                                    border
                                    border-rose-500/15

                                    bg-rose-500/5

                                    p-4
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-start
                                        gap-3
                                    "
                                >

                                    <AlertTriangle
                                        size={17}
                                        className="
                                            mt-0.5
                                            shrink-0
                                            text-rose-500
                                            dark:text-rose-400
                                        "
                                    />


                                    <div
                                        className="
                                            min-w-0
                                        "
                                    >

                                        <p
                                            className="
                                                text-xs
                                                font-semibold
                                                text-[var(--text-primary)]
                                            "
                                        >
                                            {
                                                t(
                                                    'products.deleteModal.question'
                                                )
                                            }
                                        </p>


                                        <p
                                            className="
                                                mt-2
                                                text-[11px]
                                                leading-6
                                                text-[var(--text-muted)]
                                            "
                                        >

                                            {
                                                t(
                                                    'products.deleteModal.messageBefore'
                                                )
                                            }


                                            <span
                                                className="
                                                    mx-1
                                                    font-semibold
                                                    text-rose-500
                                                    dark:text-rose-400
                                                "
                                            >
                                                «
                                                {
                                                    productToDelete.name
                                                }
                                                »
                                            </span>


                                            {
                                                t(
                                                    'products.deleteModal.messageAfter'
                                                )
                                            }

                                        </p>

                                    </div>

                                </div>

                            </div>


                            <p
                                className="
                                    mt-4
                                    text-[10px]
                                    leading-5
                                    text-[var(--text-muted)]
                                "
                            >
                                {
                                    t(
                                        'products.deleteModal.warning'
                                    )
                                }
                            </p>

                        </div>


                        {/* Footer */}

                        <div
                            className="
                                flex
                                flex-col-reverse
                                gap-3

                                border-t
                                border-[var(--border)]

                                bg-[var(--surface-muted)]

                                px-4
                                py-4

                                sm:flex-row
                                sm:px-5
                            "
                        >

                            <button
                                type="button"
                                onClick={
                                    handleCancelDelete
                                }
                                disabled={
                                    deleting
                                }
                                className="
                                    ui-button-secondary
                                    flex-1
                                "
                            >
                                {
                                    t(
                                        'products.deleteModal.cancel'
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
                                    flex
                                    h-11
                                    flex-1
                                    items-center
                                    justify-center
                                    gap-2

                                    rounded-xl

                                    bg-rose-500

                                    px-4

                                    text-xs
                                    font-semibold
                                    text-white

                                    shadow-lg
                                    shadow-rose-500/10

                                    transition-all
                                    duration-200

                                    hover:bg-rose-400

                                    active:scale-[0.98]

                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
                            >

                                {deleting ? (

                                    <>

                                        <span
                                            className="
                                                h-4
                                                w-4
                                                rounded-full

                                                border-2
                                                border-white/30
                                                border-t-white

                                                animate-spin
                                            "
                                        />

                                        {
                                            t(
                                                'products.deleteModal.deleting'
                                            )
                                        }

                                    </>

                                ) : (

                                    <>

                                        <Trash2
                                            size={15}
                                        />

                                        {
                                            t(
                                                'products.deleteModal.delete'
                                            )
                                        }

                                    </>

                                )}

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}


export default Products;