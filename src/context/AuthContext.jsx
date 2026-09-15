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

const ACCOUNT_STORAGE_KEY = 'shop_account';
const SESSION_AUTH_KEY = 'isAuthenticated';
const SESSION_USER_KEY = 'user';
const STORE_SETTINGS_KEY = 'storeSettings';


// =========================================================
// Constants
// =========================================================

const DEFAULT_MANAGER_NAME = 'مدیر فروشگاه';
const MIN_PASSWORD_LENGTH = 6;
const SECURITY_QUESTIONS_COUNT = 3;
const MIN_ANSWER_LENGTH = 2;


// =========================================================
// Security Questions Pool (۵ سؤال)
//   کاربر از این ۵ سؤال، ۳ تا را انتخاب می‌کند.
// =========================================================

export const SECURITY_QUESTION_IDS = [
    'firstSchool',
    'firstPet',
    'birthCity',
    'firstTeacher',
    'childhoodFriend',
];


const isValidQuestionId = (id) =>
    SECURITY_QUESTION_IDS.includes(String(id || '').trim());


// =========================================================
// Safe String
// =========================================================

const safeString = (value) =>
    typeof value === 'string' ? value : '';


// =========================================================
// Email Validation
// =========================================================

const EMAIL_REGEX =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;


const isValidEmail = (email) =>
    EMAIL_REGEX.test(safeString(email).trim());


// =========================================================
// Email Typo Detection
// =========================================================

const EMAIL_DOMAIN_TYPOS = {
    'gmai.com': 'gmail.com',
    'gmial.com': 'gmail.com',
    'gmal.com': 'gmail.com',
    'gamil.com': 'gmail.com',
    'gmaill.com': 'gmail.com',
    'gnail.com': 'gmail.com',
    'gmail.co': 'gmail.com',
    'gmail.cm': 'gmail.com',
    'gmail.con': 'gmail.com',
    'gmail.comm': 'gmail.com',
    'yaho.com': 'yahoo.com',
    'yahooo.com': 'yahoo.com',
    'yahoo.co': 'yahoo.com',
    'yahoo.con': 'yahoo.com',
    'outlok.com': 'outlook.com',
    'outloo.com': 'outlook.com',
    'outlook.co': 'outlook.com',
    'hotmial.com': 'hotmail.com',
    'hotmai.com': 'hotmail.com',
    'hotmal.com': 'hotmail.com',
    'iclould.com': 'icloud.com',
    'liv.com': 'live.com',
};


export const detectEmailTypo = (email) => {
    const clean = safeString(email).trim().toLowerCase();
    if (!clean.includes('@')) return null;

    const atIndex = clean.lastIndexOf('@');
    if (atIndex < 1) return null;

    const local = clean.slice(0, atIndex);
    const domain = clean.slice(atIndex + 1);

    const corrected = EMAIL_DOMAIN_TYPOS[domain];
    if (!corrected) return null;

    return `${local}@${corrected}`;
};


// =========================================================
// Answer Normalization
//   - ارقام فارسی/عربی → انگلیسی
//   - trim + lowercase + collapse whitespace
// =========================================================

const toEnglishDigits = (value) =>
    String(value ?? '')
        .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
        .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));


const normalizeAnswer = (value) =>
    toEnglishDigits(value)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');


const normalizeSecurityQuestions = (questions) => {
    if (!Array.isArray(questions)) return [];

    return questions
        .filter(
            (q) =>
                q &&
                typeof q === 'object' &&
                isValidQuestionId(q.id)
        )
        .map((q) => ({
            id: String(q.id).trim(),
            answer: normalizeAnswer(q.answer),
        }));
};


const validateSecurityQuestions = (questions) => {
    if (
        !Array.isArray(questions) ||
        questions.length !== SECURITY_QUESTIONS_COUNT
    ) {
        return {
            valid: false,
            message: `باید دقیقاً ${SECURITY_QUESTIONS_COUNT} سؤال امنیتی انتخاب شود.`,
        };
    }

    const seenIds = new Set();

    for (const q of questions) {
        if (!q || typeof q !== 'object') {
            return {
                valid: false,
                message: 'ساختار سؤال امنیتی معتبر نیست.',
            };
        }

        if (!isValidQuestionId(q.id)) {
            return {
                valid: false,
                message: 'شناسه سؤال امنیتی معتبر نیست.',
            };
        }

        if (seenIds.has(q.id)) {
            return {
                valid: false,
                message: 'سؤالات امنیتی نباید تکراری باشند.',
            };
        }

        seenIds.add(q.id);

        const answer = normalizeAnswer(q.answer);

        if (!answer) {
            return {
                valid: false,
                message: 'پاسخ همه سؤالات امنیتی الزامی است.',
            };
        }

        if (answer.length < MIN_ANSWER_LENGTH) {
            return {
                valid: false,
                message: `پاسخ هر سؤال باید حداقل ${MIN_ANSWER_LENGTH} کاراکتر باشد.`,
            };
        }
    }

    return { valid: true };
};


// =========================================================
// Avatar Validation
// =========================================================

const validateAvatar = (avatar) => {
    if (avatar === '' || avatar === null || avatar === undefined) {
        return { valid: true, message: '' };
    }

    if (
        typeof avatar !== 'string' ||
        !avatar.startsWith('data:image/')
    ) {
        return {
            valid: false,
            message: 'فرمت عکس پروفایل معتبر نیست.',
        };
    }

    const allowedFormats = [
        'data:image/jpeg',
        'data:image/jpg',
        'data:image/png',
        'data:image/webp',
    ];

    const isAllowed = allowedFormats.some((format) =>
        avatar.startsWith(format)
    );

    if (!isAllowed) {
        return {
            valid: false,
            message: 'فرمت عکس پروفایل پشتیبانی نمی‌شود.',
        };
    }

    return { valid: true, message: '' };
};


// =========================================================
// Get Stored Account
// =========================================================

const getStoredAccount = () => {
    try {
        const stored = localStorage.getItem(ACCOUNT_STORAGE_KEY);
        if (!stored) return null;

        const parsed = JSON.parse(stored);
        if (!parsed || typeof parsed !== 'object') return null;

        const email = safeString(parsed.email).trim();
        const password = safeString(parsed.password).trim();

        if (!email || !password) return null;

        return {
            name:
                safeString(parsed.name).trim() ||
                DEFAULT_MANAGER_NAME,
            email,
            password,
            avatar: safeString(parsed.avatar),
            securityQuestions: normalizeSecurityQuestions(
                parsed.securityQuestions
            ),
        };
    } catch (error) {
        console.error('Account Storage Read Error:', error);
        return null;
    }
};


// =========================================================
// Save Account To Storage
// =========================================================

const saveAccountToStorage = (account) => {
    try {
        localStorage.setItem(
            ACCOUNT_STORAGE_KEY,
            JSON.stringify(account)
        );
        return true;
    } catch (error) {
        console.error('Account Save Error:', error);
        return false;
    }
};


// =========================================================
// Build Public User
// =========================================================

const buildUserData = (account) => ({
    name:
        safeString(account?.name).trim() ||
        DEFAULT_MANAGER_NAME,
    email: safeString(account?.email).trim(),
    avatar: safeString(account?.avatar),
});


// =========================================================
// Session Helpers
// =========================================================

const hasActiveSession = () => {
    try {
        return sessionStorage.getItem(SESSION_AUTH_KEY) === 'true';
    } catch (error) {
        console.error('Session Read Error:', error);
        return false;
    }
};


const saveSessionUser = (userData) => {
    try {
        sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
        sessionStorage.setItem(
            SESSION_USER_KEY,
            JSON.stringify(userData)
        );
        return true;
    } catch (error) {
        console.error('Session Save Error:', error);
        return false;
    }
};


const clearSession = () => {
    try {
        sessionStorage.removeItem(SESSION_AUTH_KEY);
        sessionStorage.removeItem(SESSION_USER_KEY);
    } catch (error) {
        console.error('Session Clear Error:', error);
    }
};


// =========================================================
// Sync Owner Name With Store Settings
// =========================================================

const syncOwnerNameWithStoreSettings = (ownerName) => {
    const cleanOwnerName = safeString(ownerName).trim();
    if (!cleanOwnerName) return;

    try {
        const storedSettings = localStorage.getItem(STORE_SETTINGS_KEY);
        let currentSettings = {};

        if (storedSettings) {
            try {
                const parsed = JSON.parse(storedSettings);
                if (parsed && typeof parsed === 'object') {
                    currentSettings = parsed;
                }
            } catch (error) {
                console.error('Store Settings Parse Error:', error);
            }
        }

        localStorage.setItem(
            STORE_SETTINGS_KEY,
            JSON.stringify({
                ...currentSettings,
                ownerName: cleanOwnerName,
            })
        );

        window.dispatchEvent(new Event('store-settings-updated'));
    } catch (error) {
        console.error('Owner Name Store Sync Error:', error);
    }
};


// =========================================================
// Auth Provider
// =========================================================

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // =====================================================
    // Restore Session
    // =====================================================

    useEffect(() => {
        let mounted = true;

        const restoreSession = () => {
            try {
                const authenticated = sessionStorage.getItem(
                    SESSION_AUTH_KEY
                );
                const storedUser = sessionStorage.getItem(
                    SESSION_USER_KEY
                );

                if (authenticated !== 'true' || !storedUser) {
                    if (mounted) {
                        setUser(null);
                        setIsAuthenticated(false);
                    }
                    return;
                }

                let parsedUser = null;
                try {
                    parsedUser = JSON.parse(storedUser);
                } catch {
                    parsedUser = null;
                }

                const account = getStoredAccount();

                if (
                    !account ||
                    !parsedUser?.email ||
                    parsedUser.email !== account.email
                ) {
                    clearSession();
                    if (mounted) {
                        setUser(null);
                        setIsAuthenticated(false);
                    }
                    return;
                }

                const currentUser = buildUserData(account);
                saveSessionUser(currentUser);
                syncOwnerNameWithStoreSettings(currentUser.name);

                if (mounted) {
                    setUser(currentUser);
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Auth Restore Error:', error);
                clearSession();
                if (mounted) {
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        restoreSession();

        return () => {
            mounted = false;
        };
    }, []);

    // =====================================================
    // hasAccount
    // =====================================================

    const hasAccount = useCallback(() => {
        return getStoredAccount() !== null;
    }, []);

    // =====================================================
    // registerAccount
    // =====================================================

    const registerAccount = useCallback((data = {}) => {
        const email = safeString(data.email).trim();
        const password = safeString(data.password).trim();
        const name =
            safeString(data.name).trim() || DEFAULT_MANAGER_NAME;

        if (!email) {
            return { success: false, message: 'ایمیل را وارد کنید.' };
        }

        const typo = detectEmailTypo(email);
        if (typo) {
            return {
                success: false,
                message: `ایمیل احتمالاً اشتباه است. منظورتان «${typo}» بود؟`,
                suggestion: typo,
            };
        }

        if (!isValidEmail(email)) {
            return { success: false, message: 'فرمت ایمیل صحیح نیست.' };
        }

        if (!password) {
            return { success: false, message: 'رمز عبور را وارد کنید.' };
        }

        if (password.length < MIN_PASSWORD_LENGTH) {
            return {
                success: false,
                message: `رمز عبور باید حداقل ${MIN_PASSWORD_LENGTH} کاراکتر باشد.`,
            };
        }

        const sqValidation = validateSecurityQuestions(
            data.securityQuestions
        );

        if (!sqValidation.valid) {
            return {
                success: false,
                message: sqValidation.message,
            };
        }

        if (getStoredAccount()) {
            return {
                success: false,
                message: 'حساب قبلاً ساخته شده است.',
            };
        }

        const account = {
            name,
            email,
            password,
            avatar: '',
            securityQuestions: normalizeSecurityQuestions(
                data.securityQuestions
            ),
        };

        const saved = saveAccountToStorage(account);

        if (!saved) {
            return {
                success: false,
                message: 'ذخیره اطلاعات حساب انجام نشد.',
            };
        }

        const userData = buildUserData(account);
        saveSessionUser(userData);
        syncOwnerNameWithStoreSettings(userData.name);

        setUser(userData);
        setIsAuthenticated(true);

        try {
            window.dispatchEvent(
                new CustomEvent('account-updated', {
                    detail: userData,
                })
            );
        } catch (error) {
            console.error('Account Created Event Error:', error);
        }

        return { success: true, user: userData };
    }, []);

    // =====================================================
    // Login
    // =====================================================

    const login = useCallback((email, password) => {
        const cleanEmail = safeString(email).trim();
        const cleanPassword = safeString(password).trim();

        const account = getStoredAccount();

        if (!account) {
            return {
                success: false,
                needsSetup: true,
                message: 'حسابی ساخته نشده است. ابتدا ثبت‌نام کنید.',
            };
        }

        if (
            cleanEmail !== account.email ||
            cleanPassword !== account.password
        ) {
            return {
                success: false,
                message: 'ایمیل یا رمز عبور صحیح نیست.',
            };
        }

        const userData = buildUserData(account);
        const saved = saveSessionUser(userData);

        if (!saved) {
            return {
                success: false,
                message: 'ایجاد نشست کاربری انجام نشد.',
            };
        }

        syncOwnerNameWithStoreSettings(userData.name);

        setUser(userData);
        setIsAuthenticated(true);

        return { success: true, user: userData };
    }, []);

    // =====================================================
    // getSecurityQuestionsForEmail
    //   فقط ID سؤال‌ها را برمی‌گرداند (نه پاسخ‌ها).
    // =====================================================

    const getSecurityQuestionsForEmail = useCallback((email) => {
        const cleanEmail = safeString(email).trim();

        if (!cleanEmail) {
            return {
                success: false,
                message: 'ایمیل را وارد کنید.',
            };
        }

        const account = getStoredAccount();

        if (!account || cleanEmail !== account.email) {
            return {
                success: false,
                message: 'ایمیلی با این مشخصات پیدا نشد.',
            };
        }

        const questions = account.securityQuestions || [];

        if (questions.length === 0) {
            return {
                success: false,
                noSecurity: true,
                message:
                    'این حساب سؤال امنیتی ندارد. باید بازنشانی کنید.',
            };
        }

        return {
            success: true,
            questions: questions.map((q) => ({ id: q.id })),
        };
    }, []);

    // =====================================================
    // verifySecurityAnswers
    //   اگر همه پاسخ‌ها درست باشند → ایمیل و پسورد.
    // =====================================================

    const verifySecurityAnswers = useCallback((email, answers) => {
        const cleanEmail = safeString(email).trim();

        const account = getStoredAccount();

        if (!account || cleanEmail !== account.email) {
            return {
                success: false,
                message: 'ایمیلی با این مشخصات پیدا نشد.',
            };
        }

        const questions = account.securityQuestions || [];

        if (questions.length === 0) {
            return {
                success: false,
                message: 'این حساب سؤال امنیتی ندارد.',
            };
        }

        if (
            !Array.isArray(answers) ||
            answers.length !== questions.length
        ) {
            return {
                success: false,
                message: 'پاسخ‌ها نامعتبر است.',
            };
        }

        for (let i = 0; i < questions.length; i += 1) {
            const expected = normalizeAnswer(questions[i].answer);
            const given = normalizeAnswer(answers[i]);

            if (!given) {
                return {
                    success: false,
                    message: 'همه پاسخ‌ها الزامی است.',
                };
            }

            if (expected !== given) {
                return {
                    success: false,
                    message: 'پاسخ یک یا چند سؤال صحیح نیست.',
                };
            }
        }

        return {
            success: true,
            email: account.email,
            password: account.password,
        };
    }, []);

    // =====================================================
    // Update Account
    // =====================================================

    const updateAccount = useCallback(
        (accountData = {}) => {
            const currentAccount = getStoredAccount();

            if (!currentAccount) {
                return { success: false, message: 'حسابی وجود ندارد.' };
            }

            const updatedAccount = {
                ...currentAccount,
                ...accountData,
            };

            updatedAccount.name = safeString(updatedAccount.name).trim();
            updatedAccount.email = safeString(updatedAccount.email).trim();
            updatedAccount.password = safeString(
                updatedAccount.password
            ).trim();
            updatedAccount.avatar = safeString(updatedAccount.avatar);

            if (!updatedAccount.name) {
                return {
                    success: false,
                    message: 'نام مدیر نمی‌تواند خالی باشد.',
                };
            }

            if (!updatedAccount.email) {
                return {
                    success: false,
                    message: 'ایمیل نمی‌تواند خالی باشد.',
                };
            }

            const typo = detectEmailTypo(updatedAccount.email);
            if (typo) {
                return {
                    success: false,
                    message: `ایمیل احتمالاً اشتباه است. منظورتان «${typo}» بود؟`,
                    suggestion: typo,
                };
            }

            if (!isValidEmail(updatedAccount.email)) {
                return {
                    success: false,
                    message: 'فرمت ایمیل صحیح نیست.',
                };
            }

            if (!updatedAccount.password) {
                return {
                    success: false,
                    message: 'رمز عبور نمی‌تواند خالی باشد.',
                };
            }

            if (
                updatedAccount.password.length < MIN_PASSWORD_LENGTH
            ) {
                return {
                    success: false,
                    message: `رمز عبور باید حداقل ${MIN_PASSWORD_LENGTH} کاراکتر باشد.`,
                };
            }

            // Security Questions (optional update)
            if (Array.isArray(accountData.securityQuestions)) {
                const sqValidation = validateSecurityQuestions(
                    accountData.securityQuestions
                );

                if (!sqValidation.valid) {
                    return {
                        success: false,
                        message: sqValidation.message,
                    };
                }

                updatedAccount.securityQuestions =
                    normalizeSecurityQuestions(
                        accountData.securityQuestions
                    );
            } else {
                updatedAccount.securityQuestions =
                    currentAccount.securityQuestions || [];
            }

            const avatarValidation = validateAvatar(
                updatedAccount.avatar
            );

            if (!avatarValidation.valid) {
                return {
                    success: false,
                    message: avatarValidation.message,
                };
            }

            const saved = saveAccountToStorage(updatedAccount);

            if (!saved) {
                return {
                    success: false,
                    message: 'ذخیره اطلاعات حساب انجام نشد.',
                };
            }

            const updatedUser = buildUserData(updatedAccount);
            syncOwnerNameWithStoreSettings(updatedUser.name);

            setUser(updatedUser);

            if (hasActiveSession() || isAuthenticated) {
                setIsAuthenticated(true);
                saveSessionUser(updatedUser);
            }

            try {
                window.dispatchEvent(
                    new CustomEvent('account-updated', {
                        detail: updatedUser,
                    })
                );
            } catch (error) {
                console.error('Account Update Event Error:', error);
            }

            return { success: true, user: updatedUser };
        },
        [isAuthenticated]
    );

    // =====================================================
    // Update Profile Avatar
    // =====================================================

    const updateProfileAvatar = useCallback(
        (avatar) => {
            const validation = validateAvatar(avatar);

            if (!validation.valid) {
                return {
                    success: false,
                    message: validation.message,
                };
            }

            const currentAccount = getStoredAccount();
            if (!currentAccount) {
                return { success: false, message: 'حسابی وجود ندارد.' };
            }

            const updatedAccount = {
                ...currentAccount,
                avatar: safeString(avatar),
            };

            const saved = saveAccountToStorage(updatedAccount);

            if (!saved) {
                return {
                    success: false,
                    message: 'ذخیره عکس پروفایل انجام نشد.',
                };
            }

            const updatedUser = buildUserData(updatedAccount);
            setUser(updatedUser);

            if (hasActiveSession() || isAuthenticated) {
                setIsAuthenticated(true);
                saveSessionUser(updatedUser);
            }

            try {
                window.dispatchEvent(
                    new CustomEvent('account-updated', {
                        detail: updatedUser,
                    })
                );
            } catch (error) {
                console.error('Avatar Update Event Error:', error);
            }

            return { success: true, user: updatedUser };
        },
        [isAuthenticated]
    );

    // =====================================================
    // Remove Avatar
    // =====================================================

    const removeProfileAvatar = useCallback(
        () => updateProfileAvatar(''),
        [updateProfileAvatar]
    );

    // =====================================================
    // Get Account
    // =====================================================

    const getAccount = useCallback(() => getStoredAccount(), []);

    // =====================================================
    // Logout
    // =====================================================

    const logout = useCallback(() => {
        clearSession();
        setUser(null);
        setIsAuthenticated(false);
    }, []);

    // =====================================================
    // Reset Account (fallback نهایی)
    // =====================================================

    const resetAccount = useCallback(() => {
        try {
            localStorage.removeItem(ACCOUNT_STORAGE_KEY);
        } catch (error) {
            console.error('Account Reset Error:', error);
            return {
                success: false,
                message: 'حذف حساب انجام نشد.',
            };
        }

        clearSession();
        setUser(null);
        setIsAuthenticated(false);

        return { success: true };
    }, []);

    // =====================================================
    // Context Value
    // =====================================================

    const contextValue = useMemo(
        () => ({
            isAuthenticated,
            user,
            loading,
            hasAccount,
            registerAccount,
            login,
            logout,
            updateAccount,
            updateProfileAvatar,
            removeProfileAvatar,
            getAccount,
            getSecurityQuestionsForEmail,
            verifySecurityAnswers,
            resetAccount,
        }),
        [
            isAuthenticated,
            user,
            loading,
            hasAccount,
            registerAccount,
            login,
            logout,
            updateAccount,
            updateProfileAvatar,
            removeProfileAvatar,
            getAccount,
            getSecurityQuestionsForEmail,
            verifySecurityAnswers,
            resetAccount,
        ]
    );

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}


// =========================================================
// useAuth
// =========================================================

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth باید داخل AuthProvider استفاده شود.');
    }

    return context;
}