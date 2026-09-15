import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FIELD_CLASS = `
    w-full h-11 rounded-xl
    border border-[var(--input-border)]
    bg-[var(--input-bg)]
    text-sm text-[var(--text)]
    placeholder:text-[var(--text-soft)]
    outline-none
    focus:border-[var(--input-border-focus)]
    focus:shadow-[0_0_0_3px_var(--accent-soft-strong)]
    transition
`;

function ReportsFilters({
    search = '',
    period = 'week',
    paymentType = 'all',
    category = 'all',
    categories = [],
    onSearchChange,
    onPeriodChange,
    onPaymentTypeChange,
    onCategoryChange,
    onClearFilters,
}) {
    const { t, i18n } = useTranslation();

    const isRtl = i18n.dir() === 'rtl';

    const hasFilters =
        search.trim() !== '' ||
        period !== 'week' ||
        paymentType !== 'all' ||
        category !== 'all';

    const categoryOptions = [
        {
            value: 'all',
            label: t('reports.filters.category.all'),
        },
        ...categories
            .filter(Boolean)
            .map((item) => {
                if (
                    typeof item === 'object' &&
                    item !== null
                ) {
                    return {
                        value:
                            item.value ??
                            item.id ??
                            item.name ??
                            '',

                        label:
                            item.label ??
                            item.name ??
                            item.value ??
                            '',
                    };
                }

                return {
                    value: item,
                    label: item,
                };
            })
            .filter((item) => item.value),
    ];

    return (
        <section
            dir={i18n.dir()}
            className="group ui-card-tint p-4"
        >
            {/* ================= Header ================= */}
            <div className="ui-layer mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)]">
                        <SlidersHorizontal
                            size={16}
                            className="text-[var(--accent-500)]"
                        />
                    </div>

                    <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-[var(--text)]">
                            {t('reports.filters.title')}
                        </h3>

                        <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                            {t('reports.filters.description')}
                        </p>
                    </div>
                </div>

                {hasFilters && (
                    <button
                        type="button"
                        onClick={onClearFilters}
                        className="self-start shrink-0 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] text-[var(--text-muted)] transition hover:bg-red-500/5 hover:text-red-500 dark:hover:text-red-400 sm:self-auto"
                    >
                        <X size={13} />
                        {t('reports.filters.clear')}
                    </button>
                )}
            </div>

            {/* ================= Filters ================= */}
            <div className="ui-layer grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_repeat(3,minmax(140px,1fr))]">
                {/* Search */}
                <div className="relative min-w-0">
                    <Search
                        size={16}
                        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-[var(--text-soft)] ${
                            isRtl
                                ? 'right-3'
                                : 'left-3'
                        }`}
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(e) =>
                            onSearchChange?.(
                                e.target.value
                            )
                        }
                        placeholder={t(
                            'reports.filters.searchPlaceholder'
                        )}
                        dir={i18n.dir()}
                        className={`${FIELD_CLASS} ${
                            isRtl
                                ? 'pr-10 pl-3'
                                : 'pl-10 pr-3'
                        }`}
                    />
                </div>

                {/* Period */}
                <FilterSelect
                    value={period}
                    onChange={onPeriodChange}
                    options={[
                        {
                            value: 'all',
                            label: t(
                                'reports.filters.period.all'
                            ),
                        },
                        {
                            value: 'today',
                            label: t(
                                'reports.filters.period.today'
                            ),
                        },
                        {
                            value: 'week',
                            label: t(
                                'reports.filters.period.week'
                            ),
                        },
                        {
                            value: 'month',
                            label: t(
                                'reports.filters.period.month'
                            ),
                        },
                    ]}
                    direction={i18n.dir()}
                />

                {/* Payment */}
                <FilterSelect
                    value={paymentType}
                    onChange={onPaymentTypeChange}
                    options={[
                        {
                            value: 'all',
                            label: t(
                                'reports.filters.payment.all'
                            ),
                        },
                        {
                            value: 'cash',
                            label: t(
                                'reports.filters.payment.cash'
                            ),
                        },
                        {
                            value: 'credit',
                            label: t(
                                'reports.filters.payment.credit'
                            ),
                        },
                    ]}
                    direction={i18n.dir()}
                />

                {/* Category */}
                <FilterSelect
                    value={category}
                    onChange={onCategoryChange}
                    options={categoryOptions}
                    direction={i18n.dir()}
                />
            </div>

            {/* ================= Active Filters ================= */}
            {hasFilters && (
                <div className="ui-layer mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--border-subtle)] pt-4">
                    <span className="text-[10px] text-[var(--text-muted)]">
                        {t(
                            'reports.filters.activeFilters'
                        )}
                    </span>

                    {search.trim() !== '' && (
                        <Chip tone="accent">
                            <Search
                                size={11}
                                className="shrink-0"
                            />

                            <span className="max-w-[12rem] truncate">
                                {search}
                            </span>
                        </Chip>
                    )}

                    {period !== 'week' && (
                        <Chip>
                            {t(
                                'reports.filters.periodLabel'
                            )}

                            <span className="text-[var(--text-secondary)]">
                                {getSelectedLabel(
                                    [
                                        {
                                            value: 'all',
                                            label: t(
                                                'reports.filters.period.all'
                                            ),
                                        },
                                        {
                                            value: 'today',
                                            label: t(
                                                'reports.filters.period.today'
                                            ),
                                        },
                                        {
                                            value: 'week',
                                            label: t(
                                                'reports.filters.period.week'
                                            ),
                                        },
                                        {
                                            value: 'month',
                                            label: t(
                                                'reports.filters.period.month'
                                            ),
                                        },
                                    ],
                                    period
                                )}
                            </span>
                        </Chip>
                    )}

                    {paymentType !== 'all' && (
                        <Chip>
                            {t(
                                'reports.filters.paymentLabel'
                            )}

                            <span className="text-[var(--text-secondary)]">
                                {getSelectedLabel(
                                    [
                                        {
                                            value: 'all',
                                            label: t(
                                                'reports.filters.payment.all'
                                            ),
                                        },
                                        {
                                            value: 'cash',
                                            label: t(
                                                'reports.filters.payment.cash'
                                            ),
                                        },
                                        {
                                            value: 'credit',
                                            label: t(
                                                'reports.filters.payment.credit'
                                            ),
                                        },
                                    ],
                                    paymentType
                                )}
                            </span>
                        </Chip>
                    )}

                    {category !== 'all' && (
                        <Chip>
                            {t(
                                'reports.filters.categoryLabel'
                            )}

                            <span className="max-w-[10rem] truncate text-[var(--text-secondary)]">
                                {categoryOptions.find(
                                    (item) =>
                                        item.value ===
                                        category
                                )?.label ||
                                    category}
                            </span>
                        </Chip>
                    )}
                </div>
            )}
        </section>
    );
}

// =========================================================
// Small helpers
// =========================================================

function FilterSelect({
    value,
    onChange,
    options,
    direction,
}) {
    return (
        <div className="relative min-w-0">
            <select
                value={value}
                onChange={(event) =>
                    onChange?.(
                        event.target.value
                    )
                }
                dir={direction}
                className={`${FIELD_CLASS} appearance-none cursor-pointer px-3 ${
                    direction === 'rtl'
                        ? 'pl-10'
                        : 'pr-10'
                }`}
            >
                {options.map((item) => (
                    <option
                        key={item.value}
                        value={item.value}
                    >
                        {item.label}
                    </option>
                ))}
            </select>

            <ChevronDown
                size={16}
                className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[var(--text-soft)]"
            />
        </div>
    );
}

function getSelectedLabel(options, value) {
    return (
        options.find(
            (item) =>
                item.value === value
        )?.label || value
    );
}

function Chip({
    children,
    tone = 'muted',
}) {
    const cls =
        tone === 'accent'
            ? 'bg-[var(--accent-soft)] border-[var(--accent-border)] text-[var(--accent-600)] dark:text-[var(--accent-300)]'
            : 'bg-[var(--surface-muted)] border-[var(--border-subtle)] text-[var(--text-muted)]';

    return (
        <span
            className={`inline-flex max-w-full items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] ${cls}`}
        >
            {children}
        </span>
    );
}

export default ReportsFilters;