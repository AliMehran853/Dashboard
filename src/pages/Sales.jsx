import { useState } from 'react';
import { Plus, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SalesStats from '../components/sales/SalesStats';
import SalesFilters from '../components/sales/SalesFilters';
import SalesTable from '../components/sales/SalesTable';
import SaleForm from '../components/sales/SaleForm';
import SaleDetails from '../components/sales/SaleDetails';

function Sales() {
    const { t, i18n } = useTranslation();
    const [isSaleFormOpen, setIsSaleFormOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);
    const [filters, setFilters] = useState({ search: '', paymentType: 'all', category: 'all' });

    return (
        <div dir={i18n.dir()} className="min-h-full w-full min-w-0 space-y-5 sm:space-y-6 pb-2 text-[var(--text)]">
            {/* header — ui-card handles surface + border + hover */}
            <section className="ui-card relative overflow-hidden rounded-2xl p-4 sm:p-5 md:p-6">
                <div aria-hidden="true" className="pointer-events-none absolute -start-20 -top-20 h-52 w-52 rounded-full bg-[var(--accent-soft-heavy)] blur-3xl" />
                <div aria-hidden="true" className="pointer-events-none absolute -end-16 -bottom-24 h-44 w-44 rounded-full bg-[var(--accent-soft)] blur-3xl" />

                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent-500)]">
                            <ShoppingBag size={20} strokeWidth={1.9} />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--accent-500)] shadow-[0_0_12px_var(--accent-glow)]" />
                                <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--accent-600)]">Taqwa</span>
                            </div>
                            <h1 className="mt-1.5 truncate text-xl font-semibold tracking-[-0.02em] text-[var(--text)] sm:text-2xl lg:text-3xl">
                                {t('sales.pageTitle')}
                            </h1>
                            <p className="mt-1.5 max-w-2xl text-xs leading-5 text-[var(--text-muted)] sm:text-sm">
                                {t('sales.pageDescription')}
                            </p>
                        </div>
                    </div>

                    <button type="button" onClick={() => setIsSaleFormOpen(true)} className="ui-button-primary group w-full px-5 sm:w-auto">
                        <Plus size={17} strokeWidth={2.2} className="transition-transform duration-300 group-hover:rotate-90" />
                        <span>{t('sales.addSale')}</span>
                    </button>
                </div>
            </section>

            <SalesStats />
            <SalesFilters filters={filters} onChange={setFilters} />
            <SalesTable filters={filters} onViewSale={setSelectedSale} />

            {isSaleFormOpen && (
                <SaleForm onClose={() => setIsSaleFormOpen(false)} onSuccess={() => setIsSaleFormOpen(false)} />
            )}
            {selectedSale && (
                <SaleDetails sale={selectedSale} onClose={() => setSelectedSale(null)} />
            )}
        </div>
    );
}

export default Sales;