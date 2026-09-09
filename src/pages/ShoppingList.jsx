import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    AlertTriangle,
    ShoppingBasket,
    Plus,
    X,
    Trash2,
} from 'lucide-react';

import {
    useTranslation,
} from 'react-i18next';

import {
    addShoppingItem,
    getShoppingItems,
    updateShoppingItem,
    deleteShoppingItem,
} from '../database/db';

import ShoppingListStats
    from '../components/shopping-list/ShoppingListStats';

import ShoppingListFilters
    from '../components/shopping-list/ShoppingListFilters';

import ShoppingListTable
    from '../components/shopping-list/ShoppingListTable';

import ShoppingListForm
    from '../components/shopping-list/ShoppingListForm';

import ShoppingListDetails
    from '../components/shopping-list/ShoppingListDetails';


// =========================================================
// Shopping List Page
// =========================================================

function ShoppingList() {

    const {
        t,
        i18n,
    } = useTranslation();


    // =====================================================
    // Language
    // =====================================================

    const language =
        i18n.language || 'fa';


    const isEnglish =
        String(
            language
        )
            .toLowerCase()
            .startsWith('en');


    const direction =
        isEnglish
            ? 'ltr'
            : 'rtl';


    // =====================================================
    // Data
    // =====================================================

    const [
        items,
        setItems,
    ] = useState([]);


    // =====================================================
    // Loading / Saving / Error
    // =====================================================

    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        saving,
        setSaving,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState('');


    // =====================================================
    // Form
    // =====================================================

    const [
        showForm,
        setShowForm,
    ] = useState(false);


    const [
        editingItem,
        setEditingItem,
    ] = useState(null);


    // =====================================================
    // Details
    // =====================================================

    const [
        selectedItem,
        setSelectedItem,
    ] = useState(null);


    const [
        showDetails,
        setShowDetails,
    ] = useState(false);


    // =====================================================
    // Delete
    // =====================================================

    const [
        deleteItem,
        setDeleteItem,
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
        status,
        setStatus,
    ] = useState('all');


    const [
        priority,
        setPriority,
    ] = useState('all');


    // =====================================================
    // Sort Shopping Items
    // =====================================================

    const sortShoppingItems =
        useCallback(
            (list) => {

                return [
                    ...list,
                ].sort(
                    (
                        a,
                        b
                    ) => {

                        const aCompleted =
                            Boolean(
                                a.completed
                            );


                        const bCompleted =
                            Boolean(
                                b.completed
                            );


                        // Pending first

                        if (
                            aCompleted !==
                            bCompleted
                        ) {

                            return aCompleted
                                ? 1
                                : -1;

                        }


                        // Newest first

                        const aDate =
                            new Date(
                                a.createdAt || 0
                            ).getTime();


                        const bDate =
                            new Date(
                                b.createdAt || 0
                            ).getTime();


                        return (
                            bDate -
                            aDate
                        );

                    }
                );

            },
            []
        );


    // =====================================================
    // Load Items
    // =====================================================

    const loadItems =
        useCallback(
            async () => {

                try {

                    setLoading(
                        true
                    );

                    setError('');


                    const data =
                        await getShoppingItems();


                    const safeData =
                        Array.isArray(
                            data
                        )
                            ? data
                            : [];


                    setItems(
                        sortShoppingItems(
                            safeData
                        )
                    );

                } catch (
                    loadError
                ) {

                    console.error(
                        'Failed to load shopping items:',
                        loadError
                    );


                    setError(
                        loadError?.message ||
                        t(
                            'shoppingList.errors.load'
                        )
                    );

                } finally {

                    setLoading(
                        false
                    );

                }

            },
            [
                sortShoppingItems,
                t,
            ]
        );


    // =====================================================
    // Initial Load
    // =====================================================

    useEffect(() => {

        loadItems();

    }, [
        loadItems,
    ]);


    // =====================================================
    // Open Add Form
    // =====================================================

    const handleOpenAdd =
        () => {

            setError('');

            setEditingItem(
                null
            );

            setShowDetails(
                false
            );

            setSelectedItem(
                null
            );

            setShowForm(
                true
            );

        };


    // =====================================================
    // Edit
    // =====================================================

    const handleEdit =
        (item) => {

            if (!item) {
                return;
            }


            setError('');

            setShowDetails(
                false
            );

            setSelectedItem(
                null
            );

            setEditingItem(
                item
            );

            setShowForm(
                true
            );

        };


    // =====================================================
    // Close Form
    // =====================================================

    const handleCloseForm =
        () => {

            if (saving) {
                return;
            }


            setShowForm(
                false
            );

            setEditingItem(
                null
            );

        };


    // =====================================================
    // Submit
    // =====================================================

    const handleSubmit =
        async (
            itemData
        ) => {

            if (!itemData) {
                return;
            }


            try {

                setSaving(
                    true
                );

                setError('');


                const quantityValue =
                    Number(
                        itemData.quantity
                    );


                const preparedItem = {

                    name:
                        itemData.name?.trim() ||
                        '',

                    quantity:
                        quantityValue,

                    unit:
                        itemData.unit?.trim() ||
                        t(
                            'shoppingList.defaultUnit'
                        ),

                    category:
                        itemData.category?.trim() ||
                        '',

                    priority:
                        itemData.priority ||
                        'normal',

                    note:
                        itemData.note?.trim() ||
                        '',

                };


                // =================================================
                // Validation
                // =================================================

                if (
                    !preparedItem.name
                ) {

                    throw new Error(
                        t(
                            'shoppingList.errors.nameRequired'
                        )
                    );

                }


                if (
                    !Number.isFinite(
                        preparedItem.quantity
                    ) ||
                    preparedItem.quantity <= 0
                ) {

                    throw new Error(
                        t(
                            'shoppingList.errors.quantityInvalid'
                        )
                    );

                }


                const allowedPriorities = [
                    'low',
                    'normal',
                    'high',
                    'urgent',
                ];


                if (
                    !allowedPriorities.includes(
                        preparedItem.priority
                    )
                ) {

                    preparedItem.priority =
                        'normal';

                }


                // =================================================
                // Edit
                // =================================================

                if (editingItem) {

                    const updatedItem =
                        await updateShoppingItem(
                            editingItem.id,
                            preparedItem
                        );


                    if (!updatedItem) {

                        throw new Error(
                            t(
                                'shoppingList.errors.itemNotFoundAfterEdit'
                            )
                        );

                    }


                    setItems(
                        (previous) => {

                            const updatedList =
                                previous.map(
                                    (item) =>
                                        item.id ===
                                        updatedItem.id
                                            ? updatedItem
                                            : item
                                );


                            return sortShoppingItems(
                                updatedList
                            );

                        }
                    );

                }

                // =================================================
                // Add
                // =================================================

                else {

                    const newItem =
                        await addShoppingItem({

                            ...preparedItem,

                            completed:
                                false,

                        });


                    setItems(
                        (previous) =>
                            sortShoppingItems([
                                newItem,
                                ...previous,
                            ])
                    );

                }


                setShowForm(
                    false
                );

                setEditingItem(
                    null
                );

            } catch (
                saveError
            ) {

                console.error(
                    'Failed to save shopping item:',
                    saveError
                );


                setError(
                    saveError?.message ||
                    t(
                        'shoppingList.errors.save'
                    )
                );


                throw saveError;

            } finally {

                setSaving(
                    false
                );

            }

        };


    // =====================================================
    // Toggle Complete
    // =====================================================

    const handleToggleComplete =
        async (
            item
        ) => {

            if (!item) {
                return;
            }


            try {

                setError('');


                const updatedItem =
                    await updateShoppingItem(
                        item.id,
                        {
                            completed:
                                !Boolean(
                                    item.completed
                                ),
                        }
                    );


                if (!updatedItem) {

                    throw new Error(
                        t(
                            'shoppingList.errors.itemNotFound'
                        )
                    );

                }


                setItems(
                    (previous) => {

                        const updatedList =
                            previous.map(
                                (currentItem) =>
                                    currentItem.id ===
                                    updatedItem.id
                                        ? updatedItem
                                        : currentItem
                            );


                        return sortShoppingItems(
                            updatedList
                        );

                    }
                );


                if (
                    selectedItem?.id ===
                    updatedItem.id
                ) {

                    setSelectedItem(
                        updatedItem
                    );

                }

            } catch (
                toggleError
            ) {

                console.error(
                    'Failed to toggle shopping item:',
                    toggleError
                );


                setError(
                    toggleError?.message ||
                    t(
                        'shoppingList.errors.toggle'
                    )
                );

            }

        };


    // =====================================================
    // View Details
    // =====================================================

    const handleViewDetails =
        (item) => {

            if (!item) {
                return;
            }


            setError('');

            setSelectedItem(
                item
            );

            setShowDetails(
                true
            );

        };


    // =====================================================
    // Close Details
    // =====================================================

    const handleCloseDetails =
        () => {

            setShowDetails(
                false
            );

            setSelectedItem(
                null
            );

        };


    // =====================================================
    // Delete Request
    // =====================================================

    const handleDeleteRequest =
        (item) => {

            if (!item) {
                return;
            }


            setError('');

            setDeleteItem(
                item
            );

        };


    // =====================================================
    // Confirm Delete
    // =====================================================

    const handleConfirmDelete =
        async () => {

            if (
                !deleteItem ||
                deleting
            ) {

                return;

            }


            try {

                setDeleting(
                    true
                );

                setError('');


                await deleteShoppingItem(
                    deleteItem.id
                );


                setItems(
                    (previous) =>
                        previous.filter(
                            (item) =>
                                item.id !==
                                deleteItem.id
                        )
                );


                if (
                    selectedItem?.id ===
                    deleteItem.id
                ) {

                    setSelectedItem(
                        null
                    );

                    setShowDetails(
                        false
                    );

                }


                setDeleteItem(
                    null
                );

            } catch (
                deleteError
            ) {

                console.error(
                    'Failed to delete shopping item:',
                    deleteError
                );


                setError(
                    deleteError?.message ||
                    t(
                        'shoppingList.errors.delete'
                    )
                );

            } finally {

                setDeleting(
                    false
                );

            }

        };


    // =====================================================
    // Cancel Delete
    // =====================================================

    const handleCancelDelete =
        () => {

            if (deleting) {
                return;
            }


            setDeleteItem(
                null
            );

        };


    // =====================================================
    // Filtering
    // =====================================================

    const filteredItems =
        useMemo(
            () => {

                const query =
                    search
                        .trim()
                        .toLowerCase();


                return items.filter(
                    (item) => {

                        // =========================================
                        // Search
                        // =========================================

                        if (query) {

                            const name =
                                String(
                                    item.name || ''
                                ).toLowerCase();


                            const itemCategory =
                                String(
                                    item.category || ''
                                ).toLowerCase();


                            const note =
                                String(
                                    item.note || ''
                                ).toLowerCase();


                            const unit =
                                String(
                                    item.unit || ''
                                ).toLowerCase();


                            const matchesSearch =
                                name.includes(
                                    query
                                ) ||
                                itemCategory.includes(
                                    query
                                ) ||
                                note.includes(
                                    query
                                ) ||
                                unit.includes(
                                    query
                                );


                            if (
                                !matchesSearch
                            ) {

                                return false;

                            }

                        }


                        // =========================================
                        // Status
                        // =========================================

                        if (
                            status ===
                                'pending' &&
                            Boolean(
                                item.completed
                            )
                        ) {

                            return false;

                        }


                        if (
                            status ===
                                'completed' &&
                            !Boolean(
                                item.completed
                            )
                        ) {

                            return false;

                        }


                        // =========================================
                        // Priority
                        // =========================================

                        if (
                            priority !==
                                'all' &&
                            item.priority !==
                                priority
                        ) {

                            return false;

                        }


                        return true;

                    }
                );

            },
            [
                items,
                search,
                status,
                priority,
            ]
        );


    // =====================================================
    // Statistics
    // =====================================================

    const statistics =
        useMemo(
            () => {

                const total =
                    items.length;


                const pending =
                    items.filter(
                        (item) =>
                            !Boolean(
                                item.completed
                            )
                    ).length;


                const completed =
                    items.filter(
                        (item) =>
                            Boolean(
                                item.completed
                            )
                    ).length;


                const highPriority =
                    items.filter(
                        (item) =>
                            !Boolean(
                                item.completed
                            ) &&
                            (
                                item.priority ===
                                    'high' ||
                                item.priority ===
                                    'urgent'
                            )
                    ).length;


                return {

                    total,

                    pending,

                    completed,

                    highPriority,

                };

            },
            [
                items,
            ]
        );


    // =====================================================
    // Active Filters
    // =====================================================

    const hasFilters =
        Boolean(
            search.trim()
        ) ||
        status !== 'all' ||
        priority !== 'all';


    // =====================================================
    // Clear Filters
    // =====================================================

    const handleClearFilters =
        () => {

            setSearch('');

            setStatus(
                'all'
            );

            setPriority(
                'all'
            );

        };


    // =====================================================
    // Render
    // =====================================================

    return (

        <div
            dir={
                direction
            }

            className="
                min-h-full
                space-y-5
                pb-6
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

                        md:flex-row
                        md:items-center
                        md:justify-between
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

                            <ShoppingBasket
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
                                        'shoppingList.page.title'
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
                                        'shoppingList.page.description'
                                    )
                                }
                            </p>

                        </div>

                    </div>


                    {/* Add Button */}

                    <button
                        type="button"
                        onClick={
                            handleOpenAdd
                        }
                        className="
                            flex
                            h-11
                            w-full
                            items-center
                            justify-center
                            gap-2

                            rounded-xl

                            bg-emerald-500

                            px-5

                            text-sm
                            font-semibold
                            text-slate-950

                            shadow-lg
                            shadow-emerald-500/20

                            transition-all
                            duration-200

                            hover:bg-emerald-400

                            active:scale-[0.98]

                            md:w-auto
                        "
                    >

                        <Plus
                            size={17}
                        />

                        {
                            t(
                                'shoppingList.actions.add'
                            )
                        }

                    </button>

                </div>

            </section>


            {/* =================================================
                Error
            ================================================== */}

            {
                error && (

                    <div
                        role="alert"
                        className="
                            flex
                            items-start
                            gap-3

                            rounded-xl

                            border
                            border-rose-500/15

                            bg-rose-500/5

                            px-4
                            py-3

                            text-xs
                            leading-5

                            text-rose-600
                            dark:text-rose-400
                        "
                    >

                        <AlertTriangle
                            size={15}
                            className="
                                mt-0.5
                                shrink-0
                            "
                        />


                        <span>
                            {
                                error
                            }
                        </span>

                    </div>

                )
            }


            {/* =================================================
                Stats
            ================================================== */}

            <ShoppingListStats
                statistics={
                    statistics
                }
                items={
                    items
                }
            />


            {/* =================================================
                Filters
            ================================================== */}

            <ShoppingListFilters
                search={
                    search
                }
                status={
                    status
                }
                priority={
                    priority
                }
                onSearchChange={
                    setSearch
                }
                onStatusChange={
                    setStatus
                }
                onPriorityChange={
                    setPriority
                }
                onClearFilters={
                    handleClearFilters
                }
            />


            {/* =================================================
                Table
            ================================================== */}

            <ShoppingListTable
                items={
                    filteredItems
                }
                loading={
                    loading
                }
                hasFilters={
                    hasFilters
                }
                onViewDetails={
                    handleViewDetails
                }
                onEdit={
                    handleEdit
                }
                onDelete={
                    handleDeleteRequest
                }
                onToggleComplete={
                    handleToggleComplete
                }
            />


            {/* =================================================
                Form
            ================================================== */}

            {
                showForm && (

                    <ShoppingListForm
                        item={
                            editingItem
                        }
                        saving={
                            saving
                        }
                        onClose={
                            handleCloseForm
                        }
                        onSubmit={
                            handleSubmit
                        }
                    />

                )
            }


            {/* =================================================
                Details
            ================================================== */}

            {
                showDetails &&
                selectedItem && (

                    <ShoppingListDetails
                        item={
                            selectedItem
                        }
                        onClose={
                            handleCloseDetails
                        }
                        onEdit={
                            handleEdit
                        }
                        onDelete={
                            handleDeleteRequest
                        }
                        onToggleComplete={
                            handleToggleComplete
                        }
                    />

                )
            }


            {/* =================================================
                Delete Modal
            ================================================== */}

            {
                deleteItem && (

                    <div
                        dir={
                            direction
                        }

                        className="
                            fixed
                            inset-0
                            z-[90]

                            flex
                            items-center
                            justify-center

                            bg-slate-950/[0.22]

                            p-3

                            backdrop-blur-md

                            sm:p-4

                            dark:bg-black/[0.48]
                        "

                        onMouseDown={(
                            event
                        ) => {

                            if (
                                event.target ===
                                event.currentTarget
                            ) {

                                handleCancelDelete();

                            }

                        }}
                    >

                        <div
                            className="
                                relative

                                w-full
                                max-w-md

                                overflow-hidden

                                rounded-2xl

                                border
                                border-[var(--border)]

                                bg-[var(--surface)]/95

                                shadow-2xl
                                shadow-black/20

                                backdrop-blur-xl
                            "
                        >

                            <div
                                className="
                                    absolute
                                    inset-x-0
                                    top-0
                                    h-px
                                    bg-rose-500/60
                                "
                            />


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
                                                dark:text-rose-400
                                            "
                                        />

                                    </div>


                                    <div
                                        className="
                                            min-w-0
                                        "
                                    >

                                        <h3
                                            className="
                                                truncate
                                                text-sm
                                                font-semibold
                                                text-[var(--text-primary)]
                                            "
                                        >
                                            {
                                                t(
                                                    'shoppingList.deleteModal.title'
                                                )
                                            }
                                        </h3>


                                        <p
                                            className="
                                                mt-1
                                                text-[10px]
                                                text-[var(--text-muted)]
                                            "
                                        >
                                            {
                                                t(
                                                    'shoppingList.deleteModal.messageBefore'
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
                                        flex
                                        h-8
                                        w-8
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-lg
                                        text-[var(--text-muted)]
                                        transition-colors
                                        hover:bg-[var(--surface-muted)]
                                        hover:text-[var(--text-primary)]
                                        disabled:cursor-not-allowed
                                        disabled:opacity-40
                                    "
                                >

                                    <X
                                        size={16}
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
                                        border-rose-500/10
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
                                                        'shoppingList.deleteModal.messageBefore'
                                                    )
                                                }

                                                {' '}

                                                <span
                                                    className="
                                                        text-rose-500
                                                        dark:text-rose-400
                                                    "
                                                >
                                                    «
                                                    {
                                                        deleteItem.name
                                                    }
                                                    »
                                                </span>

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
                                                        'shoppingList.deleteModal.messageAfter'
                                                    )
                                                }
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            </div>


                            {/* Footer */}

                            <div
                                className="
                                    flex
                                    flex-col-reverse
                                    gap-2

                                    border-t
                                    border-[var(--border)]

                                    bg-[var(--surface-muted)]

                                    p-4

                                    sm:flex-row
                                    sm:justify-end
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
                                        h-10
                                        w-full
                                        sm:w-auto
                                    "
                                >
                                    {
                                        t(
                                            'shoppingList.deleteModal.cancel'
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
                                        h-10
                                        w-full
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
                                        shadow-rose-500/15

                                        transition-all
                                        duration-200

                                        hover:bg-rose-400

                                        disabled:cursor-not-allowed
                                        disabled:opacity-50

                                        sm:w-auto
                                    "
                                >

                                    {
                                        deleting
                                            ? (
                                                <>
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

                                                    {
                                                        t(
                                                            'shoppingList.deleteModal.deleting'
                                                        )
                                                    }
                                                </>
                                            )
                                            : (
                                                <>
                                                    <Trash2
                                                        size={15}
                                                    />

                                                    {
                                                        t(
                                                            'shoppingList.deleteModal.delete'
                                                        )
                                                    }
                                                </>
                                            )
                                    }

                                </button>

                            </div>

                        </div>

                    </div>

                )
            }

        </div>

    );

}


export default ShoppingList;