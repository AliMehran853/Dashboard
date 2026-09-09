
import {
    LayoutDashboard,
    ShoppingCart,
    CreditCard,
    Package,
    BarChart3,
    Settings,
} from 'lucide-react';


// =========================================================
// Main Navigation
// =========================================================

export const MAIN_NAVIGATION = [

    {
        labelKey: 'navigation.dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
    },

    {
        labelKey: 'navigation.sales',
        path: '/sales',
        icon: ShoppingCart,
    },

    {
        labelKey: 'navigation.creditSales',
        path: '/credit-sales',
        icon: CreditCard,
    },

    {
        labelKey: 'navigation.products',
        path: '/products',
        icon: Package,
    },

    {
        labelKey: 'navigation.reports',
        path: '/reports',
        icon: BarChart3,
    },

];


// =========================================================
// System Navigation
// =========================================================

export const SYSTEM_NAVIGATION = [

    {
        labelKey: 'navigation.settings',
        path: '/settings',
        icon: Settings,
    },

];
