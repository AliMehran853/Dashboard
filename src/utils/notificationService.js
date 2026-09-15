import {
    db,
    initializeDatabase,
} from '../database/db';

// =========================================================
// Storage Keys
// =========================================================

export const NOTIFICATION_STORAGE_KEY =
    'app-notifications';

export const NOTIFICATION_READ_STORAGE_KEY =
    'app-notifications-read';

const SUCCESS_ACTION_STORAGE_KEY =
    'app-last-successful-action';

// =========================================================
// Default Settings
// =========================================================

const DEFAULT_NOTIFICATIONS = {
    lowStock: true,
    newSale: true,
    credit: true,
    successfulActions: true,
};

// =========================================================
// Notification Settings
// =========================================================

export const getNotificationSettings =
    () => {
        try {
            const raw =
                localStorage.getItem(
                    NOTIFICATION_STORAGE_KEY
                );

            if (!raw) {
                return {
                    ...DEFAULT_NOTIFICATIONS,
                };
            }

            const parsed =
                JSON.parse(raw);

            if (
                !parsed ||
                typeof parsed !==
                    'object' ||
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
                'Failed to read notification settings:',
                error
            );

            return {
                ...DEFAULT_NOTIFICATIONS,
            };
        }
    };

// =========================================================
// Read Notification IDs
// =========================================================

export const getReadNotificationIds =
    () => {
        try {
            const raw =
                localStorage.getItem(
                    NOTIFICATION_READ_STORAGE_KEY
                );

            if (!raw) {
                return [];
            }

            const parsed =
                JSON.parse(raw);

            if (
                !Array.isArray(parsed)
            ) {
                return [];
            }

            return [
                ...new Set(
                    parsed
                        .filter(
                            (id) =>
                                typeof id ===
                                    'string' ||
                                typeof id ===
                                    'number'
                        )
                        .map((id) =>
                            String(id)
                        )
                ),
            ];
        } catch (error) {
            console.error(
                'Failed to read notification read-state:',
                error
            );

            return [];
        }
    };

// =========================================================
// Save Read Notification IDs
// =========================================================

const saveReadNotificationIds = (
    ids
) => {
    try {
        const uniqueIds = [
            ...new Set(
                ids.map((id) =>
                    String(id)
                )
            ),
        ];

        const limitedIds =
            uniqueIds.slice(-200);

        localStorage.setItem(
            NOTIFICATION_READ_STORAGE_KEY,
            JSON.stringify(
                limitedIds
            )
        );

        window.dispatchEvent(
            new Event(
                'notifications-read-updated'
            )
        );
    } catch (error) {
        console.error(
            'Failed to save notification read-state:',
            error
        );
    }
};

// =========================================================
// Mark Notifications As Read
// =========================================================

export const markNotificationsAsRead =
    (
        notificationIds = []
    ) => {
        if (
            !Array.isArray(
                notificationIds
            ) ||
            notificationIds.length === 0
        ) {
            return [];
        }

        const currentIds =
            getReadNotificationIds();

        const nextIds = [
            ...currentIds,
            ...notificationIds.map(
                (id) => String(id)
            ),
        ];

        saveReadNotificationIds(
            nextIds
        );

        return nextIds;
    };

// =========================================================
// Mark All Current Notifications As Read
// =========================================================

export const markAllNotificationsAsRead =
    async () => {
        try {
            const notifications =
                await buildNotifications({
                    includeRead: true,
                });

            const unreadNotifications =
                notifications.filter(
                    (notification) =>
                        !notification.isRead
                );

            const ids =
                unreadNotifications.map(
                    (notification) =>
                        notification.id
                );

            markNotificationsAsRead(
                ids
            );

            return ids;
        } catch (error) {
            console.error(
                'Failed to mark notifications as read:',
                error
            );

            return [];
        }
    };

// =========================================================
// Clear Read State
// =========================================================

export const clearNotificationReadState =
    () => {
        try {
            localStorage.removeItem(
                NOTIFICATION_READ_STORAGE_KEY
            );

            window.dispatchEvent(
                new Event(
                    'notifications-read-updated'
                )
            );
        } catch (error) {
            console.error(
                'Failed to clear notification read-state:',
                error
            );
        }
    };

// =========================================================
// Amount Helper
// =========================================================

const getSaleAmount = (
    sale
) => {
    if (!sale) {
        return 0;
    }

    const directTotal =
        Number(sale.total);

    if (
        Number.isFinite(
            directTotal
        ) &&
        directTotal > 0
    ) {
        return directTotal;
    }

    const quantity =
        Number(
            sale.quantity
        ) || 0;

    const unitPrice =
        Number(
            sale.unitPrice
        ) || 0;

    return (
        quantity *
        unitPrice
    );
};

// =========================================================
// Date Helper
// =========================================================

const getTime = (
    value
) => {
    const time =
        new Date(
            value || 0
        ).getTime();

    return Number.isFinite(time)
        ? time
        : 0;
};

// =========================================================
// Successful Action
// =========================================================

export const recordSuccessfulAction =
    (
        action = 'action'
    ) => {
        try {
            const createdAt =
                new Date().toISOString();

            localStorage.setItem(
                SUCCESS_ACTION_STORAGE_KEY,
                JSON.stringify({
                    action: String(
                        action
                    ),
                    createdAt,
                })
            );

            window.dispatchEvent(
                new Event(
                    'successful-action-updated'
                )
            );
        } catch (error) {
            console.error(
                'Failed to save successful action:',
                error
            );
        }
    };

// =========================================================
// Get Successful Action
// =========================================================

const getSuccessfulAction = () => {
    try {
        const raw =
            localStorage.getItem(
                SUCCESS_ACTION_STORAGE_KEY
            );

        if (!raw) {
            return null;
        }

        const parsed =
            JSON.parse(raw);

        if (
            !parsed ||
            typeof parsed !==
                'object' ||
            Array.isArray(parsed)
        ) {
            return null;
        }

        if (!parsed.createdAt) {
            return null;
        }

        return parsed;
    } catch (error) {
        console.error(
            'Failed to read successful action:',
            error
        );

        return null;
    }
};

// =========================================================
// Database Data
// =========================================================

export const getNotificationData =
    async () => {
        await initializeDatabase();

        const products =
            await db.products.toArray();

        const sales =
            await db.sales.toArray();

        const creditSales =
            await db.creditSales.toArray();

        let creditPayments = [];

        const paymentTable =
            db.tables.find(
                (table) =>
                    table.name ===
                    'creditPayments'
            );

        if (paymentTable) {
            creditPayments =
                await paymentTable.toArray();
        }

        return {
            products,
            sales,
            creditSales,
            creditPayments,
        };
    };

// =========================================================
// Build Notifications
// =========================================================

export const buildNotifications =
    async (
        options = {}
    ) => {
        const {
            includeRead = false,
        } = options;

        const {
            products,
            sales,
            creditSales,
            creditPayments,
        } =
            await getNotificationData();

        const settings =
            getNotificationSettings();

        const readIds =
            new Set(
                getReadNotificationIds()
            );

        const notifications = [];

        // =================================================
        // Low Stock
        // =================================================

        if (settings.lowStock) {
            const lowStockProducts =
                products
                    .filter(
                        (product) => {
                            const stock =
                                Number(
                                    product.stock
                                ) || 0;

                            const minStock =
                                Number(
                                    product.minStock
                                ) || 0;

                            return (
                                stock <=
                                minStock
                            );
                        }
                    )
                    .sort(
                        (a, b) =>
                            (
                                Number(
                                    a.stock
                                ) || 0
                            ) -
                            (
                                Number(
                                    b.stock
                                ) || 0
                            )
                    );

            lowStockProducts
                .slice(0, 3)
                .forEach(
                    (product) => {
                        const stock =
                            Number(
                                product.stock
                            ) || 0;

                        const updatedAt =
                            product.updatedAt ||
                            product.createdAt ||
                            '';

                        const notificationId =
                            [
                                'low-stock',
                                product.id,
                                stock,
                                updatedAt,
                            ].join(':');

                        notifications.push({
                            id:
                                notificationId,

                            type:
                                'lowStock',

                            priority: 3,

                            productId:
                                product.id,

                            productName:
                                product.name ||
                                '',

                            stock,

                            createdAt:
                                updatedAt,

                            isRead:
                                readIds.has(
                                    notificationId
                                ),
                        });
                    }
                );
        }

        // =================================================
        // New Sales
        // =================================================

        if (settings.newSale) {
            const recentSales =
                [...sales]
                    .sort(
                        (a, b) =>
                            getTime(
                                b.date ||
                                b.createdAt
                            ) -
                            getTime(
                                a.date ||
                                a.createdAt
                            )
                    )
                    .slice(0, 5);

            recentSales.forEach(
                (sale) => {
                    const notificationId =
                        `sale-${sale.id}`;

                    notifications.push({
                        id:
                            notificationId,

                        type:
                            'newSale',

                        priority: 2,

                        saleId:
                            sale.id,

                        amount:
                            getSaleAmount(
                                sale
                            ),

                        paymentType:
                            sale.paymentType ||
                            'cash',

                        createdAt:
                            sale.date ||
                            sale.createdAt ||
                            null,

                        isRead:
                            readIds.has(
                                notificationId
                            ),
                    });
                }
            );
        }

        // =================================================
        // Credit
        // =================================================

        if (
            settings.credit &&
            creditSales.length > 0
        ) {
            const creditSaleById =
                new Map(
                    sales.map(
                        (sale) => [
                            sale.id,
                            sale,
                        ]
                    )
                );

            const paymentsByCustomer =
                new Map();

            creditPayments.forEach(
                (payment) => {
                    const customerId =
                        payment.customerId;

                    const amount =
                        Number(
                            payment.amount ??
                            payment.value ??
                            payment.paidAmount
                        ) || 0;

                    if (
                        !customerId ||
                        amount <= 0
                    ) {
                        return;
                    }

                    paymentsByCustomer.set(
                        customerId,
                        (
                            paymentsByCustomer.get(
                                customerId
                            ) || 0
                        ) + amount
                    );
                }
            );

            const debtByCustomer =
                new Map();

            creditSales.forEach(
                (creditSale) => {
                    const sale =
                        creditSaleById.get(
                            creditSale.saleId
                        );

                    if (!sale) {
                        return;
                    }

                    const customerId =
                        creditSale.customerId;

                    if (
                        customerId ===
                            null ||
                        customerId ===
                            undefined
                    ) {
                        return;
                    }

                    const amount =
                        getSaleAmount(
                            sale
                        );

                    if (amount <= 0) {
                        return;
                    }

                    debtByCustomer.set(
                        customerId,
                        (
                            debtByCustomer.get(
                                customerId
                            ) || 0
                        ) + amount
                    );
                }
            );

            debtByCustomer.forEach(
                (
                    totalCredit,
                    customerId
                ) => {
                    const paid =
                        paymentsByCustomer.get(
                            customerId
                        ) || 0;

                    const remaining =
                        Math.max(
                            0,
                            totalCredit -
                                paid
                        );

                    if (remaining <= 0) {
                        return;
                    }

                    const roundedRemaining =
                        Math.round(
                            remaining * 100
                        ) / 100;

                    const notificationId =
                        [
                            'credit',
                            customerId,
                            roundedRemaining,
                        ].join(':');

                    notifications.push({
                        id:
                            notificationId,

                        type:
                            'credit',

                        priority: 1,

                        customerId,

                        amount:
                            roundedRemaining,

                        createdAt: null,

                        isRead:
                            readIds.has(
                                notificationId
                            ),
                    });
                }
            );
        }

        // =================================================
        // Successful Action
        // =================================================

        if (
            settings.successfulActions
        ) {
            const successfulAction =
                getSuccessfulAction();

            if (successfulAction) {
                const actionCreatedAt =
                    successfulAction.createdAt ||
                    '';

                const notificationId =
                    [
                        'successful-action',
                        actionCreatedAt,
                    ].join(':');

                notifications.push({
                    id:
                        notificationId,

                    type:
                        'successfulActions',

                    priority: 4,

                    action:
                        successfulAction.action ||
                        'action',

                    createdAt:
                        actionCreatedAt,

                    isRead:
                        readIds.has(
                            notificationId
                        ),
                });
            }
        }

        // =================================================
        // Sort
        // =================================================

        const sorted =
            notifications.sort(
                (a, b) => {
                    const priorityDifference =
                        (
                            a.priority ||
                            99
                        ) -
                        (
                            b.priority ||
                            99
                        );

                    if (
                        priorityDifference !==
                        0
                    ) {
                        return priorityDifference;
                    }

                    return (
                        getTime(
                            b.createdAt
                        ) -
                        getTime(
                            a.createdAt
                        )
                    );
                }
            );

        // =================================================
        // Result
        // =================================================

        if (includeRead) {
            return sorted.slice(
                0,
                10
            );
        }

        return sorted
            .filter(
                (notification) =>
                    !notification.isRead
            )
            .slice(
                0,
                10
            );
    };

// =========================================================
// Unread Notifications
// =========================================================

export const getUnreadNotifications =
    async () => {
        return buildNotifications();
    };

// =========================================================
// Unread Count
// =========================================================

export const getUnreadNotificationCount =
    async () => {
        const unread =
            await getUnreadNotifications();

        return unread.length;
    };