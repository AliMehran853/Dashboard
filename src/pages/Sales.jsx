import {
    useState,
} from 'react';

import {
    Plus,
    ShoppingBag,
} from 'lucide-react';

import {
    useTranslation,
} from 'react-i18next';

import SalesStats
    from '../components/sales/SalesStats';

import SalesFilters
    from '../components/sales/SalesFilters';

import SalesTable
    from '../components/sales/SalesTable';

import SaleForm
    from '../components/sales/SaleForm';

import SaleDetails
    from '../components/sales/SaleDetails';


// =========================================================
// Sales Page
// =========================================================

function Sales() {

    const {
        t,
        i18n,
    } = useTranslation();


    // =====================================================
    // Sale Form
    // =====================================================

    const [
        isSaleFormOpen,
        setIsSaleFormOpen,
    ] = useState(false);


    // =====================================================
    // Selected Sale
    // =====================================================

    const [
        selectedSale,
        setSelectedSale,
    ] = useState(null);


    // =====================================================
    // Filters
    // =====================================================

    const [
        filters,
        setFilters,
    ] = useState({

        search:
            '',

        paymentType:
            'all',

        category:
            'all',

    });


    // =====================================================
    // Open Sale Form
    // =====================================================

    const handleOpenSaleForm = () => {

        setIsSaleFormOpen(
            true
        );

    };


    // =====================================================
    // Close Sale Form
    // =====================================================

    const handleCloseSaleForm = () => {

        setIsSaleFormOpen(
            false
        );

    };


    // =====================================================
    // View Sale Details
    // =====================================================

    const handleViewSale = (
        sale
    ) => {

        if (!sale) {
            return;
        }


        setSelectedSale(
            sale
        );

    };


    // =====================================================
    // Close Sale Details
    // =====================================================

    const handleCloseDetails = () => {

        setSelectedSale(
            null
        );

    };


    // =====================================================
    // Sale Success
    // =====================================================

    const handleSaleSuccess = () => {

        setIsSaleFormOpen(
            false
        );

    };


    // =====================================================
    // Render
    // =====================================================

    return (

        <div
            dir={i18n.dir()}

            className="
                min-h-full
                w-full
                min-w-0

                space-y-5

                sm:space-y-6

                pb-2

                text-[var(--text)]

                transition-colors
                duration-300
            "
        >

            {/* =================================================
                Header
            ================================================= */}

            <section
                className="
                    relative
                    overflow-hidden

                    rounded-2xl

                    border
                    border-[var(--border-subtle)]

                    p-4
                    sm:p-5
                    md:p-6

                    shadow-[var(--shadow-sm)]

                    transition-colors
                    duration-300
                "

                style={{
                    background: `
                        linear-gradient(
                            135deg,
                            var(--glass-active-tint),
                            var(--glass-active-tint-soft) 70%,
                            transparent 100%
                        ),
                        var(--surface)
                    `,
                }}
            >

                {/* Accent Glow */}

                <div
                    aria-hidden="true"

                    className="
                        pointer-events-none

                        absolute
                        -start-20
                        -top-20

                        h-52
                        w-52

                        rounded-full

                        bg-[var(--accent-soft-heavy)]

                        blur-3xl
                    "
                />


                {/* Secondary Ambient Glow */}

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

                        bg-[var(--accent-soft)]

                        blur-3xl
                    "
                />


                {/* Content */}

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

                    {/* Title */}

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
                                border-[var(--accent-border)]

                                bg-[var(--accent-soft)]

                                text-[var(--accent-500)]
                            "
                        >

                            <ShoppingBag
                                size={20}
                                strokeWidth={1.9}
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

                                        bg-[var(--accent-500)]

                                        shadow-[0_0_12px_var(--accent-glow)]
                                    "
                                />


                                <span
                                    className="
                                        text-[10px]
                                        font-medium

                                        uppercase
                                        tracking-[0.12em]

                                        text-[var(--accent-600)]
                                    "
                                >
                                    Taqwa
                                </span>

                            </div>


                            <h1
                                className="
                                    mt-1.5

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
                                        'sales.pageTitle'
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
                                        'sales.pageDescription'
                                    )
                                }
                            </p>

                        </div>

                    </div>


                    {/* Add Sale — ui-button-primary handles accent, gradient, glow */}

                    <button
                        type="button"

                        onClick={
                            handleOpenSaleForm
                        }

                        className="
                            ui-button-primary

                            group

                            w-full
                            sm:w-auto

                            px-5
                        "
                    >

                        <Plus
                            size={17}
                            strokeWidth={2.2}

                            className="
                                transition-transform
                                duration-300

                                group-hover:rotate-90
                            "
                        />


                        <span>
                            {
                                t(
                                    'sales.addSale'
                                )
                            }
                        </span>

                    </button>

                </div>

            </section>


            {/* =================================================
                Statistics
            ================================================= */}

            <SalesStats />


            {/* =================================================
                Filters
            ================================================= */}

            <SalesFilters
                filters={
                    filters
                }

                onChange={
                    setFilters
                }
            />


            {/* =================================================
                Sales Table
            ================================================= */}

            <SalesTable
                filters={
                    filters
                }

                onViewSale={
                    handleViewSale
                }
            />


            {/* =================================================
                Sale Form
            ================================================= */}

            {isSaleFormOpen && (

                <SaleForm
                    onClose={
                        handleCloseSaleForm
                    }

                    onSuccess={
                        handleSaleSuccess
                    }
                />

            )}


            {/* =================================================
                Sale Details
            ================================================= */}

            {selectedSale && (

                <SaleDetails
                    sale={
                        selectedSale
                    }

                    onClose={
                        handleCloseDetails
                    }
                />

            )}

        </div>

    );

}


export default Sales;