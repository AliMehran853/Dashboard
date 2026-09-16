import { useEffect, useState } from 'react';
import { LogOut, Store, ShoppingBasket, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { MAIN_NAVIGATION, SYSTEM_NAVIGATION } from '../../constants/navigation';

const STORE_SETTINGS_KEY = 'storeSettings';

const getStoredStoreName = () => {
    try {
        const storedSettings = localStorage.getItem(STORE_SETTINGS_KEY);
        if (!storedSettings) return '';

        const parsedSettings = JSON.parse(storedSettings);
        if (!parsedSettings || typeof parsedSettings !== 'object') return '';

        const storeName = typeof parsedSettings.storeName === 'string' ? parsedSettings.storeName.trim() : '';
        return storeName || '';
    } catch (error) {
        console.error('Sidebar Store Name Read Error:', error);
        return '';
    }
};

function Sidebar({ isOpen = false, onClose = () => {} }) {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { logout } = useAuth();

    const [storeName, setStoreName] = useState(getStoredStoreName());
    const [isCollapsed, setIsCollapsed] = useState(false);

    const isEnglish = String(i18n.language || '').toLowerCase().startsWith('en');

    useEffect(() => {
        const refreshStoreName = () => setStoreName(getStoredStoreName());
        const handleStorageChange = (event) => {
            if (event.key === STORE_SETTINGS_KEY) refreshStoreName();
        };
        refreshStoreName();
        window.addEventListener('store-settings-updated', refreshStoreName);
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('store-settings-updated', refreshStoreName);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const displayStoreName = storeName || t('settings.store.defaults.storeName');

    const mainNavigation = [
        ...MAIN_NAVIGATION,
        { labelKey: 'navigation.shoppingList', path: '/shopping-list', icon: ShoppingBasket },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
        onClose();
    };

    const toggleCollapsed = () => setIsCollapsed((current) => !current);

    const renderNavigation = (items) => items.map((item) => {
        const Icon = item.icon;
        return (
            <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                title={isCollapsed ? t(item.labelKey) : undefined}
                className={({ isActive }) => `
                    ui-nav-item group relative w-full min-w-0 active:scale-[0.985] transition-all duration-300 hover:translate-x-0 hover:translate-y-0
                    ${isCollapsed ? 'lg:justify-center lg:gap-0 lg:px-0 lg:!px-0' : ''}
                    ${isActive ? 'active' : ''}
                `}
            >
                {({ isActive }) => (
                    <>
                        <span
                            className={`absolute top-1/2 ${isEnglish ? 'left-[3px] rounded-full' : 'right-[3px] rounded-full'} -translate-y-1/2 h-5 w-[3px] transition-all duration-300 ${isActive ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}
                            style={{
                                background: 'linear-gradient(180deg, var(--accent-400), var(--accent-600))',
                                boxShadow: isActive ? '0 0 8px var(--accent-glow)' : 'none',
                            }}
                        />

                        <span className={`flex shrink-0 items-center justify-center transition-all duration-300 ${isCollapsed ? 'lg:mx-auto' : ''}`}>
                            <Icon
                                size={19}
                                strokeWidth={isActive ? 2.2 : 1.9}
                                className={`shrink-0 transition-all duration-200 ${isActive ? 'text-[var(--accent-500)]' : ''} group-hover:scale-100`}
                            />
                        </span>

                        {!isCollapsed && (
                            <span className="min-w-0 flex-1 truncate text-sm font-medium">
                                {t(item.labelKey)}
                            </span>
                        )}

                        <span
                            className={`h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-300 ${isCollapsed ? `absolute top-2 ${isEnglish ? 'right-2' : 'left-2'}` : 'ms-auto'} ${isActive ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
                            style={{
                                background: 'linear-gradient(135deg, var(--accent-400), var(--accent-600))',
                                boxShadow: isActive ? '0 0 8px var(--accent-glow)' : 'none',
                            }}
                        />
                    </>
                )}
            </NavLink>
        );
    });

    const drawerPlacement = isEnglish ? 'left-0 border-r' : 'right-0 border-l';
    const drawerClosedTransform = isEnglish ? '-translate-x-full' : 'translate-x-full';
    const CollapseIcon = isCollapsed
        ? (isEnglish ? ChevronRight : ChevronLeft)
        : (isEnglish ? ChevronLeft : ChevronRight);

    const collapseLabel = isCollapsed
        ? t('common.expandSidebar')
        : t('common.collapseSidebar');

    return (
        <>
            <button
                type="button"
                aria-label={t('common.closeMenu')}
                onClick={onClose}
                tabIndex={isOpen ? 0 : -1}
                className={`fixed inset-0 z-40 block lg:hidden bg-slate-950/32 dark:bg-black/48 backdrop-blur-[3px] transition-all duration-300 ${isOpen ? 'visible opacity-100' : 'invisible pointer-events-none opacity-0'}`}
            />

            <aside
                className={`glass-strong fixed inset-y-0 z-50 flex min-h-screen w-[min(18rem,85vw)] ${isCollapsed ? 'lg:w-[80px]' : 'lg:w-64'} flex-col overflow-hidden ${drawerPlacement} border-[var(--glass-border)] shadow-[var(--shadow-xl)] transition-[width,transform,background-color,border-color,box-shadow] duration-300 ease-[var(--ease-out)] ${isOpen ? 'translate-x-0' : drawerClosedTransform} lg:static lg:z-auto lg:min-h-0 lg:translate-x-0 lg:border-t-0 lg:border-b-0 lg:shadow-[var(--shadow-md)]`}
                style={{
                    [isEnglish ? 'borderRight' : 'borderLeft']: '1px solid var(--accent-border-hover)',
                }}
            >
                <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
                    style={{ background: 'radial-gradient(240px 100px at 50% 100%, var(--accent-soft), transparent 78%)' }}
                />

                <div
                    className="pointer-events-none absolute inset-y-0 w-px"
                    style={{
                        [isEnglish ? 'right' : 'left']: 0,
                        background: 'linear-gradient(180deg, transparent 0%, var(--accent-500) 25%, var(--accent-400) 50%, var(--accent-500) 75%, transparent 100%)',
                        opacity: 0.10,
                    }}
                />

                <div className={`relative z-10 flex h-[4.75rem] shrink-0 items-center overflow-hidden transition-all duration-300 ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4 sm:px-5'}`}>
                    {!isCollapsed && (
                        <div className="group min-w-0 flex-1 flex items-center gap-3 overflow-hidden">
                            <div
                                className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--accent-border)] shadow-[0_8px_24px_var(--accent-glow)] transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-[1.04]"
                                style={{ background: 'linear-gradient(135deg, var(--accent-400) 0%, var(--accent-500) 45%, var(--accent-600) 100%)' }}
                            >
                                <div className="absolute inset-0 bg-white/[0.10]" />
                                <div className="absolute -top-5 -start-5 h-12 w-12 rounded-full bg-white/[0.18] blur-xl" />
                                <div className="absolute -bottom-4 -end-4 h-10 w-10 rounded-full bg-black/[0.18] blur-lg" />
                                <Store size={21} strokeWidth={2} className="relative z-10 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]" />
                            </div>

                            <div className="min-w-0 overflow-hidden">
                                <h1 className="truncate text-sm font-semibold text-[var(--text)] tracking-[-0.01em]" title={displayStoreName}>
                                    {displayStoreName}
                                </h1>
                                <p className="mt-0.5 truncate text-[11px] font-normal text-[var(--text-muted)]" title={t('common.storeManagement')}>
                                    {t('common.storeManagement')}
                                </p>
                            </div>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={toggleCollapsed}
                        aria-label={collapseLabel}
                        title={collapseLabel}
                        className={`ui-icon-button absolute !hidden lg:!flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface)] shadow-[var(--shadow-md)] z-[70] transition-all duration-300 hover:border-[var(--accent-border-hover)] hover:text-[var(--accent-500)] ${isCollapsed ? 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2' : `top-1/2 -translate-y-1/2 ${isEnglish ? 'right-3' : 'left-3'}`}`}
                        style={{ transition: 'transform 300ms var(--ease-out), border-color 220ms var(--ease-out), color 220ms var(--ease-out), background 220ms var(--ease-out), box-shadow 220ms var(--ease-out)' }}
                        onMouseEnter={(event) => {
                            event.currentTarget.style.background = 'linear-gradient(135deg, var(--accent-soft-strong), var(--accent-soft))';
                        }}
                        onMouseLeave={(event) => {
                            event.currentTarget.style.background = 'var(--surface)';
                        }}
                    >
                        <CollapseIcon size={16} strokeWidth={2.2} className="transition-transform duration-300" />
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t('common.closeMenu')}
                        title={t('common.closeMenu')}
                        className="block lg:hidden lg:!hidden ui-icon-button h-9 w-9 shrink-0 rounded-xl"
                    >
                        <X size={18} strokeWidth={2} />
                    </button>
                </div>

                <div className={`relative z-10 shrink-0 overflow-hidden transition-all duration-300 ${isCollapsed ? 'px-3' : 'px-4 sm:px-5'}`}>
                    <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent 0%, var(--accent-soft-strong) 20%, var(--border) 50%, var(--accent-soft-strong) 80%, transparent 100%)' }} />
                </div>

                <nav className="relative z-10 main-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-5">
                    <section>
                        <p className={`mb-3 px-3 text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-soft)] ${isCollapsed ? 'hidden' : ''}`}>
                            {t('common.mainMenu')}
                        </p>
                        <div className="space-y-1">{renderNavigation(mainNavigation)}</div>
                    </section>

                    <section className="mt-7">
                        <p className={`mb-3 px-3 text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-soft)] ${isCollapsed ? 'hidden' : ''}`}>
                            {t('common.system')}
                        </p>
                        <div className="space-y-1">{renderNavigation(SYSTEM_NAVIGATION)}</div>
                    </section>
                </nav>

                <div className={`relative z-10 shrink-0 overflow-hidden transition-all duration-300 ${isCollapsed ? 'p-2' : 'p-3'}`}>
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent 0%, var(--accent-soft-strong) 25%, var(--border) 50%, var(--accent-soft-strong) 75%, transparent 100%)' }} />

                    <button
                        type="button"
                        onClick={handleLogout}
                        title={isCollapsed ? t('common.logout') : undefined}
                        className={`ui-button-danger group relative w-full border-transparent bg-transparent shadow-none text-[var(--text-muted)] transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'justify-start'}`}
                        onMouseEnter={(event) => {
                            event.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.16), rgba(239, 68, 68, 0.06))';
                            event.currentTarget.style.color = '#fca5a5';
                            event.currentTarget.style.boxShadow = '0 8px 26px rgba(239, 68, 68, 0.20)';
                        }}
                        onMouseLeave={(event) => {
                            event.currentTarget.style.background = 'transparent';
                            event.currentTarget.style.color = '';
                            event.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <LogOut size={19} strokeWidth={2} className={`shrink-0 transition-transform duration-200 ${isEnglish ? 'group-hover:translate-x-0.5' : 'group-hover:-translate-x-0.5'}`} />
                        {!isCollapsed && (
                            <span className="whitespace-nowrap text-sm font-medium">{t('common.logout')}</span>
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;