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

import { useTranslation } from 'react-i18next';

import {
    addShoppingItem,
    getShoppingItems,
    updateShoppingItem,
    deleteShoppingItem,
} from '../database/db';

import ShoppingListStats from '../components/shopping-list/ShoppingListStats';
import ShoppingListFilters from '../components/shopping-list/ShoppingListFilters';
import ShoppingListTable from '../components/shopping-list/ShoppingListTable';
import ShoppingListForm from '../components/shopping-list/ShoppingListForm';
import ShoppingListDetails from '../components/shopping-list/ShoppingListDetails';

// =========================================================
// Shopping List Page
// =========================================================

function ShoppingList() {
    const { t, i18n } =
        useTranslation();

    const language =
        i18n.language || 'fa';

    const isEnglish = String(language)
        .toLowerCase()
        .startsWith('en');

    const direction = isEnglish
        ? 'ltr'
        : 'rtl';

    // Data
    const [items, setItems] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState('');

    // Modals
    const [showForm, setShowForm] =
        useState(false);

    const [editingItem, setEditingItem] =
        useState(null);

    const [selectedItem, setSelectedItem] =
        useState(null);

    const [showDetails, setShowDetails] =
        useState(false);

    const [deleteItem, setDeleteItem] =
        useState(null);

    const [deleting, setDeleting] =
        useState(false);

    // Filters
    const [search, setSearch] =
        useState('');

    const [status, setStatus] =
        useState('all');

    const [priority, setPriority] =
        useState('all');

    // =====================================================
    // Sort helper
    // =====================================================

    const sortShoppingItems =
        useCallback((list) => {
            return [...list].sort(
                (a, b) => {
                    const aCompleted =
                        Boolean(
                            a.completed
                        );

                    const bCompleted =
                        Boolean(
                            b.completed
                        );

                    if (
                        aCompleted !==
                        bCompleted
                    ) {
                        return aCompleted
                            ? 1
                            : -1;
                    }

                    const aDate =
                        new Date(
                            a.createdAt ||
                                0
                        ).getTime();

                    const bDate =
                        new Date(
                            b.createdAt ||
                                0
                        ).getTime();

                    return (
                        bDate - aDate
                    );
                }
            );
        }, []);

    // =====================================================
    // Load
    // =====================================================

    const loadItems =
        useCallback(async () => {
            try {
                setLoading(true);
                setError('');

                const data =
                    await getShoppingItems();

                setItems(
                    sortShoppingItems(
                        Array.isArray(data)
                            ? data
                            : []
                    )
                );
            } catch (loadError) {
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
                setLoading(false);
            }
        }, [
            sortShoppingItems,
            t,
        ]);

    useEffect(() => {
        loadItems();
    }, [loadItems]);

    // =====================================================
    // Handlers
    // =====================================================

    const handleOpenAdd = () => {
        setError('');
        setEditingItem(null);
        setShowDetails(false);
        setSelectedItem(null);
        setShowForm(true);
    };

    const handleEdit = (item) => {
        if (!item) return;

        setError('');
        setShowDetails(false);
        setSelectedItem(null);
        setEditingItem(item);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        if (saving) return;

        setShowForm(false);
        setEditingItem(null);
    };

    const handleSubmit = async (
        itemData
    ) => {
        if (!itemData) return;

        try {
            setSaving(true);
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

            if (!preparedItem.name) {
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

            const allowed = [
                'low',
                'normal',
                'high',
                'urgent',
            ];

            if (
                !allowed.includes(
                    preparedItem.priority
                )
            ) {
                preparedItem.priority =
                    'normal';
            }

            if (editingItem) {
                const updated =
                    await updateShoppingItem(
                        editingItem.id,
                        preparedItem
                    );

                if (!updated) {
                    throw new Error(
                        t(
                            'shoppingList.errors.itemNotFoundAfterEdit'
                        )
                    );
                }

                setItems((prev) =>
                    sortShoppingItems(
                        prev.map((it) =>
                            it.id ===
                            updated.id
                                ? updated
                                : it
                        )
                    )
                );
            } else {
                const newItem =
                    await addShoppingItem({
                        ...preparedItem,
                        completed:
                            false,
                    });

                setItems((prev) =>
                    sortShoppingItems([
                        newItem,
                        ...prev,
                    ])
                );
            }

            setShowForm(false);
            setEditingItem(null);
        } catch (saveError) {
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
            setSaving(false);
        }
    };

    const handleToggleComplete =
        async (item) => {
            if (!item) return;

            try {
                setError('');

                const updated =
                    await updateShoppingItem(
                        item.id,
                        {
                            completed:
                                !Boolean(
                                    item.completed
                                ),
                        }
                    );

                if (!updated) {
                    throw new Error(
                        t(
                            'shoppingList.errors.itemNotFound'
                        )
                    );
                }

                setItems((prev) =>
                    sortShoppingItems(
                        prev.map((cur) =>
                            cur.id ===
                            updated.id
                                ? updated
                                : cur
                        )
                    )
                );

                if (
                    selectedItem?.id ===
                    updated.id
                ) {
                    setSelectedItem(
                        updated
                    );
                }
            } catch (toggleError) {
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

    const handleViewDetails =
        (item) => {
            if (!item) return;

            setError('');
            setSelectedItem(item);
            setShowDetails(true);
        };

    const handleCloseDetails = () => {
        setShowDetails(false);
        setSelectedItem(null);
    };

    const handleDeleteRequest =
        (item) => {
            if (!item) return;

            setError('');
            setDeleteItem(item);
        };

    const handleConfirmDelete =
        async () => {
            if (
                !deleteItem ||
                deleting
            ) {
                return;
            }

            try {
                setDeleting(true);
                setError('');

                await deleteShoppingItem(
                    deleteItem.id
                );

                setItems((prev) =>
                    prev.filter(
                        (it) =>
                            it.id !==
                            deleteItem.id
                    )
                );

                if (
                    selectedItem?.id ===
                    deleteItem.id
                ) {
                    setSelectedItem(null);
                    setShowDetails(false);
                }

                setDeleteItem(null);
            } catch (deleteError) {
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
                setDeleting(false);
            }
        };

    const handleCancelDelete = () => {
        if (deleting) return;

        setDeleteItem(null);
    };

    // =====================================================
    // Filtered list
    // =====================================================

    const filteredItems =
        useMemo(() => {
            const query =
                search
                    .trim()
                    .toLowerCase();

            return items.filter(
                (item) => {
                    if (query) {
                        const fields = [
                            item.name,
                            item.category,
                            item.note,
                            item.unit,
                        ].map((v) =>
                            String(
                                v || ''
                            ).toLowerCase()
                        );

                        if (
                            !fields.some(
                                (v) =>
                                    v.includes(
                                        query
                                    )
                            )
                        ) {
                            return false;
                        }
                    }

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
        }, [
            items,
            search,
            status,
            priority,
        ]);

    const statistics =
        useMemo(() => {
            const total =
                items.length;

            const pending =
                items.filter(
                    (i) => !i.completed
                ).length;

            const completed =
                items.filter(
                    (i) =>
                        i.completed
                ).length;

            const highPriority =
                items.filter(
                    (i) =>
                        !i.completed &&
                        (
                            i.priority ===
                                'high' ||
                            i.priority ===
                                'urgent'
                        )
                ).length;

            return {
                total,
                pending,
                completed,
                highPriority,
            };
        }, [items]);

    const hasFilters =
        Boolean(search.trim()) ||
        status !== 'all' ||
        priority !== 'all';

    const handleClearFilters =
        () => {
            setSearch('');
            setStatus('all');
            setPriority('all');
        };

    // =====================================================
    // Render
    // =====================================================

    return (
        <div
            dir={direction}
            className="min-h-full space-y-5 pb-6 text-[var(--text-secondary)]"
        >
            {/* ================= Header ================= */}
            <section className="ui-card-tint p-4 sm:p-5 md:p-6">
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent-500)]">
                            <ShoppingBasket
                                size={20}
                                strokeWidth={1.9}
                            />
                        </div>

                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--accent-500)] shadow-[0_0_12px_var(--accent-glow)]" />

                                <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--accent-600)]">
                                    Taqwa
                                </span>
                            </div>

                            <h1 className="mt-2 truncate text-xl font-semibold tracking-[-0.02em] text-[var(--text)] sm:text-2xl lg:text-3xl">
                                {t(
                                    'shoppingList.page.title'
                                )}
                            </h1>

                            <p className="mt-1.5 max-w-2xl text-xs leading-5 text-[var(--text-muted)] sm:text-sm">
                                {t(
                                    'shoppingList.page.description'
                                )}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={
                            handleOpenAdd
                        }
                        className="ui-button-primary group w-full px-4 text-xs font-medium sm:w-auto"
                    >
                        <Plus size={15} />

                        {t(
                            'shoppingList.actions.add'
                        )}
                    </button>
                </div>
            </section>

            {/* ================= Error ================= */}
            {error && (
                <div
                    role="alert"
                    className="flex items-start gap-3 rounded-2xl border border-rose-500/15 bg-rose-500/5 px-4 py-3 text-xs leading-5 text-rose-600 dark:text-rose-400 sm:text-sm"
                >
                    <AlertTriangle
                        size={15}
                        className="mt-0.5 shrink-0"
                    />

                    <span>
                        {error}
                    </span>
                </div>
            )}

            <ShoppingListStats
                items={items}
            />

            <ShoppingListFilters
                search={search}
                status={status}
                priority={priority}
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

            <ShoppingListTable
                items={filteredItems}
                loading={loading}
                hasFilters={hasFilters}
                onViewDetails={
                    handleViewDetails
                }
                onEdit={handleEdit}
                onDelete={
                    handleDeleteRequest
                }
                onToggleComplete={
                    handleToggleComplete
                }
            />

            {showForm && (
                <ShoppingListForm
                    item={editingItem}
                    saving={saving}
                    onClose={
                        handleCloseForm
                    }
                    onSubmit={
                        handleSubmit
                    }
                />
            )}

            {showDetails &&
                selectedItem && (
                    <ShoppingListDetails
                        item={selectedItem}
                        onClose={
                            handleCloseDetails
                        }
                        onEdit={handleEdit}
                        onDelete={
                            handleDeleteRequest
                        }
                        onToggleComplete={
                            handleToggleComplete
                        }
                    />
                )}

            {/* ================= Delete Modal ================= */}
            {deleteItem && (
                <div
                    dir={direction}
                    className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/[0.22] p-3 backdrop-blur-md dark:bg-black/[0.48] sm:p-4"
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
                    <div className="ui-glass-tint relative w-full max-w-md overflow-hidden rounded-2xl border border-[var(--glass-border)] shadow-[var(--shadow-xl)]">
                        {/* Header */}
                        <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-4 sm:px-5">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-500/10 bg-rose-500/10">
                                    <Trash2
                                        size={18}
                                        className="text-rose-500 dark:text-rose-400"
                                    />
                                </div>

                                <div className="min-w-0">
                                    <h3 className="truncate text-sm font-semibold text-[var(--text)]">
                                        {t(
                                            'shoppingList.deleteModal.title'
                                        )}
                                    </h3>

                                    <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                                        {t(
                                            'shoppingList.deleteModal.messageBefore'
                                        )}
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
                                className="ui-icon-button h-8 w-8 shrink-0"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 sm:p-5">
                            <div className="rounded-xl border border-rose-500/10 bg-rose-500/5 p-4">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle
                                        size={17}
                                        className="mt-0.5 shrink-0 text-rose-500 dark:text-rose-400"
                                    />

                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-[var(--text-primary)]">
                                            {t(
                                                'shoppingList.deleteModal.messageBefore'
                                            )}{' '}

                                            <span className="text-rose-500 dark:text-rose-400">
                                                «
                                                {
                                                    deleteItem.name
                                                }
                                                »
                                            </span>
                                        </p>

                                        <p className="mt-2 text-[11px] leading-6 text-[var(--text-muted)]">
                                            {t(
                                                'shoppingList.deleteModal.messageAfter'
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex flex-col-reverse gap-2 border-t border-[var(--border-subtle)] bg-[var(--surface-muted)] p-4 sm:flex-row sm:justify-end sm:px-5">
                            <button
                                type="button"
                                onClick={
                                    handleCancelDelete
                                }
                                disabled={
                                    deleting
                                }
                                className="ui-button-secondary h-10 w-full sm:w-auto"
                            >
                                {t(
                                    'shoppingList.deleteModal.cancel'
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={
                                    handleConfirmDelete
                                }
                                disabled={
                                    deleting
                                }
                                className="ui-button-danger h-10 w-full sm:w-auto"
                            >
                                {deleting ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                                        {t(
                                            'shoppingList.deleteModal.deleting'
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <Trash2
                                            size={15}
                                        />

                                        {t(
                                            'shoppingList.deleteModal.delete'
                                        )}
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

export default ShoppingList;