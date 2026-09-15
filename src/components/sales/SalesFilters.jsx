import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getCategories } from '../../database/db';

const DEFAULT_FILTERS = { search: '', category: 'all' };

const FIELD_CLASS = `
    h-11 w-full rounded-xl
    border border-[var(--input-border)] bg-[var(--input-bg)]
    text-sm text-[var(--text)]
    placeholder:text-[var(--text-soft)] outline-none
    focus:border-[var(--input-border-focus)]
    focus:shadow-[0_0_0_3px_var(--accent-soft-strong)]
    transition
`;

function SalesFilters({ filters = DEFAULT_FILTERS, onChange }) {
    const { t, i18n } = useTranslation();
    const isEnglish = i18n.language === 'en';

    const { search = '', category = 'all' } = filters;

    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                setLoadingCategories(true);
                const result = await getCategories();
                if (mounted) setCategories(Array.isArray(result) ? result : []);
            } catch (err) {
                console.error('Failed to load sales categories:', err);
                if (mounted) setCategories([]);
            } finally {
                if (mounted) setLoadingCategories(false);
            }
        };
        load();

        const onCats = () => load();
        const onDb = () => load();
        window.addEventListener('categories-updated', onCats);
        window.addEventListener('database-updated', onDb);

        return () => {
            mounted = false;
            window.removeEventListener('categories-updated', onCats);
            window.removeEventListener('database-updated', onDb);
        };
    }, []);

    const categoryOptions = useMemo(() => {
        const map = new Map();
        categories.forEach((item) => {
            const name = typeof item === 'object' && item !== null ? item.name : item;
            if (typeof name !== 'string') return;
            const clean = name.trim();
            if (!clean) return;
            const key = clean.toLowerCase();
            if (!map.has(key)) map.set(key, clean);
        });
        return [
            { value: 'all', label: t('sales.filters.allCategories') },
            ...Array.from(map.values()).map((name) => ({ value: name, label: name })),
        ];
    }, [categories, t, i18n.language]);

    const hasFilters = search.trim() !== '' || category !== 'all';

    const handleClear = () => onChange?.({ ...DEFAULT_FILTERS });

    return (
        <section dir={isEnglish ? 'ltr' : 'rtl'} className="ui-card relative overflow-hidden rounded-2xl p-4">
            <div className="mb-4 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
                <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)]">
                        <SlidersHorizontal size={16} className="text-[var(--accent-500)]" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-[var(--text)]">
                            {t('sales.filters.title')}
                        </h3>
                        <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                            {t('sales.filters.description')}
                        </p>
                    </div>
                </div>

                {hasFilters && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="flex shrink-0 items-center justify-center gap-1.5 self-start rounded-lg px-2.5 py-1.5 text-[11px] text-[var(--text-muted)] transition hover:bg-red-500/5 hover:text-red-500 min-[420px]:self-auto dark:hover:text-red-400"
                    >
                        <X size={13} />
                        {t('sales.filters.clear')}
                    </button>
                )}
            </div>

            {/* 2 columns: search + category */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="relative min-w-0">
                    <Search size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-soft)]" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => onChange?.({ ...filters, search: e.target.value })}
                        placeholder={t('sales.filters.searchPlaceholder')}
                        className={`${FIELD_CLASS} ps-10 pe-4`}
                    />
                </div>

                <div className="relative min-w-0">
                    <select
                        value={categoryOptions.some((item) => item.value === category) ? category : 'all'}
                        onChange={(e) => onChange?.({ ...filters, category: e.target.value })}
                        disabled={loadingCategories}
                        className={`${FIELD_CLASS} cursor-pointer appearance-none ps-4 pe-10 disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                        {categoryOptions.map((item) => (
                            <option key={item.value} value={item.value}>{item.label}</option>
                        ))}
                    </select>
                    <ChevronDown size={16} className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[var(--text-soft)]" />
                </div>
            </div>

            {hasFilters && (
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--border-subtle)] pt-4">
                    <span className="text-[10px] text-[var(--text-muted)]">
                        {t('sales.filters.activeFilters')}
                    </span>

                    {search.trim() !== '' && (
                        <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-[var(--accent-border)] bg-[var(--accent-soft)] px-2.5 py-1.5 text-[10px] text-[var(--accent-600)] dark:text-[var(--accent-300)]">
                            <Search size={11} className="shrink-0" />
                            <span className="max-w-[12rem] truncate">{search}</span>
                        </span>
                    )}

                    {category !== 'all' && (
                        <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2.5 py-1.5 text-[10px] text-[var(--text-muted)]">
                            {t('sales.filters.category')}
                            <span className="max-w-[10rem] truncate text-[var(--text-secondary)]">
                                {categoryOptions.find((item) => item.value === category)?.label || category}
                            </span>
                        </span>
                    )}
                </div>
            )}
        </section>
    );
}

export default SalesFilters;