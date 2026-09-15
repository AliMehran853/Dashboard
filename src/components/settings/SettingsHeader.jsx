import { Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function SettingsHeader() {
    const { t, i18n } = useTranslation();

    return (
        <section
            dir={i18n.dir()}
            className="ui-card-tint p-4 sm:p-5 md:p-6"
        >
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent-500)] sm:h-12 sm:w-12">
                    <Settings size={21} strokeWidth={1.9} />
                </div>

                <div className="min-w-0">
                    <h1 className="truncate text-xl font-semibold tracking-[-0.02em] text-[var(--text)] sm:text-2xl md:text-3xl">
                        {t('settings.page.title')}
                    </h1>

                    <p className="mt-1.5 max-w-2xl text-xs leading-5 text-[var(--text-muted)] sm:text-sm sm:leading-6">
                        {t('settings.page.description')}
                    </p>
                </div>
            </div>
        </section>
    );
}

export default SettingsHeader;