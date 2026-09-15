import { useRef, useState } from 'react';
import {
    DatabaseBackup,
    Download,
    Upload,
    ShieldCheck,
    FileJson,
    Loader2,
    CheckCircle2,
    AlertTriangle,
    HardDrive,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { db } from '../../database/db';

// =========================================================
// Constants
// =========================================================

const BACKUP_APP = 'Shop Dashboard';
const BACKUP_VERSION = '2.0.0';
const BACKUP_TYPE = 'shop-dashboard-full-backup';

// همه eventهای db.js — بعد از restore dispatch می‌شن
const DATABASE_EVENTS = [
    'products-updated',
    'categories-updated',
    'units-updated',
    'purchases-updated',
    'sales-updated',
    'credit-sales-updated',
    'credit-payments-updated',
    'customers-updated',
    'expenses-updated',
    'shopping-list-updated',
    'database-updated',
];

// =========================================================
// Helper functions
// =========================================================

const getLocalStorageData = () => {
    const data = {};

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (!key) continue;

        data[key] = localStorage.getItem(key);
    }

    return data;
};

const getDatabaseData = async () => {
    const tables = {};

    for (const table of db.tables) {
        tables[table.name] = await table.toArray();
    }

    return tables;
};

const downloadJsonFile = (json) => {
    const blob = new Blob([json], {
        type: 'application/json',
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;

    const date = new Date()
        .toISOString()
        .slice(0, 10);

    link.download = `shop-dashboard-backup-${date}.json`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
};

const validateBackup = (backup) => {
    if (!backup || typeof backup !== 'object') {
        return false;
    }

    if (backup.app !== BACKUP_APP) {
        return false;
    }

    if (backup.type !== BACKUP_TYPE) {
        return false;
    }

    if (
        !backup.database ||
        typeof backup.database !== 'object'
    ) {
        return false;
    }

    if (
        !backup.database.tables ||
        typeof backup.database.tables !== 'object'
    ) {
        return false;
    }

    if (
        !backup.localStorage ||
        typeof backup.localStorage !== 'object'
    ) {
        return false;
    }

    return true;
};

const restoreDatabase = async (tables) => {
    const currentTables = db.tables;

    const currentTableMap = new Map(
        currentTables.map((table) => [
            table.name,
            table,
        ])
    );

    const tablesToRestore = [];

    for (const table of currentTables) {
        const rows = tables[table.name];

        if (rows === undefined) {
            continue;
        }

        if (!Array.isArray(rows)) {
            throw new Error(
                `Invalid table data: ${table.name}`
            );
        }

        tablesToRestore.push({
            table: currentTableMap.get(table.name),
            rows,
        });
    }

    await db.transaction(
        'rw',
        ...currentTables,
        async () => {
            for (const table of currentTables) {
                await table.clear();
            }

            for (const item of tablesToRestore) {
                if (item.rows.length === 0) {
                    continue;
                }

                await item.table.bulkPut(item.rows);
            }
        }
    );
};

const restoreLocalStorage = (savedData) => {
    localStorage.clear();

    Object.entries(savedData).forEach(
        ([key, value]) => {
            localStorage.setItem(
                key,
                String(value ?? '')
            );
        }
    );
};

const dispatchDatabaseEvents = () => {
    DATABASE_EVENTS.forEach((name) => {
        try {
            window.dispatchEvent(new Event(name));
        } catch (err) {
            // ignore — some events may not have listeners
        }
    });
};

// =========================================================
// Backup Settings
// =========================================================

function BackupSettings() {
    const { t, i18n } = useTranslation();

    const [exporting, setExporting] = useState(false);
    const [importing, setImporting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const fileInputRef = useRef(null);

    const handleBackup = async () => {
        try {
            setExporting(true);
            setMessage('');
            setError('');

            const database = await getDatabaseData();

            const backup = {
                app: BACKUP_APP,
                type: BACKUP_TYPE,
                version: BACKUP_VERSION,
                createdAt: new Date().toISOString(),
                database: {
                    version: db.verno,
                    tables: database,
                },
                localStorage: getLocalStorageData(),
            };

            downloadJsonFile(
                JSON.stringify(backup, null, 4)
            );

            setMessage(
                t('settings.backup.messages.exportSuccess')
            );
        } catch (backupError) {
            console.error('Backup failed:', backupError);
            setError(
                t('settings.backup.errors.export')
            );
        } finally {
            setExporting(false);
        }
    };

    const handleChooseFile = () => {
        setMessage('');
        setError('');
        fileInputRef.current?.click();
    };

    const handleImport = async (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        try {
            setImporting(true);
            setMessage('');
            setError('');

            const text = await file.text();
            const backup = JSON.parse(text);

            if (!validateBackup(backup)) {
                throw new Error('Invalid backup file');
            }

            const confirmed = window.confirm(
                t('settings.backup.import.confirm')
            );

            if (!confirmed) return;

            await restoreDatabase(backup.database.tables);

            restoreLocalStorage(backup.localStorage);

            setMessage(
                t('settings.backup.messages.importSuccess')
            );

            // ✅ FIX: dispatch همه eventهای db.js
            dispatchDatabaseEvents();

            setTimeout(
                () => window.location.reload(),
                1200
            );
        } catch (importError) {
            console.error('Restore failed:', importError);
            setError(
                t('settings.backup.errors.import')
            );
        } finally {
            setImporting(false);
            event.target.value = '';
        }
    };

    return (
        <section
            dir={i18n.dir()}
            className="ui-card overflow-hidden p-0"
        >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/10 bg-cyan-500/10">
                    <DatabaseBackup
                        size={19}
                        className="text-cyan-500 dark:text-cyan-400"
                    />
                </div>

                <div className="min-w-0">
                    <h2 className="truncate text-base font-bold text-[var(--text-primary)]">
                        {t('settings.backup.title')}
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                        {t('settings.backup.description')}
                    </p>
                </div>
            </div>

            <div className="space-y-5 p-4 sm:p-6">
                {/* Security notice */}
                <div className="relative overflow-hidden rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-4">
                    <div className="pointer-events-none absolute -end-10 -top-10 h-28 w-28 rounded-full bg-emerald-500/10 blur-3xl" />

                    <div className="relative flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/10 bg-emerald-500/10">
                            <ShieldCheck
                                size={18}
                                className="text-emerald-500 dark:text-emerald-400"
                            />
                        </div>

                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                                {t('settings.backup.security.title')}
                            </p>

                            <p className="mt-1 text-xs leading-6 text-[var(--text-muted)]">
                                {t('settings.backup.security.description')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Operations */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {/* Export */}
                    <OperationCard
                        tone="emerald"
                        icon={Download}
                        title={t('settings.backup.export.title')}
                        description={t('settings.backup.export.description')}
                        buttonLabel={
                            exporting
                                ? t('settings.backup.export.preparing')
                                : t('settings.backup.export.button')
                        }
                        buttonIcon={exporting ? Loader2 : Download}
                        buttonClass="ui-button-primary"
                        spinning={exporting}
                        disabled={exporting || importing}
                        onClick={handleBackup}
                    />

                    {/* Import */}
                    <OperationCard
                        tone="cyan"
                        icon={Upload}
                        title={t('settings.backup.import.title')}
                        description={t('settings.backup.import.description')}
                        buttonLabel={
                            importing
                                ? t('settings.backup.import.restoring')
                                : t('settings.backup.import.button')
                        }
                        buttonIcon={importing ? Loader2 : Upload}
                        buttonClass="ui-button-secondary"
                        spinning={importing}
                        disabled={importing || exporting}
                        onClick={handleChooseFile}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json,application/json"
                            onChange={handleImport}
                            className="hidden"
                        />
                    </OperationCard>
                </div>

                {/* File format */}
                <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-500/10">
                        <FileJson
                            size={18}
                            className="text-[var(--text-muted)]"
                        />
                    </div>

                    <div className="min-w-0">
                        <p className="text-xs font-medium text-[var(--text-primary)]">
                            {t('settings.backup.fileFormat.label')}
                        </p>

                        <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                            JSON — Full Backup
                        </p>
                    </div>

                    <div className="ms-auto shrink-0">
                        <HardDrive
                            size={16}
                            className="text-[var(--text-muted)]"
                        />
                    </div>
                </div>

                {/* Messages */}
                {message && (
                    <StatusBanner
                        tone="success"
                        icon={CheckCircle2}
                        message={message}
                    />
                )}

                {error && (
                    <StatusBanner
                        tone="danger"
                        icon={AlertTriangle}
                        message={error}
                    />
                )}
            </div>
        </section>
    );
}

// =========================================================
// Sub-components
// =========================================================

function OperationCard({
    tone,
    icon: Icon,
    title,
    description,
    buttonLabel,
    buttonIcon: ButtonIcon,
    buttonClass,
    spinning,
    disabled,
    onClick,
    children,
}) {
    const toneMap = {
        emerald: {
            border: 'hover:border-emerald-500/20',
            iconWrap: 'border-emerald-500/10 bg-emerald-500/10',
            icon: 'text-emerald-500 dark:text-emerald-400',
            glow: 'bg-emerald-500/5',
        },
        cyan: {
            border: 'hover:border-cyan-500/20',
            iconWrap: 'border-cyan-500/10 bg-cyan-500/10',
            icon: 'text-cyan-500 dark:text-cyan-400',
            glow: 'bg-cyan-500/5',
        },
    };

    const styles = toneMap[tone];

    return (
        <div
            className={`group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 transition-all duration-300 sm:p-5 ${styles.border}`}
        >
            <div
                className={`pointer-events-none absolute -end-12 -top-12 h-32 w-32 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${styles.glow}`}
            />

            <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-start gap-3">
                    <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${styles.iconWrap}`}
                    >
                        <Icon size={20} className={styles.icon} />
                    </div>

                    <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                            {title}
                        </h3>

                        <p className="mt-1 text-xs leading-6 text-[var(--text-muted)]">
                            {description}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onClick}
                    disabled={disabled}
                    className={`${buttonClass} h-10 w-full sm:w-auto`}
                >
                    <ButtonIcon
                        size={16}
                        className={spinning ? 'animate-spin' : ''}
                    />
                    {buttonLabel}
                </button>

                {children}
            </div>
        </div>
    );
}

function StatusBanner({ tone, icon: Icon, message }) {
    const classes =
        tone === 'success'
            ? 'border-emerald-500/15 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400'
            : 'border-rose-500/15 bg-rose-500/5 text-rose-600 dark:text-rose-400';

    return (
        <div
            role={tone === 'success' ? 'status' : 'alert'}
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm leading-5 ${classes}`}
        >
            <Icon size={17} className="mt-0.5 shrink-0" />
            <span>{message}</span>
        </div>
    );
}

export default BackupSettings;