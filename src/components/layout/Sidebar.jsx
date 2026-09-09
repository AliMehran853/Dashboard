import { 
    LogOut, 
    Store, 
    ShoppingBasket, 
    X, 
} from 'lucide-react'; 
 
import { 
    NavLink, 
    useNavigate, 
} from 'react-router-dom'; 
 
import { 
    useTranslation, 
} from 'react-i18next'; 
 
import { 
    useAuth, 
} from '../../context/AuthContext'; 
 
import { 
    useEffect, 
    useState, 
} from 'react'; 
 
import { 
    MAIN_NAVIGATION, 
    SYSTEM_NAVIGATION, 
} from '../../constants/navigation'; 
 
 
// ========================================================= 
// Storage Key 
// ========================================================= 
 
const STORE_SETTINGS_KEY = 
    'storeSettings'; 
 
 
// ========================================================= 
// Default Store Name 
// ========================================================= 
 
const DEFAULT_STORE_NAME = 
    'فروشگاه من'; 
 
 
// ========================================================= 
// Read Store Name 
// ========================================================= 
 
const getStoredStoreName = () => { 
 
    try { 
        const storedSettings = 
            localStorage.getItem( 
                STORE_SETTINGS_KEY 
            ); 
 
        if (!storedSettings) { 
            return DEFAULT_STORE_NAME; 
        } 
 
        const parsedSettings = 
            JSON.parse( 
                storedSettings 
            ); 
 
        if ( 
            !parsedSettings || 
            typeof parsedSettings !== 'object' 
        ) { 
            return DEFAULT_STORE_NAME; 
        } 
 
        const storeName = 
            typeof parsedSettings.storeName === 'string' 
                ? parsedSettings.storeName.trim() 
                : ''; 
 
        return ( 
            storeName || 
            DEFAULT_STORE_NAME 
        ); 
 
    } catch (error) { 
 
        console.error( 
            'Sidebar Store Name Read Error:', 
            error 
        ); 
 
        return DEFAULT_STORE_NAME; 
 
    } 
 
}; 
 
 
// ========================================================= 
// Sidebar 
// ========================================================= 
 
function Sidebar({ 
    isOpen = false, 
    onClose = () => {}, 
}) { 
 
    const navigate = 
        useNavigate(); 
 
    const { 
        t, 
        i18n, 
    } = useTranslation(); 
 
    const { 
        logout, 
    } = useAuth(); 
 
 
    // ===================================================== 
    // Store Name 
    // ===================================================== 
 
    const [ 
        storeName, 
        setStoreName, 
    ] = useState( 
        getStoredStoreName() 
    ); 
 
 
    const isEnglish = 
        String( 
            i18n.language || '' 
        ) 
            .toLowerCase() 
            .startsWith( 
                'en' 
            ); 
 
 
    // ===================================================== 
    // Load Store Name 
    // ===================================================== 
 
    useEffect(() => { 
 
        const refreshStoreName = () => { 
 
            setStoreName( 
                getStoredStoreName() 
            ); 
 
        }; 
 
 
        const handleStorageChange = 
            (event) => { 
 
                if ( 
                    event.key === 
                    STORE_SETTINGS_KEY 
                ) { 
 
                    refreshStoreName(); 
 
                } 
 
            }; 
 
 
        refreshStoreName(); 
 
 
        window.addEventListener( 
            'store-settings-updated', 
            refreshStoreName 
        ); 
 
 
        window.addEventListener( 
            'storage', 
            handleStorageChange 
        ); 
 
 
        return () => { 
 
            window.removeEventListener( 
                'store-settings-updated', 
                refreshStoreName 
            ); 
 
 
            window.removeEventListener( 
                'storage', 
                handleStorageChange 
            ); 
 
        }; 
 
    }, []); 
 
 
    // ===================================================== 
    // Navigation 
    // ===================================================== 
 
    const mainNavigation = [ 
        ...MAIN_NAVIGATION, 
 
        { 
            labelKey: 
                'navigation.shoppingList', 
 
            path: 
                '/shopping-list', 
 
            icon: 
                ShoppingBasket, 
        }, 
    ]; 
 
 
    // ===================================================== 
    // Logout 
    // ===================================================== 
 
    const handleLogout = () => { 
 
        logout(); 
 
        navigate( 
            '/login', 
            { 
                replace: true, 
            } 
        ); 
 
        onClose(); 
 
    }; 
 
 
    // ===================================================== 
    // Navigation Renderer 
    // ===================================================== 
 
    const renderNavigation = ( 
        items 
    ) => { 
 
        return items.map( 
            (item) => { 
 
                const Icon = 
                    item.icon; 
 
                return ( 
 
                    <NavLink 
                        key={ 
                            item.path 
                        } 
 
                        to={ 
                            item.path 
                        } 
 
                        onClick={ 
                            onClose 
                        } 
 
                        className={({ 
                            isActive, 
                        }) => 
                            ` 
                                ui-nav-item 
 
                                group 
                                relative 
 
                                w-full 
                                min-w-0 
 
                                active:scale-[0.985] 
 
                                ${ 
                                    isActive 
                                        ? 'active' 
                                        : '' 
                                } 
                            ` 
                        } 
                    > 
 
                        {({ 
                            isActive, 
                        }) => ( 
 
                            <> 
 
                                {/* ================================================= 
                                    Active Indicator 
                                ================================================== */} 
 
                                <span 
                                    className={` 
                                        absolute 
 
                                        top-1/2 
 
                                        ${ 
                                            isEnglish 
                                                ? 'left-0 rounded-e-full' 
                                                : 'right-0 rounded-s-full' 
                                        } 
 
                                        -translate-y-1/2 
 
                                        h-6 
                                        w-1 
 
                                        bg-[var(--accent-500)] 
 
                                        shadow-[0_0_14px_var(--accent-glow)] 
 
                                        transition-all 
                                        duration-300 
 
                                        ${ 
                                            isActive 
                                                ? 'scale-100 opacity-100' 
                                                : 'scale-75 opacity-0' 
                                        } 
                                    `} 
                                /> 
 
 
                                {/* ================================================= 
                                    Icon 
                                ================================================== */} 
 
                                <Icon 
                                    size={19} 
 
                                    strokeWidth={ 
                                        isActive 
                                            ? 2.2 
                                            : 1.9 
                                    } 
 
                                    className={` 
                                        shrink-0 
 
                                        transition-all 
                                        duration-200 
 
                                        ${ 
                                            isActive 
                                                ? 'text-[var(--accent-500)]' 
                                                : '' 
                                        } 
 
                                        group-hover:scale-105 
                                    `} 
                                /> 
 
 
                                {/* ================================================= 
                                    Label 
                                ================================================== */} 
 
                                <span 
                                    className=" 
                                        min-w-0 
                                        flex-1 
 
                                        truncate 
 
                                        text-sm 
                                        font-medium 
                                    " 
                                > 
 
                                    { 
                                        t( 
                                            item.labelKey 
                                        ) 
                                    } 
 
                                </span> 
 
 
                                {/* ================================================= 
                                    Active Dot 
                                ================================================== */} 
 
                                <span 
                                    className={` 
                                        ms-auto 
 
                                        h-1.5 
                                        w-1.5 
 
                                        shrink-0 
 
                                        rounded-full 
 
                                        bg-[var(--accent-500)] 
 
                                        shadow-[0_0_10px_var(--accent-glow)] 
 
                                        transition-all 
                                        duration-200 
 
                                        ${ 
                                            isActive 
                                                ? 'scale-100 opacity-100' 
                                                : 'scale-0 opacity-0' 
                                        } 
                                    `} 
                                /> 
 
                            </> 
 
                        )} 
 
                    </NavLink> 
 
                ); 
 
            } 
        ); 
 
    }; 
 
 
    // ===================================================== 
    // Mobile Drawer Position 
    // ===================================================== 
 
    const drawerPlacement = 
        isEnglish 
            ? 'left-0 border-r' 
            : 'right-0 border-l'; 
 
 
    const drawerClosedTransform = 
        isEnglish 
            ? '-translate-x-full' 
            : 'translate-x-full'; 
 
 
    // ===================================================== 
    // Render 
    // ===================================================== 
 
    return ( 
 
        <> 
 
            {/* ================================================= 
                Mobile Overlay 
            ================================================== */} 
 
            <button 
                type="button" 
 
                aria-label={ 
                    t( 
                        'common.closeMenu' 
                    ) 
                } 
 
                onClick={ 
                    onClose 
                } 
 
                tabIndex={ 
                    isOpen 
                        ? 0 
                        : -1 
                } 
 
                className={` 
                    fixed 
                    inset-0 
 
                    z-40 
 
                    block 
                    lg:hidden 
 
                    bg-slate-950/32 
                    dark:bg-black/48 
 
                    backdrop-blur-[3px] 
 
                    transition-all 
                    duration-300 
 
                    ${ 
                        isOpen 
                            ? 'visible opacity-100' 
                            : 'invisible pointer-events-none opacity-0' 
                    } 
                `} 
            /> 
 
 
            {/* ================================================= 
                Sidebar 
            ================================================== */} 
 
            <aside 
                className={` 
                    glass-strong 
 
                    fixed 
                    inset-y-0 
 
                    z-50 
 
                    flex 
                    min-h-screen 
                    w-[min(18rem,85vw)] 
 
                    flex-col 
 
                    overflow-hidden 
 
                    ${drawerPlacement} 
 
                    border-[var(--glass-border)] 
 
                    shadow-[var(--shadow-xl)] 
 
                    transition-transform 
                    duration-300 
                    ease-[var(--ease-out)] 
 
                    ${ 
                        isOpen 
                            ? 'translate-x-0' 
                            : drawerClosedTransform 
                    } 
 
                    lg:static 
                    lg:z-auto 
                    lg:w-64 
                    lg:min-h-0 
                    lg:translate-x-0 
 
                    lg:border-t-0 
                    lg:border-b-0 
 
                    lg:shadow-[var(--shadow-md)] 
                `} 
            > 
 
                {/* ================================================= 
                    Sidebar Header 
                ================================================== */} 
 
                <div 
                    className=" 
                        flex 
                        h-[4.75rem] 
                        shrink-0 
 
                        items-center 
                        justify-between 
 
                        gap-3 
 
                        px-4 
                        sm:px-5 
                    " 
                > 
 
                    {/* ================================================= 
                        Store Identity 
                    ================================================== */} 
 
                    <div 
                        className=" 
                            group 
                            min-w-0 
 
                            flex 
                            items-center 
                            gap-3 
                        " 
                    > 
 
                        {/* ================================================= 
                            Store Icon 
                        ================================================== */} 
 
                        <div 
                            className=" 
                                relative 
 
                                flex 
                                h-10 
                                w-10 
                                shrink-0 
 
                                items-center 
                                justify-center 
 
                                overflow-hidden 
 
                                rounded-xl 
 
                                border 
                                border-[var(--accent-border)] 
 
                                bg-[var(--accent-500)] 
 
                                shadow-[0_8px_24px_var(--accent-glow)] 
 
                                transition-transform 
                                duration-300 
                                ease-[var(--ease-out)] 
 
                                group-hover:scale-[1.04] 
                            " 
                        > 
 
                            <div 
                                className=" 
                                    absolute 
                                    inset-0 
 
                                    bg-white/[0.08] 
                                " 
                            /> 
 
 
                            <div 
                                className=" 
                                    absolute 
 
                                    -top-5 
                                    -start-5 
 
                                    h-12 
                                    w-12 
 
                                    rounded-full 
 
                                    bg-white/[0.14] 
 
                                    blur-xl 
                                " 
                            /> 
 
 
                            <Store 
                                size={21} 
 
                                strokeWidth={2} 
 
                                className=" 
                                    relative 
                                    z-10 
 
                                    text-white 
                                " 
                            /> 
 
                        </div> 
 
 
                        {/* ================================================= 
                            Store Name 
                        ================================================== */} 
 
                        <div 
                            className=" 
                                min-w-0 
                            " 
                        > 
 
                            <h1 
                                className=" 
                                    truncate 
 
                                    text-sm 
                                    font-semibold 
 
                                    text-[var(--text)] 
 
                                    tracking-[-0.01em] 
                                " 
 
                                title={ 
                                    storeName 
                                } 
                            > 
 
                                { 
                                    storeName 
                                } 
 
                            </h1> 
 
 
                            <p 
                                className=" 
                                    mt-0.5 
 
                                    truncate 
 
                                    text-[11px] 
                                    font-normal 
 
                                    text-[var(--text-muted)] 
                                " 
 
                                title={ 
                                    t( 
                                        'common.storeManagement' 
                                    ) 
                                } 
                            > 
 
                                { 
                                    t( 
                                        'common.storeManagement' 
                                    ) 
                                } 
 
                            </p> 
 
                        </div> 
 
                    </div> 
 
 
                    {/* ================================================= 
                        Mobile Close 
                        Visible ONLY below lg 
                    ================================================== */} 
 
                    <button 
                        type="button" 
 
                        onClick={ 
                            onClose 
                        } 
 
                        aria-label={ 
                            t( 
                                'common.closeMenu' 
                            ) 
                        } 
 
                        title={ 
                            t( 
                                'common.closeMenu' 
                            ) 
                        } 
 
                        className=" 
                            block 
 
                            lg:hidden 
                            lg:!hidden 
 
                            ui-icon-button 
 
                            h-9 
                            w-9 
 
                            shrink-0 
 
                            rounded-xl 
                        " 
                    > 
 
                        <X 
                            size={18} 
 
                            strokeWidth={2} 
                        /> 
 
                    </button> 
 
                </div> 
 
 
                {/* ================================================= 
                    Divider 
                ================================================== */} 
 
                <div 
                    className=" 
                        shrink-0 
 
                        px-4 
                        sm:px-5 
                    " 
                > 
 
                    <div 
                        className=" 
                            ui-divider 
                        " 
                    /> 
 
                </div> 
 
 
                {/* ================================================= 
                    Navigation 
                ================================================== */} 
 
                <nav 
                    className=" 
                        main-scrollbar 
 
                        min-h-0 
                        flex-1 
 
                        overflow-y-auto 
 
                        px-3 
                        py-5 
                    " 
                > 
 
                    {/* ================================================= 
                        Main Navigation 
                    ================================================== */} 
 
                    <section> 
 
                        <p 
                            className=" 
                                mb-3 
                                px-3 
 
                                text-[10px] 
                                font-medium 
 
                                uppercase 
 
                                tracking-[0.08em] 
 
                                text-[var(--text-soft)] 
                            " 
                        > 
 
                            { 
                                t( 
                                    'common.mainMenu' 
                                ) 
                            } 
 
                        </p> 
 
 
                        <div 
                            className=" 
                                space-y-1 
                            " 
                        > 
 
                            { 
                                renderNavigation( 
                                    mainNavigation 
                                ) 
                            } 
 
                        </div> 
 
                    </section> 
 
 
                    {/* ================================================= 
                        System Navigation 
                    ================================================== */} 
 
                    <section 
                        className=" 
                            mt-7 
                        " 
                    > 
 
                        <p 
                            className=" 
                                mb-3 
                                px-3 
 
                                text-[10px] 
                                font-medium 
 
                                uppercase 
 
                                tracking-[0.08em] 
 
                                text-[var(--text-soft)] 
                            " 
                        > 
 
                            { 
                                t( 
                                    'common.system' 
                                ) 
                            } 
 
                        </p> 
 
 
                        <div 
                            className=" 
                                space-y-1 
                            " 
                        > 
 
                            { 
                                renderNavigation( 
                                    SYSTEM_NAVIGATION 
                                ) 
                            } 
 
                        </div> 
 
                    </section> 
 
                </nav> 
 
 
                {/* ================================================= 
                    Logout 
                ================================================== */} 
 
                <div 
                    className=" 
                        shrink-0 
 
                        border-t 
                        border-[var(--border-subtle)] 
 
                        p-3 
                    " 
                > 
 
                    <button 
                        type="button" 
 
                        onClick={ 
                            handleLogout 
                        } 
 
                        className=" 
                            ui-button-danger 
 
                            group 
 
                            w-full 
 
                            justify-start 
 
                            border-transparent 
 
                            bg-transparent 
 
                            shadow-none 
 
                            text-[var(--text-muted)] 
                        " 
                    > 
 
                        <LogOut 
                            size={19} 
 
                            strokeWidth={2} 
 
                            className={` 
                                shrink-0 
 
                                transition-transform 
                                duration-200 
 
                                ${ 
                                    isEnglish 
                                        ? 'group-hover:translate-x-0.5' 
                                        : 'group-hover:-translate-x-0.5' 
                                } 
                            `} 
                        /> 
 
 
                        <span 
                            className=" 
                                text-sm 
                                font-medium 
                            " 
                        > 
 
                            { 
                                t( 
                                    'common.logout' 
                                ) 
                            } 
 
                        </span> 
 
                    </button> 
 
                </div> 
 
            </aside> 
 
        </> 
 
    ); 
 
} 
 
 
export default Sidebar;