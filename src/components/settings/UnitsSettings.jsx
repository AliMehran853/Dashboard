import { useEffect, useState } from 'react';
import {
    Ruler, Plus, Trash2, Loader2, FolderOpen, AlertTriangle, X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
    addUnit, getUnits, deleteUnit, UNIT_CATEGORIES,
} from '../../database/db';

const normalizeUnitName = (name) =>
    String(name || '').trim().replace(/\s+/g, ' ');

const INPUT_WITH_ICON_STYLE = {
    paddingInlineStart: '2.5rem',
    paddingInlineEnd: '1rem',
};

function UnitsSettings() {
    const { t, i18n } = useTranslation();
    const isEnglish = String(i18n.language || '').toLowerCase().startsWith('en');

    const [units, setUnits] = useState([]);
    const [unitName, setUnitName] = useState('');
    const [unitCategory, setUnitCategory] = useState('count');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);

    const loadUnits = async () => {
        try {
            setLoading(true);
            setError('');
            const result = await getUnits();
            setUnits(Array.isArray(result) ? result : []);
        } catch (loadError) {
            console.error('Failed to load units:', loadError);
            setError(loadError?.message || t('settings.units.errors.load', {
                defaultValue: isEnglish ? 'Failed to load units.' : 'دریافت واحدها انجام نشد.',
            }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadUnits(); }, [t, isEnglish]);

    const handleAddUnit = async (event) => {
        event.preventDefault();
        const name = normalizeUnitName(unitName);

        if (!name) {
            return setError(t('settings.units.errors.nameRequired', {
                defaultValue: isEnglish ? 'Unit name is required.' : 'نام واحد الزامی است.',
            }));
        }

        try {
            setSaving(true);
            setError('');
            setSuccess('');
            await addUnit(name, unitCategory);
            setUnitName('');
            await loadUnits();
            setSuccess(t('settings.units.messages.added', {
                defaultValue: isEnglish ? 'Unit added successfully.' : 'واحد با موفقیت اضافه شد.',
            }));
            window.dispatchEvent(new Event('units-updated'));
        } catch (addError) {
            console.error('Failed to add unit:', addError);
            setError(addError?.message || t('settings.units.errors.add', {
                defaultValue: isEnglish ? 'Failed to add unit.' : 'افزودن واحد انجام نشد.',
            }));
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteClick = (unit) => setDeleteTarget(unit);

    const handleCancelDelete = () => {
        if (deletingId) return;
        setDeleteTarget(null);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;

        try {
            setDeletingId(deleteTarget.id);
            setError('');
            setSuccess('');
            await deleteUnit(deleteTarget.id);
            await loadUnits();
            setSuccess(t('settings.units.messages.deleted', {
                defaultValue: isEnglish ? 'Unit deleted successfully.' : 'واحد با موفقیت حذف شد.',
            }));
            window.dispatchEvent(new Event('units-updated'));
            setDeleteTarget(null);
        } catch (deleteError) {
            console.error('Failed to delete unit:', deleteError);
            setError(deleteError?.message || t('settings.units.errors.delete', {
                defaultValue: isEnglish ? 'Failed to delete unit.' : 'حذف واحد انجام نشد.',
            }));
            setDeleteTarget(null);
        } finally {
            setDeletingId(null);
        }
    };

    const getCategoryLabel = (catValue) => {
        const cat = UNIT_CATEGORIES.find((c) => c.value === catValue);
        if (!cat) return catValue;
        return isEnglish ? cat.labelEn : cat.labelFa;
    };

    return (
        <>
            <section dir={i18n.dir()} className="ui-card overflow-hidden p-0">
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-4 sm:px-6 sm:py-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/10 bg-cyan-500/10">
                        <Ruler size={19} className="text-cyan-500 dark:text-cyan-400" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="truncate text-base font-bold text-[var(--text-primary)]">
                            {t('settings.units.title', {
                                defaultValue: isEnglish ? 'Units' : 'واحدهای اندازه‌گیری',
                            })}
                        </h2>
                        <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                            {t('settings.units.description', {
                                defaultValue: isEnglish
                                    ? 'Manage units used in products (piece, box, carton, kg, m², etc.)'
                                    : 'مدیریت واحدهای مورد استفاده در محصولات (عدد، بسته، کارتن، کیلو، متر مربع و ...)',
                            })}
                        </p>
                    </div>
                </div>

                <div className="space-y-6 p-4 sm:p-6">
                    {/* Add Form */}
                    <form onSubmit={handleAddUnit} className="flex flex-col gap-3 sm:flex-row">
                        <div className="relative min-w-0 flex-1">
                            <Ruler
                                size={16}
                                className="pointer-events-none absolute start-3 top-1/2 z-10 -translate-y-1/2 text-[var(--text-muted)]"
                            />
                            <input
                                type="text"
                                value={unitName}
                                onChange={(e) => setUnitName(e.target.value)}
                                placeholder={t('settings.units.form.placeholder', {
                                    defaultValue: isEnglish ? 'New unit name' : 'نام واحد جدید',
                                })}
                                dir={i18n.dir()}
                                disabled={saving}
                                style={INPUT_WITH_ICON_STYLE}
                                className="ui-input h-11 w-full"
                            />
                        </div>

                        <select
                            value={unitCategory}
                            onChange={(e) => setUnitCategory(e.target.value)}
                            disabled={saving}
                            className="ui-input h-11 min-w-0 cursor-pointer sm:w-44"
                        >
                            {UNIT_CATEGORIES.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {isEnglish ? cat.labelEn : cat.labelFa}
                                </option>
                            ))}
                        </select>

                        <button
                            type="submit"
                            disabled={saving}
                            className="ui-button-primary h-11 w-full sm:w-auto"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            <span>
                                {t('settings.units.form.add', {
                                    defaultValue: isEnglish ? 'Add' : 'افزودن',
                                })}
                            </span>
                        </button>
                    </form>

                    {/* Messages */}
                    {error && <StatusBanner tone="danger" message={error} />}
                    {success && <StatusBanner tone="success" message={success} />}

                    {/* List */}
                    <div>
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-[var(--text-primary)]">
                                {t('settings.units.list.title', {
                                    defaultValue: isEnglish ? 'Existing Units' : 'واحدهای موجود',
                                })}
                            </p>
                            <span className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1 text-[10px] text-[var(--text-muted)]">
                                {units.length} {t('settings.units.list.count', {
                                    defaultValue: isEnglish ? 'units' : 'واحد',
                                })}
                            </span>
                        </div>

                        {loading ? (
                            <div className="flex min-h-32 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]">
                                <Loader2 size={24} className="animate-spin text-[var(--accent-500)]" />
                            </div>
                        ) : units.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-muted)] px-5 py-12 text-center">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-500/10">
                                    <FolderOpen size={27} className="text-[var(--text-muted)]" />
                                </div>
                                <p className="mt-4 text-sm text-[var(--text-muted)]">
                                    {t('settings.units.list.empty', {
                                        defaultValue: isEnglish ? 'No units yet.' : 'هنوز واحدی وجود ندارد.',
                                    })}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {units.map((unit) => (
                                    <div
                                        key={unit.id}
                                        className="group flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-3 transition-all duration-200 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface)]"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)]">
                                                <Ruler size={15} className="text-[var(--accent-500)]" />
                                            </div>
                                            <div className="min-w-0">
                                                <span
                                                    title={unit.name}
                                                    className="block truncate text-sm font-medium text-[var(--text-primary)]"
                                                >
                                                    {unit.name}
                                                </span>
                                                <span className="mt-0.5 block truncate text-[10px] text-[var(--text-muted)]">
                                                    {getCategoryLabel(unit.category)}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleDeleteClick(unit)}
                                            disabled={deletingId === unit.id}
                                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[var(--text-muted)] transition hover:bg-rose-500/10 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:text-rose-400"
                                            title={t('settings.units.actions.delete', {
                                                defaultValue: isEnglish ? 'Delete unit' : 'حذف واحد',
                                            })}
                                            aria-label={t('settings.units.actions.delete', {
                                                defaultValue: isEnglish ? 'Delete unit' : 'حذف واحد',
                                            })}
                                        >
                                            {deletingId === unit.id ? (
                                                <Loader2 size={15} className="animate-spin" />
                                            ) : (
                                                <Trash2 size={15} />
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Delete Modal */}
            {deleteTarget && (
                <DeleteUnitModal
                    unit={deleteTarget}
                    isDeleting={deletingId === deleteTarget.id}
                    onCancel={handleCancelDelete}
                    onConfirm={handleConfirmDelete}
                    isEnglish={isEnglish}
                    t={t}
                    i18n={i18n}
                />
            )}
        </>
    );
}

// =========================================================
// Delete Modal
// =========================================================

function DeleteUnitModal({ unit, isDeleting, onCancel, onConfirm, isEnglish, t, i18n }) {
    useEffect(() => {
        const handleKey = (event) => {
            if (event.key === 'Escape' && !isDeleting) onCancel();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isDeleting, onCancel]);

    useEffect(() => {
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = previous; };
    }, []);

    const handleBackdropClick = (event) => {
        if (event.target === event.currentTarget && !isDeleting) onCancel();
    };

    return (
        <div
            dir={i18n.dir()}
            onMouseDown={handleBackdropClick}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/[0.32] p-3 backdrop-blur-md dark:bg-black/[0.55] sm:p-4 animate-[profileBackdropIn_180ms_ease-out]"
        >
            <div className="ui-card relative w-full max-w-md overflow-hidden p-0 animate-[profileModalIn_220ms_var(--ease-smooth)]">
                <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-4 sm:px-5">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-500/15 bg-rose-500/10">
                            <Trash2 size={18} className="text-rose-500 dark:text-rose-400" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-[var(--text-primary)]">
                                {t('settings.units.deleteModal.title', {
                                    defaultValue: isEnglish ? 'Delete Unit' : 'حذف واحد',
                                })}
                            </h3>
                            <p className="mt-0.5 truncate text-[10px] text-[var(--text-muted)]">
                                {t('settings.units.deleteModal.subtitle', {
                                    defaultValue: isEnglish ? 'Confirm deletion' : 'تأیید عملیات حذف',
                                })}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="ui-icon-button h-8 w-8 shrink-0 rounded-lg"
                        aria-label={t('common.closeMenu')}
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="p-4 sm:p-5">
                    <div className="rounded-xl border border-rose-500/15 bg-rose-500/[0.05] p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle size={17} className="mt-0.5 shrink-0 text-rose-500 dark:text-rose-400" />
                            <div className="min-w-0">
                                <p className="text-xs leading-6 text-[var(--text-secondary)]">
                                    {t('settings.units.deleteModal.message', {
                                        name: unit.name,
                                        defaultValue: isEnglish
                                            ? `Are you sure you want to delete the unit "${unit.name}"?`
                                            : `آیا از حذف واحد «${unit.name}» مطمئن هستید؟`,
                                    })}
                                </p>
                                <p className="mt-2 text-[11px] leading-5 text-[var(--text-muted)]">
                                    {t('settings.units.deleteModal.warning', {
                                        defaultValue: isEnglish
                                            ? 'This action cannot be undone.'
                                            : 'این عملیات قابل بازگشت نیست.',
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-[var(--border-subtle)] bg-[var(--surface-muted)] p-4 sm:flex-row sm:justify-end sm:px-5">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="ui-button-secondary h-10 w-full sm:w-auto"
                    >
                        {t('settings.units.deleteModal.cancel', {
                            defaultValue: isEnglish ? 'Cancel' : 'انصراف',
                        })}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="ui-button-danger h-10 w-full sm:w-auto"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 size={15} className="animate-spin" />
                                {t('settings.units.deleteModal.deleting', {
                                    defaultValue: isEnglish ? 'Deleting...' : 'در حال حذف...',
                                })}
                            </>
                        ) : (
                            <>
                                <Trash2 size={15} />
                                {t('settings.units.deleteModal.confirm', {
                                    defaultValue: isEnglish ? 'Delete' : 'حذف',
                                })}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// =========================================================
// Status Banner
// =========================================================

function StatusBanner({ tone, message }) {
    const classes = tone === 'success'
        ? 'border-emerald-500/15 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400'
        : 'border-rose-500/15 bg-rose-500/5 text-rose-600 dark:text-rose-400';

    return (
        <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm leading-5 ${classes}`}>
            <span>{message}</span>
        </div>
    );
}

export default UnitsSettings;