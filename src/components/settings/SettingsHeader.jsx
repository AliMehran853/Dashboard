import {
    Settings,
} from 'lucide-react';

import {
    useTranslation,
} from 'react-i18next';


// =========================================================
// Settings Header
// =========================================================

function SettingsHeader() {

    const {
        t,
        i18n,
    } = useTranslation();


    return (

        <section
            dir={
                i18n.dir()
            }

            className="
                relative
                overflow-hidden

                rounded-2xl

                border
                border-[var(--border-subtle)]

                bg-[var(--surface)]

                p-4

                sm:p-5
                md:p-6
            "
        >

            {/* =================================================
                Background Glow
            ================================================== */}

            <div
                aria-hidden="true"
                className="
                    pointer-events-none

                    absolute
                    -start-16
                    -top-20

                    h-48
                    w-48

                    rounded-full

                    bg-emerald-500/[0.06]

                    blur-3xl

                    dark:bg-emerald-400/[0.055]
                "
            />


            <div
                aria-hidden="true"
                className="
                    pointer-events-none

                    absolute
                    -end-16
                    -bottom-24

                    h-44
                    w-44

                    rounded-full

                    bg-cyan-500/[0.025]

                    blur-3xl

                    dark:bg-cyan-400/[0.035]
                "
            />


            {/* =================================================
                Content
            ================================================== */}

            <div
                className="
                    relative
                    z-10

                    flex
                    flex-col
                    gap-4

                    sm:flex-row
                    sm:items-center
                "
            >

                {/* =================================================
                    Icon
                ================================================== */}

                <div
                    className="
                        flex
                        h-11
                        w-11
                        shrink-0

                        items-center
                        justify-center

                        rounded-2xl

                        border
                        border-emerald-500/10

                        bg-emerald-500/10

                        sm:h-12
                        sm:w-12
                    "
                >

                    <Settings
                        size={21}
                        strokeWidth={1.9}
                        className="
                            text-emerald-500
                            dark:text-emerald-400
                        "
                    />

                </div>


                {/* =================================================
                    Text
                ================================================== */}

                <div
                    className="
                        min-w-0
                    "
                >

                    {/* Brand */}

                    <div
                        className="
                            flex
                            items-center
                            gap-2
                        "
                    >

                        <span
                            className="
                                h-2
                                w-2
                                shrink-0

                                rounded-full

                                bg-emerald-500

                                shadow-[0_0_12px_rgba(16,185,129,0.35)]
                            "
                        />


                        <span
                            className="
                                text-[10px]
                                font-medium

                                uppercase
                                tracking-[0.12em]

                                text-emerald-600
                                dark:text-emerald-400
                            "
                        >
                            Taqwa
                        </span>

                    </div>


                    {/* Title */}

                    <h1
                        className="
                            mt-2

                            truncate

                            text-xl
                            font-semibold

                            tracking-[-0.02em]

                            text-[var(--text)]

                            sm:text-2xl
                            md:text-3xl
                        "
                    >
                        {
                            t(
                                'settings.page.title'
                            )
                        }
                    </h1>


                    {/* Description */}

                    <p
                        className="
                            mt-1.5

                            max-w-2xl

                            text-xs
                            leading-5

                            text-[var(--text-muted)]

                            sm:text-sm
                            sm:leading-6
                        "
                    >
                        {
                            t(
                                'settings.page.description'
                            )
                        }
                    </p>

                </div>

            </div>

        </section>

    );

}


export default SettingsHeader;