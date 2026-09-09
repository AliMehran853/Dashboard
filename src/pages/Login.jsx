import {
    useEffect,
    useState,
} from 'react';

import {
    useNavigate,
} from 'react-router-dom';

import {
    LockKeyhole,
    Mail,
    Eye,
    EyeOff,
    Store,
} from 'lucide-react';

import {
    useTranslation,
} from 'react-i18next';

import {
    useAuth,
} from '../context/AuthContext';


function Login() {

    const navigate = useNavigate();

    const {
        t,
        i18n,
    } = useTranslation();

    const {
        login,
        isAuthenticated,
        loading,
    } = useAuth();


    // =========================================================
    // Form State
    // =========================================================

    const [
        email,
        setEmail,
    ] = useState('');


    const [
        password,
        setPassword,
    ] = useState('');


    const [
        showPassword,
        setShowPassword,
    ] = useState(false);


    const [
        rememberMe,
        setRememberMe,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState('');


    const [
        isLoading,
        setIsLoading,
    ] = useState(false);


    // =========================================================
    // Redirect Authenticated User
    // =========================================================

    useEffect(() => {

        if (
            !loading &&
            isAuthenticated
        ) {

            navigate(
                '/dashboard',
                {
                    replace: true,
                }
            );

        }

    }, [
        loading,
        isAuthenticated,
        navigate,
    ]);


    // =========================================================
    // Load Remembered Email
    // =========================================================

    useEffect(() => {

        const rememberedEmail =
            localStorage.getItem(
                'rememberedEmail'
            );


        if (rememberedEmail) {

            setEmail(
                rememberedEmail
            );

            setRememberMe(true);

        }

    }, []);


    // =========================================================
    // Submit
    // =========================================================

    const handleSubmit = (
        event
    ) => {

        event.preventDefault();


        if (isLoading) {
            return;
        }


        setError('');


        const cleanEmail =
            email.trim();


        const cleanPassword =
            password.trim();


        // =====================================================
        // Validation
        // =====================================================

        if (!cleanEmail) {

            setError(
                t(
                    'login.errors.emailRequired'
                )
            );

            return;

        }


        if (!cleanPassword) {

            setError(
                t(
                    'login.errors.passwordRequired'
                )
            );

            return;

        }


        // =====================================================
        // Start Loading
        // =====================================================

        setIsLoading(true);


        try {

            const result =
                login(
                    cleanEmail,
                    cleanPassword
                );


            // =================================================
            // Failed Login
            // =================================================

            if (
                !result ||
                !result.success
            ) {

                setError(
                    result?.message ||
                    t(
                        'login.errors.invalidCredentials'
                    )
                );

                setIsLoading(false);

                return;

            }


            // =================================================
            // Remember Email
            // =================================================

            if (rememberMe) {

                localStorage.setItem(
                    'rememberedEmail',
                    cleanEmail
                );

            } else {

                localStorage.removeItem(
                    'rememberedEmail'
                );

            }


            // =================================================
            // Navigation
            // =================================================

            navigate(
                '/dashboard',
                {
                    replace: true,
                }
            );

        } catch (loginError) {

            console.error(
                'Login failed:',
                loginError
            );


            setError(
                t(
                    'login.errors.failed'
                )
            );


            setIsLoading(false);

        }

    };


    // =========================================================
    // Render
    // =========================================================

    return (

        <main
            dir={i18n.dir()}

            className="
                min-h-screen

                bg-slate-50
                dark:bg-slate-950

                text-slate-900
                dark:text-white

                flex
                items-center
                justify-center

                px-4
                py-8

                relative
                overflow-hidden

                transition-colors
                duration-300
            "
        >

            {/* =================================================
                Background
            ================================================= */}

            <div
                className="
                    absolute
                    inset-0

                    overflow-hidden

                    pointer-events-none
                "
            >

                <div
                    className="
                        absolute

                        -top-40
                        -right-40

                        w-72
                        h-72

                        sm:w-96
                        sm:h-96

                        bg-emerald-500/10

                        rounded-full
                        blur-3xl
                    "
                />


                <div
                    className="
                        absolute

                        -bottom-40
                        -left-40

                        w-72
                        h-72

                        sm:w-96
                        sm:h-96

                        bg-cyan-500/10

                        rounded-full
                        blur-3xl
                    "
                />


                <div
                    className="
                        absolute

                        top-1/2
                        left-1/2

                        -translate-x-1/2
                        -translate-y-1/2

                        w-[400px]
                        h-[400px]

                        sm:w-[500px]
                        sm:h-[500px]

                        bg-emerald-500/5

                        rounded-full
                        blur-3xl
                    "
                />

            </div>


            {/* =================================================
                Main Container
            ================================================= */}

            <div
                className="
                    relative

                    w-full
                    max-w-md
                "
            >

                {/* =================================================
                    Logo
                ================================================= */}

                <div
                    className="
                        flex
                        justify-center

                        mb-6
                    "
                >

                    <div
                        className="
                            relative
                        "
                    >

                        <div
                            className="
                                absolute
                                inset-0

                                bg-emerald-400/20

                                blur-xl
                                rounded-2xl
                            "
                        />


                        <div
                            className="
                                relative

                                w-16
                                h-16

                                rounded-2xl

                                bg-gradient-to-br
                                from-emerald-400
                                to-emerald-600

                                flex
                                items-center
                                justify-center

                                shadow-xl
                                shadow-emerald-900/30
                            "
                        >

                            <Store
                                size={32}
                                strokeWidth={1.8}

                                className="
                                    text-white
                                "
                            />

                        </div>

                    </div>

                </div>


                {/* =================================================
                    Heading
                ================================================= */}

                <div
                    className="
                        text-center

                        mb-7
                        sm:mb-8
                    "
                >

                    <h1
                        className="
                            text-2xl
                            sm:text-3xl

                            font-bold
                            tracking-tight

                            text-slate-900
                            dark:text-white
                        "
                    >
                        {t(
                            'login.brand.title'
                        )}
                    </h1>


                    <p
                        className="
                            text-slate-500
                            dark:text-slate-400

                            mt-2

                            text-xs
                            sm:text-sm
                        "
                    >
                        {t(
                            'login.brand.description'
                        )}
                    </p>

                </div>


                {/* =================================================
                    Card
                ================================================= */}

                <div
                    className="
                        bg-white/90
                        dark:bg-slate-900/70

                        backdrop-blur-xl

                        border
                        border-slate-200
                        dark:border-slate-800/80

                        rounded-3xl

                        p-5
                        sm:p-7

                        shadow-2xl

                        shadow-slate-300/20
                        dark:shadow-black/30
                    "
                >

                    <div
                        className="
                            mb-6
                            sm:mb-7
                        "
                    >

                        <h2
                            className="
                                text-lg
                                sm:text-xl

                                font-semibold

                                text-slate-900
                                dark:text-white
                            "
                        >
                            {t(
                                'login.form.title'
                            )}
                        </h2>


                        <p
                            className="
                                text-slate-500
                                dark:text-slate-400

                                text-xs
                                sm:text-sm

                                mt-1
                            "
                        >
                            {t(
                                'login.form.description'
                            )}
                        </p>

                    </div>


                    {/* =================================================
                        Error
                    ================================================= */}

                    {error && (

                        <div
                            role="alert"

                            className="
                                mb-5

                                rounded-xl

                                border
                                border-red-500/20

                                bg-red-500/5

                                px-4
                                py-3

                                text-sm
                                text-red-500
                                dark:text-red-400

                                leading-5
                            "
                        >
                            {error}
                        </div>

                    )}


                    {/* =================================================
                        Form
                    ================================================= */}

                    <form
                        onSubmit={
                            handleSubmit
                        }

                        className="
                            space-y-5
                        "
                    >

                        {/* =================================================
                            Email
                        ================================================= */}

                        <div>

                            <label
                                htmlFor="email"

                                className="
                                    block

                                    text-sm
                                    font-medium

                                    text-slate-700
                                    dark:text-slate-300

                                    mb-2
                                "
                            >
                                {t(
                                    'login.fields.email.label'
                                )}
                            </label>


                            <div
                                className="
                                    relative
                                "
                            >

                                <Mail
                                    size={19}

                                    className={`
                                        absolute

                                        top-1/2
                                        -translate-y-1/2

                                        text-slate-400
                                        dark:text-slate-500

                                        pointer-events-none

                                        ${
                                            i18n.dir() === 'rtl'
                                                ? 'right-4'
                                                : 'left-4'
                                        }
                                    `}
                                />


                                <input
                                    id="email"

                                    name="email"

                                    type="email"

                                    value={email}

                                    onChange={(
                                        event
                                    ) => {

                                        setEmail(
                                            event.target.value
                                        );


                                        if (error) {
                                            setError('');
                                        }

                                    }}

                                    placeholder={t(
                                        'login.fields.email.placeholder'
                                    )}

                                    autoComplete="email"

                                    dir="ltr"

                                    disabled={isLoading}

                                    className="
                                        w-full

                                        bg-slate-50
                                        dark:bg-slate-950/70

                                        border
                                        border-slate-200
                                        dark:border-slate-800

                                        rounded-xl

                                        py-3.5

                                        pr-4
                                        pl-11

                                        rtl:pr-11
                                        rtl:pl-4

                                        text-sm

                                        text-slate-900
                                        dark:text-white

                                        placeholder:text-slate-400
                                        dark:placeholder:text-slate-600

                                        outline-none

                                        transition

                                        focus:border-emerald-500/60
                                        focus:ring-2
                                        focus:ring-emerald-500/10

                                        disabled:opacity-60
                                        disabled:cursor-not-allowed
                                    "
                                />

                            </div>

                        </div>


                        {/* =================================================
                            Password
                        ================================================= */}

                        <div>

                            <div
                                className="
                                    flex

                                    items-center
                                    justify-between

                                    gap-3

                                    mb-2
                                "
                            >

                                <label
                                    htmlFor="password"

                                    className="
                                        text-sm
                                        font-medium

                                        text-slate-700
                                        dark:text-slate-300
                                    "
                                >
                                    {t(
                                        'login.fields.password.label'
                                    )}
                                </label>


                                <button
                                    type="button"

                                    disabled={isLoading}

                                    className="
                                        shrink-0

                                        text-xs

                                        text-emerald-600
                                        dark:text-emerald-400

                                        hover:text-emerald-500
                                        dark:hover:text-emerald-300

                                        transition

                                        disabled:opacity-50
                                    "
                                >
                                    {t(
                                        'login.actions.forgotPassword'
                                    )}
                                </button>

                            </div>


                            <div
                                className="
                                    relative
                                "
                            >

                                <LockKeyhole
                                    size={19}

                                    className={`
                                        absolute

                                        top-1/2
                                        -translate-y-1/2

                                        text-slate-400
                                        dark:text-slate-500

                                        pointer-events-none

                                        ${
                                            i18n.dir() === 'rtl'
                                                ? 'right-4'
                                                : 'left-4'
                                        }
                                    `}
                                />


                                <input
                                    id="password"

                                    name="password"

                                    type={
                                        showPassword
                                            ? 'text'
                                            : 'password'
                                    }

                                    value={
                                        password
                                    }

                                    onChange={(
                                        event
                                    ) => {

                                        setPassword(
                                            event.target.value
                                        );


                                        if (error) {
                                            setError('');
                                        }

                                    }}

                                    placeholder={t(
                                        'login.fields.password.placeholder'
                                    )}

                                    autoComplete="current-password"

                                    dir="ltr"

                                    disabled={isLoading}

                                    className="
                                        w-full

                                        bg-slate-50
                                        dark:bg-slate-950/70

                                        border
                                        border-slate-200
                                        dark:border-slate-800

                                        rounded-xl

                                        py-3.5

                                        pr-12
                                        pl-12

                                        text-sm

                                        text-slate-900
                                        dark:text-white

                                        placeholder:text-slate-400
                                        dark:placeholder:text-slate-600

                                        outline-none

                                        transition

                                        focus:border-emerald-500/60
                                        focus:ring-2
                                        focus:ring-emerald-500/10

                                        disabled:opacity-60
                                        disabled:cursor-not-allowed
                                    "
                                />


                                <button
                                    type="button"

                                    onClick={() =>
                                        setShowPassword(
                                            (
                                                previous
                                            ) =>
                                                !previous
                                        )
                                    }

                                    disabled={isLoading}

                                    className={`
                                        absolute

                                        top-1/2
                                        -translate-y-1/2

                                        p-1.5

                                        text-slate-400
                                        dark:text-slate-500

                                        hover:text-slate-700
                                        dark:hover:text-slate-300

                                        transition

                                        disabled:opacity-50

                                        ${
                                            i18n.dir() === 'rtl'
                                                ? 'left-3'
                                                : 'right-3'
                                        }
                                    `}

                                    aria-label={
                                        showPassword
                                            ? t(
                                                'login.actions.hidePassword'
                                            )
                                            : t(
                                                'login.actions.showPassword'
                                            )
                                    }
                                >

                                    {showPassword ? (

                                        <EyeOff
                                            size={18}
                                        />

                                    ) : (

                                        <Eye
                                            size={18}
                                        />

                                    )}

                                </button>

                            </div>

                        </div>


                        {/* =================================================
                            Remember Me
                        ================================================= */}

                        <label
                            className="
                                flex
                                items-center
                                gap-2

                                cursor-pointer
                                select-none

                                pt-1
                            "
                        >

                            <input
                                type="checkbox"

                                checked={
                                    rememberMe
                                }

                                onChange={(
                                    event
                                ) =>
                                    setRememberMe(
                                        event.target.checked
                                    )
                                }

                                disabled={
                                    isLoading
                                }

                                className="
                                    w-4
                                    h-4

                                    rounded

                                    accent-emerald-500

                                    cursor-pointer

                                    disabled:cursor-not-allowed
                                "
                            />


                            <span
                                className="
                                    text-sm

                                    text-slate-600
                                    dark:text-slate-400
                                "
                            >
                                {t(
                                    'login.fields.rememberMe'
                                )}
                            </span>

                        </label>


                        {/* =================================================
                            Submit
                        ================================================= */}

                        <button
                            type="submit"

                            disabled={
                                isLoading
                            }

                            className="
                                w-full

                                py-3.5

                                rounded-xl

                                bg-gradient-to-l
                                from-emerald-500
                                to-emerald-600

                                hover:from-emerald-400
                                hover:to-emerald-500

                                disabled:opacity-60
                                disabled:cursor-not-allowed

                                active:scale-[0.99]

                                text-slate-950
                                dark:text-white

                                font-semibold

                                shadow-lg
                                shadow-emerald-900/20

                                transition
                                duration-200
                            "
                        >

                            {isLoading
                                ? t(
                                    'login.actions.loggingIn'
                                )
                                : t(
                                    'login.actions.login'
                                )
                            }

                        </button>

                    </form>


                    {/* =================================================
                        Security
                    ================================================= */}

                    <div
                        className="
                            mt-6
                            pt-5

                            border-t
                            border-slate-200
                            dark:border-slate-800/80
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                justify-center

                                gap-2

                                text-xs
                                text-slate-500

                                text-center
                            "
                        >

                            <LockKeyhole
                                size={14}
                                className="shrink-0"
                            />


                            <span>
                                {t(
                                    'login.security'
                                )}
                            </span>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    Footer
                ================================================= */}

                <p
                    className="
                        text-center

                        text-xs

                        text-slate-500
                        dark:text-slate-600

                        mt-6
                    "
                >
                    {t(
                        'login.footer'
                    )}
                </p>

            </div>

        </main>

    );

}


export default Login;
