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
    ArrowRight,
    ArrowLeft,
    ShieldCheck,
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


    const isRTL =
        i18n.dir() === 'rtl';


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
                relative

                flex
                min-h-screen
                items-center
                justify-center

                overflow-hidden

                bg-[var(--page-bg)]

                px-4
                py-8
                sm:px-6
                sm:py-10

                text-[var(--text)]

                transition-colors
                duration-300
            "
        >

            {/* =================================================
                Ambient Background
            ================================================== */}

            <div
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    overflow-hidden
                "
            >

                {/* Top Right Glow */}

                <div
                    className="
                        absolute

                        -right-28
                        -top-28

                        h-72
                        w-72

                        sm:h-96
                        sm:w-96

                        rounded-full

                        bg-emerald-500/[0.08]

                        blur-3xl
                    "
                />


                {/* Bottom Left Glow */}

                <div
                    className="
                        absolute

                        -bottom-28
                        -left-28

                        h-72
                        w-72

                        sm:h-96
                        sm:w-96

                        rounded-full

                        bg-cyan-500/[0.07]

                        blur-3xl
                    "
                />


                {/* Center Glow */}

                <div
                    className="
                        absolute

                        left-1/2
                        top-1/2

                        h-[22rem]
                        w-[22rem]

                        sm:h-[30rem]
                        sm:w-[30rem]

                        -translate-x-1/2
                        -translate-y-1/2

                        rounded-full

                        bg-emerald-500/[0.035]

                        blur-3xl
                    "
                />


                {/* Subtle Grid */}

                <div
                    className="
                        absolute
                        inset-0

                        opacity-[0.025]

                        dark:opacity-[0.035]

                        [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)]

                        [background-size:32px_32px]

                        text-slate-900
                        dark:text-white
                    "
                />

            </div>


            {/* =================================================
                Main Container
            ================================================== */}

            <div
                className="
                    relative
                    z-10

                    w-full
                    max-w-[27rem]
                "
            >

                {/* =================================================
                    Brand
                ================================================== */}

                <div
                    className="
                        mb-6
                        text-center

                        sm:mb-7
                    "
                >

                    {/* =================================================
                        Logo
                    ================================================== */}

                    <div
                        className="
                            mb-4

                            flex
                            justify-center
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
                                    -inset-2

                                    rounded-2xl

                                    bg-emerald-500/[0.12]

                                    blur-xl
                                "
                            />


                            <div
                                className="
                                    relative

                                    flex

                                    h-14
                                    w-14

                                    sm:h-16
                                    sm:w-16

                                    items-center
                                    justify-center

                                    overflow-hidden

                                    rounded-2xl

                                    border
                                    border-emerald-400/30

                                    bg-gradient-to-br
                                    from-emerald-400
                                    via-emerald-500
                                    to-emerald-600

                                    shadow-[0_12px_35px_rgba(16,185,129,0.22)]
                                "
                            >

                                <div
                                    className="
                                        absolute
                                        inset-0

                                        bg-white/[0.07]
                                    "
                                />


                                <div
                                    className="
                                        absolute

                                        -right-3
                                        -top-3

                                        h-8
                                        w-8

                                        rounded-full

                                        bg-white/[0.12]

                                        blur-lg
                                    "
                                />


                                <Store
                                    size={27}

                                    strokeWidth={1.8}

                                    className="
                                        relative
                                        z-10

                                        text-white
                                    "
                                />

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        Heading
                    ================================================== */}

                    <h1
                        className="
                            px-3

                            text-[1.35rem]
                            sm:text-[1.5rem]

                            font-semibold

                            leading-tight

                            tracking-[-0.02em]

                            text-[var(--text)]
                        "
                    >

                        {
                            t(
                                'login.brand.title'
                            )
                        }

                    </h1>


                    <p
                        className="
                            mx-auto
                            mt-2

                            max-w-[24rem]

                            px-3

                            text-[11px]
                            sm:text-xs

                            leading-5

                            text-[var(--text-muted)]
                        "
                    >

                        {
                            t(
                                'login.brand.description'
                            )
                        }

                    </p>

                </div>


                {/* =================================================
                    Login Card
                ================================================== */}

                <section
                    className="
                        relative
                        overflow-hidden

                        rounded-3xl

                        border
                        border-[var(--glass-border)]

                        bg-[var(--surface)]

                        shadow-[var(--shadow-xl)]

                        backdrop-blur-xl

                        transition-colors
                        duration-300
                    "
                >

                    {/* =================================================
                        Card Accent
                    ================================================== */}

                    <div
                        className="
                            pointer-events-none

                            absolute
                            inset-x-0
                            top-0

                            h-px

                            bg-gradient-to-r
                            from-transparent
                            via-emerald-500/60
                            to-transparent

                            opacity-80
                        "
                    />


                    {/* =================================================
                        Card Glow
                    ================================================== */}

                    <div
                        className="
                            pointer-events-none

                            absolute

                            -right-16
                            -top-16

                            h-32
                            w-32

                            rounded-full

                            bg-emerald-500/[0.04]

                            blur-3xl
                        "
                    />


                    <div
                        className="
                            relative

                            p-5
                            sm:p-6
                            md:p-7
                        "
                    >

                        {/* =================================================
                            Form Header
                        ================================================== */}

                        <div
                            className="
                                mb-5
                                sm:mb-6
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center

                                    gap-2
                                "
                            >

                                <div
                                    className="
                                        flex
                                        h-8
                                        w-8

                                        shrink-0

                                        items-center
                                        justify-center

                                        rounded-lg

                                        bg-emerald-500/10

                                        text-emerald-600
                                        dark:text-emerald-400
                                    "
                                >

                                    <ShieldCheck
                                        size={16}
                                        strokeWidth={2}
                                    />

                                </div>


                                <div
                                    className="
                                        min-w-0
                                    "
                                >

                                    <h2
                                        className="
                                            truncate

                                            text-sm
                                            sm:text-[15px]

                                            font-semibold

                                            text-[var(--text)]
                                        "
                                    >

                                        {
                                            t(
                                                'login.form.title'
                                            )
                                        }

                                    </h2>


                                    <p
                                        className="
                                            mt-0.5

                                            text-[10px]
                                            sm:text-[11px]

                                            leading-4

                                            text-[var(--text-muted)]
                                        "
                                    >

                                        {
                                            t(
                                                'login.form.description'
                                            )
                                        }

                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            Error
                        ================================================== */}

                        {error && (

                            <div
                                role="alert"

                                className="
                                    mb-5

                                    rounded-xl

                                    border
                                    border-rose-500/20

                                    bg-rose-500/[0.06]
                                    dark:bg-rose-500/[0.08]

                                    px-3.5
                                    py-3

                                    text-[11px]
                                    sm:text-xs

                                    leading-5

                                    text-rose-600
                                    dark:text-rose-400
                                "
                            >

                                {error}

                            </div>

                        )}


                        {/* =================================================
                            Form
                        ================================================== */}

                        <form
                            onSubmit={
                                handleSubmit
                            }

                            className="
                                space-y-4.5
                            "
                        >

                            {/* =================================================
                                Email
                            ================================================== */}

                            <div>

                                <label
                                    htmlFor="email"

                                    className="
                                        mb-2

                                        block

                                        text-[11px]
                                        sm:text-xs

                                        font-medium

                                        text-[var(--text-muted)]
                                    "
                                >

                                    {
                                        t(
                                            'login.fields.email.label'
                                        )
                                    }

                                </label>


                                <div
                                    className="
                                        relative
                                    "
                                >

                                    <Mail
                                        size={17}

                                        strokeWidth={1.9}

                                        className={`
                                            pointer-events-none

                                            absolute

                                            top-1/2

                                            -translate-y-1/2

                                            text-[var(--text-soft)]

                                            ${
                                                isRTL
                                                    ? 'right-3.5'
                                                    : 'left-3.5'
                                            }
                                        `}
                                    />


                                    <input
                                        id="email"

                                        name="email"

                                        type="email"

                                        value={
                                            email
                                        }

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

                                        disabled={
                                            isLoading
                                        }

                                        className="
                                            block

                                            w-full

                                            rounded-xl

                                            border
                                            border-[var(--border)]

                                            bg-[var(--surface-muted)]

                                            py-3

                                            pl-11
                                            pr-4

                                            text-sm

                                            text-[var(--text)]

                                            placeholder:text-[var(--text-soft)]

                                            outline-none

                                            transition-all
                                            duration-200

                                            hover:border-[var(--border-hover)]

                                            focus:border-emerald-500/55

                                            focus:bg-[var(--surface)]

                                            focus:ring-2
                                            focus:ring-emerald-500/10

                                            disabled:cursor-not-allowed
                                            disabled:opacity-60
                                        "
                                    />

                                </div>

                            </div>


                            {/* =================================================
                                Password
                            ================================================== */}

                            <div>

                                <div
                                    className="
                                        mb-2

                                        flex

                                        items-center
                                        justify-between

                                        gap-3
                                    "
                                >

                                    <label
                                        htmlFor="password"

                                        className="
                                            text-[11px]
                                            sm:text-xs

                                            font-medium

                                            text-[var(--text-muted)]
                                        "
                                    >

                                        {
                                            t(
                                                'login.fields.password.label'
                                            )
                                        }

                                    </label>


                                    <button
                                        type="button"

                                        disabled={
                                            isLoading
                                        }

                                        className="
                                            shrink-0

                                            text-[10px]
                                            sm:text-[11px]

                                            font-medium

                                            text-emerald-600
                                            dark:text-emerald-400

                                            transition-colors

                                            hover:text-emerald-500
                                            dark:hover:text-emerald-300

                                            disabled:cursor-not-allowed
                                            disabled:opacity-50
                                        "
                                    >

                                        {
                                            t(
                                                'login.actions.forgotPassword'
                                            )
                                        }

                                    </button>

                                </div>


                                <div
                                    className="
                                        relative
                                    "
                                >

                                    <LockKeyhole
                                        size={17}

                                        strokeWidth={1.9}

                                        className={`
                                            pointer-events-none

                                            absolute

                                            top-1/2

                                            -translate-y-1/2

                                            text-[var(--text-soft)]

                                            ${
                                                isRTL
                                                    ? 'right-3.5'
                                                    : 'left-3.5'
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

                                        disabled={
                                            isLoading
                                        }

                                        className="
                                            block

                                            w-full

                                            rounded-xl

                                            border
                                            border-[var(--border)]

                                            bg-[var(--surface-muted)]

                                            py-3

                                            pl-11
                                            pr-12

                                            text-sm

                                            text-[var(--text)]

                                            placeholder:text-[var(--text-soft)]

                                            outline-none

                                            transition-all
                                            duration-200

                                            hover:border-[var(--border-hover)]

                                            focus:border-emerald-500/55

                                            focus:bg-[var(--surface)]

                                            focus:ring-2
                                            focus:ring-emerald-500/10

                                            disabled:cursor-not-allowed
                                            disabled:opacity-60
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

                                        disabled={
                                            isLoading
                                        }

                                        className={`
                                            absolute

                                            top-1/2

                                            -translate-y-1/2

                                            rounded-lg

                                            p-1.5

                                            text-[var(--text-soft)]

                                            transition-all
                                            duration-200

                                            hover:bg-[var(--surface-muted)]

                                            hover:text-[var(--text)]

                                            disabled:cursor-not-allowed
                                            disabled:opacity-50

                                            ${
                                                isRTL
                                                    ? 'left-2.5'
                                                    : 'right-2.5'
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
                                                size={17}
                                            />

                                        ) : (

                                            <Eye
                                                size={17}
                                            />

                                        )}

                                    </button>

                                </div>

                            </div>


                            {/* =================================================
                                Remember Me
                            ================================================== */}

                            <label
                                className="
                                    flex
                                    items-center

                                    gap-2.5

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
                                        h-4
                                        w-4

                                        shrink-0

                                        cursor-pointer

                                        rounded

                                        border

                                        accent-emerald-500

                                        disabled:cursor-not-allowed
                                    "
                                />


                                <span
                                    className="
                                        text-[11px]
                                        sm:text-xs

                                        text-[var(--text-muted)]
                                    "
                                >

                                    {
                                        t(
                                            'login.fields.rememberMe'
                                        )
                                    }

                                </span>

                            </label>


                            {/* =================================================
                                Submit
                            ================================================== */}

                            <button
                                type="submit"

                                disabled={
                                    isLoading
                                }

                                className="
                                    group

                                    flex
                                    w-full

                                    items-center
                                    justify-center

                                    gap-2

                                    rounded-xl

                                    border
                                    border-emerald-400/20

                                    bg-gradient-to-r
                                    from-emerald-500
                                    to-emerald-600

                                    py-3

                                    text-sm

                                    font-semibold

                                    text-white

                                    shadow-[0_10px_25px_rgba(16,185,129,0.18)]

                                    transition-all
                                    duration-200

                                    hover:-translate-y-0.5

                                    hover:from-emerald-400
                                    hover:to-emerald-500

                                    hover:shadow-[0_14px_30px_rgba(16,185,129,0.22)]

                                    active:translate-y-0

                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                    disabled:hover:translate-y-0
                                "
                            >

                                <span>
                                    {
                                        isLoading
                                            ? t(
                                                'login.actions.loggingIn'
                                            )
                                            : t(
                                                'login.actions.login'
                                            )
                                    }
                                </span>


                                {!isLoading && (

                                    isRTL ? (

                                        <ArrowLeft
                                            size={16}
                                            strokeWidth={2}
                                            className="
                                                transition-transform
                                                duration-200

                                                group-hover:-translate-x-0.5
                                            "
                                        />

                                    ) : (

                                        <ArrowRight
                                            size={16}
                                            strokeWidth={2}
                                            className="
                                                transition-transform
                                                duration-200

                                                group-hover:translate-x-0.5
                                            "
                                        />

                                    )

                                )}

                            </button>

                        </form>


                        {/* =================================================
                            Security
                        ================================================== */}

                        <div
                            className="
                                mt-5
                                pt-4

                                border-t
                                border-[var(--border-subtle)]
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-center

                                    gap-2

                                    text-center

                                    text-[10px]
                                    sm:text-[11px]

                                    leading-4

                                    text-[var(--text-soft)]
                                "
                            >

                                <LockKeyhole
                                    size={13}

                                    className="
                                        shrink-0
                                    "
                                />


                                <span>
                                    {
                                        t(
                                            'login.security'
                                        )
                                    }
                                </span>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    Footer
                ================================================== */}

                <p
                    className="
                        mt-5

                        text-center

                        text-[10px]
                        sm:text-[11px]

                        leading-4

                        text-[var(--text-soft)]
                    "
                >

                    {
                        t(
                            'login.footer'
                        )
                    }

                </p>

            </div>

        </main>

    );

}


export default Login;