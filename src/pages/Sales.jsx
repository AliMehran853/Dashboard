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
            dir="auto"

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

                    bg-[var(--surface)]

                    p-4
                    sm:p-5
                    md:p-6

                    shadow-[var(--shadow-sm)]

                    transition-colors
                    duration-300
                "
            >

                {/* Background Glow */}

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


                <div
                    aria-hidden="true"

                    className="
                        pointer-events-none

                        absolute

                        -end-10
                        -bottom-24

                        h-48
                        w-48

                        rounded-full

                        bg-cyan-500/[0.035]

                        blur-3xl

                        dark:bg-cyan-400/[0.045]
                    "
                />


                {/* Content */}

                <div
                    className="
                        relative

                        flex
                        flex-col

                        gap-5

                        lg:flex-row
                        lg:items-center
                        lg:justify-between
                    "
                >

                    {/* Title */}

                    <div
                        className="
                            flex
                            min-w-0

                            items-start

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
                                border-[var(--accent-border)]

                                bg-[var(--accent-soft)]

                                text-[var(--accent-500)]

                                sm:h-14
                                sm:w-14
                            "
                        >

                            <ShoppingBag
                                size={22}
                                strokeWidth={1.8}

                                className="
                                    sm:hidden
                                "
                            />


                            <ShoppingBag
                                size={24}
                                strokeWidth={1.8}

                                className="
                                    hidden
                                    sm:block
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
                                        h-1.5
                                        w-1.5

                                        shrink-0

                                        rounded-full

                                        bg-[var(--accent-500)]

                                        shadow-[0_0_10px_var(--accent-glow)]
                                    "
                                />


                                <span
                                    className="
                                        text-[10px]
                                        font-medium

                                        tracking-[0.08em]
                                        uppercase

                                        text-[var(--accent-600)]
                                    "
                                >
                                    Sales
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
                                    md:text-3xl
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
                                    sm:mt-2

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


                    {/* Add Sale */}

                    <button
                        type="button"

                        onClick={
                            handleOpenSaleForm
                        }

                        className="
                            group

                            w-full
                            lg:w-auto

                            min-h-11

                            rounded-xl

                            border
                            border-[var(--accent-border)]

                            bg-[var(--accent-500)]

                            px-5
                            py-2.5

                            text-sm
                            font-medium

                            text-white

                            shadow-[var(--shadow-accent)]

                            flex
                            items-center
                            justify-center
                            gap-2

                            transition-all
                            duration-200

                            hover:bg-[var(--accent-600)]
                            hover:-translate-y-px

                            active:translate-y-0
                        "
                    >

                        <Plus
                            size={18}
                            strokeWidth={2}

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