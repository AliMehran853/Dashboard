import { useEffect, useState } from 'react';
import { Plus, Tag, Trash2, Loader2, FolderOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { addCategory, getCategories, deleteCategory } from '../../database/db';

const normalizeCategoryName = (name) =>
    String(name || '').trim().replace(/\s+/g, ' ');

function CategorySettings() {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.dir() === 'rtl';

    const [categories, setCategories] = useState([]);
    const [categoryName, setCategoryName] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadCategories = async () => {
        try {
            setLoading(true);
            setError('');
            const result = await getCategories();
            setCategories(Array.isArray(result) ? result : []);
        } catch (loadError) {
            console.error('Failed to load categories:', loadError);
            setError(loadError?.message || t('settings.categories.errors.load'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadCategories(); }, [t]);

    const handleAddCategory = async (event) => {
        event.preventDefault();
        const name = normalizeCategoryName(categoryName);

        if (!name) return setError(t('settings.categories.errors.nameRequired'));

        try {
            setSaving(true);
            setError('');
            setSuccess('');
            await addCategory(name);
            setCategoryName('');
            await loadCategories();
            setSuccess(t('settings.categories.messages.added'));
            window.dispatchEvent(new Event('categories-updated'));
        } catch (addError) {
            console.error('Failed to add category:', addError);
            setError(addError?.message || t('settings.categories.errors.add'));
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCategory = async (category) => {
        const confirmed = window.confirm(
            t('settings.categories.deleteConfirm', { name: category.name })
        );
        if (!confirmed) return;

        try {
            setDeletingId(category.id);
            setError('');
            setSuccess('');
            await deleteCategory(category.id);
            await loadCategories();
            setSuccess(t('settings.categories.messages.deleted'));
            window.dispatchEvent(new Event('categories-updated'));
        } catch (deleteError) {
            console.error('Failed to delete category:', deleteError);
            setError(deleteError?.message || t('settings.categories.errors.delete'));
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <section dir={i18n.dir()} className="ui-card overflow-hidden p-0">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/10 bg-emerald-500/10">
                    <Tag size={19} className="text-emerald-500 dark:text-emerald-400" />
                </div>
                <div className="min-w-0">
                    <h2 className="truncate text-base font-bold text-[var(--text-primary)]">
                        {t('settings.categories.title')}
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                        {t('settings.categories.description')}
                    </p>
                </div>
            </div>

            <div className="space-y-6 p-4 sm:p-6">
                {/* Add Category Form */}
                <form onSubmit={handleAddCategory} className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative min-w-0 flex-1">
                        <Tag
                            size={16}
                            className={`pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 text-[var(--text-muted)] ${isRtl ? 'right-3' : 'left-3'}`}
                        />
                        <input
                            type="text"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            placeholder={t('settings.categories.form.placeholder')}
                            dir={i18n.dir()}
                            disabled={saving}
                            className={`ui-input h-11 w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="ui-button-primary h-11 w-full sm:w-auto"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                        <span>{t('settings.categories.form.add')}</span>
                    </button>
                </form>

                {/* Messages */}
                {error && (
                    <StatusBanner tone="danger" message={error} />
                )}
                {success && (
                    <StatusBanner tone="success" message={success} />
                )}

                {/* List */}
                <div>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-[var(--text-primary)]">
                            {t('settings.categories.list.title')}
                        </p>
                        <span className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1 text-[10px] text-[var(--text-muted)]">
                            {categories.length} {t('settings.categories.list.count')}
                        </span>
                    </div>

                    {loading ? (
                        <div className="flex min-h-32 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]">
                            <Loader2 size={24} className="animate-spin text-[var(--accent-500)]" />
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-muted)] px-5 py-12 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-500/10">
                                <FolderOpen size={27} className="text-[var(--text-muted)]" />
                            </div>
                            <p className="mt-4 text-sm text-[var(--text-muted)]">
                                {t('settings.categories.list.empty')}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {categories.map((category) => (
                                <div
                                    key={category.id}
                                    className="group flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface)]"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)]">
                                            <Tag size={15} className="text-[var(--accent-500)]" />
                                        </div>
                                        <span
                                            title={category.name}
                                            className="block truncate text-sm font-medium text-[var(--text-primary)]"
                                        >
                                            {category.name}
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleDeleteCategory(category)}
                                        disabled={deletingId === category.id}
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[var(--text-muted)] transition hover:bg-rose-500/10 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:text-rose-400"
                                        title={t('settings.categories.actions.delete')}
                                        aria-label={t('settings.categories.actions.delete')}
                                    >
                                        {deletingId === category.id ? (
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
    );
}

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

export default CategorySettings;