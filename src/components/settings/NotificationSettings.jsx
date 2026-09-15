import { useEffect, useState } from 'react';
import {
    Bell,
    ShoppingCart,
    AlertTriangle,
    CreditCard,
    CheckCircle2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const NOTIFICATION_STORAGE_KEY =
    'app-notifications';

const DEFAULT_NOTIFICATIONS = {
    lowStock: true,
    newSale: true,
    credit: true,
    successfulActions: true,
};

const getSavedNotifications = () => {
    try {
        const raw = localStorage.getItem(
            NOTIFICATION_STORAGE_KEY
        );

        if (!raw) {
            return {
                ...DEFAULT_NOTIFICATIONS,
            };
        }

        const parsed = JSON.parse(raw);

        if (
            !parsed ||
            typeof parsed !== 'object' ||
            Array.isArray(parsed)
        ) {
            return {
                ...DEFAULT_NOTIFICATIONS,
            };
        }

        return {
            ...DEFAULT_NOTIFICATIONS,
            lowStock:
                parsed.lowStock !== false,
            newSale:
                parsed.newSale !== false,
            credit:
                parsed.credit !== false,
            successfulActions:
                parsed.successfulActions !== false,
        };
    } catch (error) {
        console.error(
            'Failed to load notification settings:',
            error
        );

        return {
            ...DEFAULT_NOTIFICATIONS,
        };
    }
};

function NotificationSettings() {
    const { t, i18n } =
        useTranslation();

    const isRtl =
        i18n.dir() === 'rtl';

    const [notifications, setNotifications] =
        useState(
            getSavedNotifications
        );

    useEffect(() => {
        try {
            localStorage.setItem(
                NOTIFICATION_STORAGE_KEY,
                JSON.stringify(
                    notifications
                )
            );
        } catch (error) {
            console.error(
                'Failed to save notification settings:',
                error
            );
        }
    }, [notifications]);

    const items = [
        {
            id: 'lowStock',
            title: t(
                'settings.notifications.items.lowStock.title'
            ),
            description: t(
                'settings.notifications.items.lowStock.description'
            ),
            icon: AlertTriangle,
            iconClass:
                'bg-amber-500/10 text-amber-500 dark:text-amber-400',
        },
        {
            id: 'newSale',
            title: t(
                'settings.notifications.items.newSale.title'
            ),
            description: t(
                'settings.notifications.items.newSale.description'
            ),
            icon: ShoppingCart,
            iconClass:
                'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400',
        },
        {
            id: 'credit',
            title: t(
                'settings.notifications.items.credit.title'
            ),
            description: t(
                'settings.notifications.items.credit.description'
            ),
            icon: CreditCard,
            iconClass:
                'bg-rose-500/10 text-rose-500 dark:text-rose-400',
        },
        {
            id: 'successfulActions',
            title: t(
                'settings.notifications.items.successfulActions.title'
            ),
            description: t(
                'settings.notifications.items.successfulActions.description'
            ),
            icon: CheckCircle2,
            iconClass:
                'bg-blue-500/10 text-blue-500 dark:text-blue-400',
        },
    ];

    const handleToggle = (id) => {
        setNotifications((current) => {
            const next = {
                ...current,
                [id]:
                    !Boolean(
                        current[id]
                    ),
            };

            try {
                localStorage.setItem(
                    NOTIFICATION_STORAGE_KEY,
                    JSON.stringify(next)
                );
            } catch (error) {
                console.error(
                    'Failed to save notification setting:',
                    error
                );
            }

            window.dispatchEvent(
                new CustomEvent(
                    'notification-settings-updated',
                    {
                        detail: {
                            id,
                            enabled:
                                next[id],
                        },
                    }
                )
            );

            return next;
        });
    };

    return (
        <section
            dir={i18n.dir()}
            className="ui-card overflow-hidden p-0"
        >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/10 bg-cyan-500/10">
                    <Bell
                        size={19}
                        className="text-cyan-500 dark:text-cyan-400"
                    />
                </div>

                <div className="min-w-0">
                    <h2 className="truncate text-base font-bold text-[var(--text-primary)]">
                        {t(
                            'settings.notifications.title'
                        )}
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                        {t(
                            'settings.notifications.description'
                        )}
                    </p>
                </div>
            </div>

            <div className="space-y-3 p-4 sm:p-6">
                {items.map((item) => {
                    const Icon =
                        item.icon;

                    const enabled =
                        Boolean(
                            notifications[
                                item.id
                            ]
                        );

                    const thumbPosition =
                        enabled
                            ? isRtl
                                ? 'right-1'
                                : 'left-6'
                            : isRtl
                              ? 'right-6'
                              : 'left-1';

                    return (
                        <div
                            key={item.id}
                            className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-3.5 transition-all duration-200 hover:border-[var(--border-strong)] hover:bg-[var(--surface)] sm:p-4"
                        >
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.iconClass}`}
                                >
                                    <Icon size={18} />
                                </div>

                                <div className="min-w-0">
                                    <p
                                        title={
                                            item.title
                                        }
                                        className="truncate text-sm font-semibold text-[var(--text-primary)]"
                                    >
                                        {
                                            item.title
                                        }
                                    </p>

                                    <p className="mt-1 line-clamp-2 text-[10px] leading-5 text-[var(--text-muted)]">
                                        {
                                            item.description
                                        }
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                role="switch"
                                aria-checked={
                                    enabled
                                }
                                aria-label={
                                    item.title
                                }
                                onClick={() =>
                                    handleToggle(
                                        item.id
                                    )
                                }
                                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft-strong)] ${
                                    enabled
                                        ? 'border-emerald-500 bg-emerald-500'
                                        : 'border-slate-300 bg-slate-200 dark:border-slate-700 dark:bg-slate-800'
                                }`}
                            >
                                <span
                                    className={`pointer-events-none absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200 ${thumbPosition}`}
                                />
                            </button>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default NotificationSettings;