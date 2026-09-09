import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';


// =========================================================
// Context
// =========================================================

const AuthContext = createContext(null);


// =========================================================
// Storage Keys
// =========================================================

const ACCOUNT_STORAGE_KEY =
    'shop_account';

const SESSION_AUTH_KEY =
    'isAuthenticated';

const SESSION_USER_KEY =
    'user';

const STORE_SETTINGS_KEY =
    'storeSettings';


// =========================================================
// Default Account
// =========================================================

const DEFAULT_ACCOUNT = {

    name:
        'مدیر فروشگاه',

    email:
        'taqitaqwa3@gmail.com',

    password:
        '7424376taqi',

    avatar:
        '',

};


// =========================================================
// Safe String
// =========================================================

const safeString = (
    value
) => {

    return typeof value === 'string'
        ? value
        : '';

};


// =========================================================
// Avatar Validation
// =========================================================

const validateAvatar = (
    avatar
) => {

    // -----------------------------------------------------
    // Empty Avatar
    // -----------------------------------------------------

    if (
        avatar === '' ||
        avatar === null ||
        avatar === undefined
    ) {

        return {

            valid:
                true,

            message:
                '',

        };

    }


    // -----------------------------------------------------
    // Data Image Validation
    // -----------------------------------------------------

    if (
        typeof avatar !== 'string' ||
        !avatar.startsWith('data:image/')
    ) {

        return {

            valid:
                false,

            message:
                'فرمت عکس پروفایل معتبر نیست.',

        };

    }


    // -----------------------------------------------------
    // Allowed Formats
    // -----------------------------------------------------

    const allowedFormats = [

        'data:image/jpeg',
        'data:image/jpg',
        'data:image/png',
        'data:image/webp',

    ];


    const isAllowed =
        allowedFormats.some(
            (format) =>
                avatar.startsWith(format)
        );


    if (!isAllowed) {

        return {

            valid:
                false,

            message:
                'فرمت عکس پروفایل پشتیبانی نمی‌شود.',

        };

    }


    return {

        valid:
            true,

        message:
            '',

    };

};


// =========================================================
// Get Stored Account
// =========================================================

const getStoredAccount = () => {

    try {

        const stored =
            localStorage.getItem(
                ACCOUNT_STORAGE_KEY
            );


        // -------------------------------------------------
        // First Run
        // -------------------------------------------------

        if (!stored) {

            const defaultAccount = {

                ...DEFAULT_ACCOUNT,

            };


            localStorage.setItem(
                ACCOUNT_STORAGE_KEY,
                JSON.stringify(
                    defaultAccount
                )
            );


            return defaultAccount;

        }


        // -------------------------------------------------
        // Parse
        // -------------------------------------------------

        const parsed =
            JSON.parse(
                stored
            );


        if (
            !parsed ||
            typeof parsed !== 'object'
        ) {

            throw new Error(
                'Invalid stored account.'
            );

        }


        // -------------------------------------------------
        // Normalize
        // -------------------------------------------------

        return {

            ...DEFAULT_ACCOUNT,

            ...parsed,

            name:
                safeString(
                    parsed.name
                ).trim() ||
                DEFAULT_ACCOUNT.name,

            email:
                safeString(
                    parsed.email
                ).trim() ||
                DEFAULT_ACCOUNT.email,

            password:
                safeString(
                    parsed.password
                ).trim() ||
                DEFAULT_ACCOUNT.password,

            avatar:
                safeString(
                    parsed.avatar
                ),

        };

    } catch (error) {

        console.error(
            'Account Storage Read Error:',
            error
        );


        return {

            ...DEFAULT_ACCOUNT,

        };

    }

};


// =========================================================
// Build Public User
// =========================================================

const buildUserData = (
    account
) => {

    return {

        name:
            safeString(
                account?.name
            ).trim(),

        email:
            safeString(
                account?.email
            ).trim(),

        avatar:
            safeString(
                account?.avatar
            ),

    };

};


// =========================================================
// Has Active Session
// =========================================================

const hasActiveSession = () => {

    try {

        return (
            sessionStorage.getItem(
                SESSION_AUTH_KEY
            ) === 'true'
        );

    } catch (error) {

        console.error(
            'Session Read Error:',
            error
        );


        return false;

    }

};


// =========================================================
// Save Session User
// =========================================================

const saveSessionUser = (
    userData
) => {

    try {

        sessionStorage.setItem(
            SESSION_AUTH_KEY,
            'true'
        );


        sessionStorage.setItem(
            SESSION_USER_KEY,
            JSON.stringify(
                userData
            )
        );


        return true;

    } catch (error) {

        console.error(
            'Session Save Error:',
            error
        );


        return false;

    }

};


// =========================================================
// Clear Session
// =========================================================

const clearSession = () => {

    try {

        sessionStorage.removeItem(
            SESSION_AUTH_KEY
        );


        sessionStorage.removeItem(
            SESSION_USER_KEY
        );

    } catch (error) {

        console.error(
            'Session Clear Error:',
            error
        );

    }

};


// =========================================================
// Sync Owner Name With Store Settings
// =========================================================

const syncOwnerNameWithStoreSettings = (
    ownerName
) => {

    const cleanOwnerName =
        safeString(
            ownerName
        ).trim();


    if (!cleanOwnerName) {

        return;

    }


    try {

        const storedSettings =
            localStorage.getItem(
                STORE_SETTINGS_KEY
            );


        let currentSettings = {};


        // -------------------------------------------------
        // Read Existing Store Settings
        // -------------------------------------------------

        if (storedSettings) {

            try {

                const parsedSettings =
                    JSON.parse(
                        storedSettings
                    );


                if (
                    parsedSettings &&
                    typeof parsedSettings === 'object'
                ) {

                    currentSettings =
                        parsedSettings;

                }

            } catch (error) {

                console.error(
                    'Store Settings Parse Error:',
                    error
                );

            }

        }


        // -------------------------------------------------
        // Update Owner Name Only
        // -------------------------------------------------

        const updatedSettings = {

            ...currentSettings,

            ownerName:
                cleanOwnerName,

        };


        // -------------------------------------------------
        // Save Store Settings
        // -------------------------------------------------

        localStorage.setItem(
            STORE_SETTINGS_KEY,
            JSON.stringify(
                updatedSettings
            )
        );


        // -------------------------------------------------
        // Notify Store Settings
        // -------------------------------------------------

        window.dispatchEvent(
            new Event(
                'store-settings-updated'
            )
        );

    } catch (error) {

        console.error(
            'Owner Name Store Sync Error:',
            error
        );

    }

};


// =========================================================
// Auth Provider
// =========================================================

export function AuthProvider({
    children,
}) {

    // =====================================================
    // Authentication State
    // =====================================================

    const [
        isAuthenticated,
        setIsAuthenticated,
    ] = useState(false);


    // =====================================================
    // User State
    // =====================================================

    const [
        user,
        setUser,
    ] = useState(null);


    // =====================================================
    // Loading State
    // =====================================================

    const [
        loading,
        setLoading,
    ] = useState(true);


    // =====================================================
    // Restore Session
    // =====================================================

    useEffect(() => {

        let mounted = true;


        const restoreSession = () => {

            try {

                const authenticated =
                    sessionStorage.getItem(
                        SESSION_AUTH_KEY
                    );


                const storedUser =
                    sessionStorage.getItem(
                        SESSION_USER_KEY
                    );


                // -------------------------------------------------
                // No Active Session
                // -------------------------------------------------

                if (
                    authenticated !== 'true' ||
                    !storedUser
                ) {

                    if (mounted) {

                        setUser(null);

                        setIsAuthenticated(
                            false
                        );

                    }

                    return;

                }


                // -------------------------------------------------
                // Parse Session User
                // -------------------------------------------------

                let parsedUser =
                    null;


                try {

                    parsedUser =
                        JSON.parse(
                            storedUser
                        );

                } catch {

                    parsedUser =
                        null;

                }


                // -------------------------------------------------
                // Read Account
                // -------------------------------------------------

                const account =
                    getStoredAccount();


                // -------------------------------------------------
                // Validate Session
                // -------------------------------------------------

                if (
                    !parsedUser?.email ||
                    parsedUser.email !==
                        account.email
                ) {

                    clearSession();


                    if (mounted) {

                        setUser(null);

                        setIsAuthenticated(
                            false
                        );

                    }

                    return;

                }


                // -------------------------------------------------
                // Account Is Source Of Truth
                // -------------------------------------------------

                const currentUser =
                    buildUserData(
                        account
                    );


                // -------------------------------------------------
                // Keep Session Updated
                // -------------------------------------------------

                saveSessionUser(
                    currentUser
                );


                // -------------------------------------------------
                // Sync Owner Name
                // -------------------------------------------------

                syncOwnerNameWithStoreSettings(
                    currentUser.name
                );


                // -------------------------------------------------
                // React State
                // -------------------------------------------------

                if (mounted) {

                    setUser(
                        currentUser
                    );


                    setIsAuthenticated(
                        true
                    );

                }

            } catch (error) {

                console.error(
                    'Auth Restore Error:',
                    error
                );


                clearSession();


                if (mounted) {

                    setUser(null);

                    setIsAuthenticated(
                        false
                    );

                }

            } finally {

                if (mounted) {

                    setLoading(
                        false
                    );

                }

            }

        };


        restoreSession();


        return () => {

            mounted = false;

        };

    }, []);


    // =====================================================
    // Login
    // =====================================================

    const login = useCallback(
        (
            email,
            password
        ) => {

            const cleanEmail =
                safeString(
                    email
                ).trim();


            const cleanPassword =
                safeString(
                    password
                ).trim();


            // -------------------------------------------------
            // Current Account
            // -------------------------------------------------

            const account =
                getStoredAccount();


            // -------------------------------------------------
            // Credentials
            // -------------------------------------------------

            if (
                cleanEmail !==
                    account.email ||
                cleanPassword !==
                    account.password
            ) {

                return {

                    success:
                        false,

                    message:
                        'ایمیل یا رمز عبور صحیح نیست.',

                };

            }


            // -------------------------------------------------
            // Build User
            // -------------------------------------------------

            const userData =
                buildUserData(
                    account
                );


            // -------------------------------------------------
            // Save Session
            // -------------------------------------------------

            const saved =
                saveSessionUser(
                    userData
                );


            if (!saved) {

                return {

                    success:
                        false,

                    message:
                        'ایجاد نشست کاربری انجام نشد.',

                };

            }


            // -------------------------------------------------
            // Sync Owner Name
            // -------------------------------------------------

            syncOwnerNameWithStoreSettings(
                userData.name
            );


            // -------------------------------------------------
            // React State
            // -------------------------------------------------

            setUser(
                userData
            );


            setIsAuthenticated(
                true
            );


            return {

                success:
                    true,

                user:
                    userData,

            };

        },
        []
    );


    // =====================================================
    // Update Account
    // =====================================================

    const updateAccount = useCallback(
        (
            accountData = {}
        ) => {

            // -------------------------------------------------
            // Current Account
            // -------------------------------------------------

            const currentAccount =
                getStoredAccount();


            // -------------------------------------------------
            // Incoming Data
            // -------------------------------------------------

            const incomingData = {

                ...accountData,

            };


            // -------------------------------------------------
            // Merge
            // -------------------------------------------------

            const updatedAccount = {

                ...currentAccount,

                ...incomingData,

            };


            // -------------------------------------------------
            // Normalize
            // -------------------------------------------------

            updatedAccount.name =
                safeString(
                    updatedAccount.name
                ).trim();


            updatedAccount.email =
                safeString(
                    updatedAccount.email
                ).trim();


            updatedAccount.password =
                safeString(
                    updatedAccount.password
                ).trim();


            updatedAccount.avatar =
                safeString(
                    updatedAccount.avatar
                );


            // -------------------------------------------------
            // Validate Name
            // -------------------------------------------------

            if (
                !updatedAccount.name
            ) {

                return {

                    success:
                        false,

                    message:
                        'نام مدیر نمی‌تواند خالی باشد.',

                };

            }


            // -------------------------------------------------
            // Validate Email
            // -------------------------------------------------

            if (
                !updatedAccount.email
            ) {

                return {

                    success:
                        false,

                    message:
                        'ایمیل نمی‌تواند خالی باشد.',

                };

            }


            // -------------------------------------------------
            // Validate Password
            // -------------------------------------------------

            if (
                !updatedAccount.password
            ) {

                return {

                    success:
                        false,

                    message:
                        'رمز عبور نمی‌تواند خالی باشد.',

                };

            }


            // -------------------------------------------------
            // Validate Avatar
            // -------------------------------------------------

            const avatarValidation =
                validateAvatar(
                    updatedAccount.avatar
                );


            if (
                !avatarValidation.valid
            ) {

                return {

                    success:
                        false,

                    message:
                        avatarValidation.message,

                };

            }


            // -------------------------------------------------
            // Save Account
            // -------------------------------------------------

            try {

                localStorage.setItem(
                    ACCOUNT_STORAGE_KEY,
                    JSON.stringify(
                        updatedAccount
                    )
                );

            } catch (error) {

                console.error(
                    'Account Save Error:',
                    error
                );


                return {

                    success:
                        false,

                    message:
                        'ذخیره اطلاعات حساب انجام نشد.',

                };

            }


            // -------------------------------------------------
            // Build Updated User
            // -------------------------------------------------

            const updatedUser =
                buildUserData(
                    updatedAccount
                );


            // -------------------------------------------------
            // Sync Owner Name
            //
            // This makes Account Settings -> Store Settings
            // work immediately.
            // -------------------------------------------------

            syncOwnerNameWithStoreSettings(
                updatedUser.name
            );


            // -------------------------------------------------
            // Update React State Immediately
            // -------------------------------------------------

            setUser(
                updatedUser
            );


            // -------------------------------------------------
            // Update Session
            // -------------------------------------------------

            const activeSession =
                hasActiveSession();


            if (
                activeSession ||
                isAuthenticated
            ) {

                setIsAuthenticated(
                    true
                );


                saveSessionUser(
                    updatedUser
                );

            }


            // -------------------------------------------------
            // Broadcast Account Update
            // -------------------------------------------------

            try {

                window.dispatchEvent(
                    new CustomEvent(
                        'account-updated',
                        {
                            detail:
                                updatedUser,
                        }
                    )
                );

            } catch (error) {

                console.error(
                    'Account Update Event Error:',
                    error
                );

            }


            // -------------------------------------------------
            // Return
            // -------------------------------------------------

            return {

                success:
                    true,

                user:
                    updatedUser,

            };

        },
        [
            isAuthenticated,
        ]
    );


    // =====================================================
    // Update Profile Avatar
    // =====================================================

    const updateProfileAvatar =
        useCallback(
            (
                avatar
            ) => {

                // -------------------------------------------------
                // Validate
                // -------------------------------------------------

                const validation =
                    validateAvatar(
                        avatar
                    );


                if (
                    !validation.valid
                ) {

                    return {

                        success:
                            false,

                        message:
                            validation.message,

                    };

                }


                // -------------------------------------------------
                // Current Account
                // -------------------------------------------------

                const currentAccount =
                    getStoredAccount();


                // -------------------------------------------------
                // Updated Account
                // -------------------------------------------------

                const updatedAccount = {

                    ...currentAccount,

                    avatar:
                        safeString(
                            avatar
                        ),

                };


                // -------------------------------------------------
                // Save
                // -------------------------------------------------

                try {

                    localStorage.setItem(
                        ACCOUNT_STORAGE_KEY,
                        JSON.stringify(
                            updatedAccount
                        )
                    );

                } catch (error) {

                    console.error(
                        'Avatar Save Error:',
                        error
                    );


                    return {

                        success:
                            false,

                        message:
                            'ذخیره عکس پروفایل انجام نشد.',

                    };

                }


                // -------------------------------------------------
                // Build User
                // -------------------------------------------------

                const updatedUser =
                    buildUserData(
                        updatedAccount
                    );


                // -------------------------------------------------
                // Update React State
                // -------------------------------------------------

                setUser(
                    updatedUser
                );


                // -------------------------------------------------
                // Session
                // -------------------------------------------------

                if (
                    hasActiveSession() ||
                    isAuthenticated
                ) {

                    setIsAuthenticated(
                        true
                    );


                    saveSessionUser(
                        updatedUser
                    );

                }


                // -------------------------------------------------
                // Event
                // -------------------------------------------------

                try {

                    window.dispatchEvent(
                        new CustomEvent(
                            'account-updated',
                            {
                                detail:
                                    updatedUser,
                            }
                        )
                    );

                } catch (error) {

                    console.error(
                        'Avatar Update Event Error:',
                        error
                    );

                }


                return {

                    success:
                        true,

                    user:
                        updatedUser,

                };

            },
            [
                isAuthenticated,
            ]
        );


    // =====================================================
    // Remove Avatar
    // =====================================================

    const removeProfileAvatar =
        useCallback(
            () => {

                return updateProfileAvatar(
                    ''
                );

            },
            [
                updateProfileAvatar,
            ]
        );


    // =====================================================
    // Get Account
    // =====================================================

    const getAccount =
        useCallback(
            () => {

                return getStoredAccount();

            },
            []
        );


    // =====================================================
    // Logout
    // =====================================================

    const logout =
        useCallback(
            () => {

                clearSession();


                setUser(
                    null
                );


                setIsAuthenticated(
                    false
                );

            },
            []
        );


    // =====================================================
    // Context Value
    // =====================================================

    const contextValue =
        useMemo(
            () => ({

                isAuthenticated,

                user,

                loading,

                login,

                logout,

                updateAccount,

                updateProfileAvatar,

                removeProfileAvatar,

                getAccount,

            }),
            [
                isAuthenticated,
                user,
                loading,
                login,
                logout,
                updateAccount,
                updateProfileAvatar,
                removeProfileAvatar,
                getAccount,
            ]
        );


    // =====================================================
    // Provider
    // =====================================================

    return (

        <AuthContext.Provider
            value={
                contextValue
            }
        >

            {children}

        </AuthContext.Provider>

    );

}


// =========================================================
// useAuth
// =========================================================

export function useAuth() {

    const context =
        useContext(
            AuthContext
        );


    if (!context) {

        throw new Error(
            'useAuth باید داخل AuthProvider استفاده شود.'
        );

    }


    return context;

}