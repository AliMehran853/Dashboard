import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Users,
} from 'lucide-react';

import {
  useTranslation,
} from 'react-i18next';


// =========================================================
// Credit Stats
// =========================================================

function CreditStats({
  statistics = {},
  loading = false,
}) {
  const {
    t,
    i18n,
  } = useTranslation();


  // =======================================================
  // Values
  // =======================================================

  const totalDebt =
    Number(
      statistics.totalDebt
    ) || 0;

  const totalRemaining =
    Number(
      statistics.totalRemaining
    ) || 0;

  const debtorCount =
    Number(
      statistics.debtorCount
    ) || 0;

  const totalPaid =
    Number(
      statistics.totalPaid
    ) || 0;


  // =======================================================
  // Stats
  // =======================================================

  const stats = [
    {
      title:
        t(
          'credit.stats.totalDebt.title'
        ),

      value:
        totalDebt,

      unit:
        t(
          'common.currency'
        ),

      label:
        t(
          'credit.stats.totalDebt.description'
        ),

      icon:
        CreditCard,

      color:
        'amber',
    },

    {
      title:
        t(
          'credit.stats.remaining.title',
          {
            defaultValue:
              'بدهی باقی‌مانده',
          }
        ),

      value:
        totalRemaining,

      unit:
        t(
          'common.currency'
        ),

      label:
        t(
          'credit.stats.remaining.description',
          {
            defaultValue:
              'مجموع بدهی پرداخت‌نشده مشتریان',
          }
        ),

      icon:
        AlertCircle,

      color:
        'orange',
    },

    {
      title:
        t(
          'credit.stats.debtors.title'
        ),

      value:
        debtorCount,

      unit:
        t(
          'credit.stats.debtors.unit'
        ),

      label:
        t(
          'credit.stats.debtors.description'
        ),

      icon:
        Users,

      color:
        'cyan',
    },

    {
      title:
        t(
          'credit.stats.settled.title'
        ),

      value:
        totalPaid,

      unit:
        t(
          'common.currency'
        ),

      label:
        t(
          'credit.stats.settled.description'
        ),

      icon:
        CheckCircle2,

      color:
        'emerald',
    },
  ];


  // =======================================================
  // Colors (icon tones only — card tint follows accent)
  // =======================================================

  const colorClasses = {
    amber: {
      iconBg:
        'bg-amber-500/10',

      iconText:
        'text-amber-500 dark:text-amber-400',

      accent:
        'bg-amber-500',
    },

    orange: {
      iconBg:
        'bg-orange-500/10',

      iconText:
        'text-orange-500 dark:text-orange-400',

      accent:
        'bg-orange-500',
    },

    cyan: {
      iconBg:
        'bg-cyan-500/10',

      iconText:
        'text-cyan-500 dark:text-cyan-400',

      accent:
        'bg-cyan-500',
    },

    emerald: {
      iconBg:
        'bg-emerald-500/10',

      iconText:
        'text-emerald-500 dark:text-emerald-400',

      accent:
        'bg-emerald-500',
    },
  };


  // =======================================================
  // Format Number
  // =======================================================

  const isEnglish =
    String(
      i18n.language || ''
    )
      .toLowerCase()
      .startsWith('en');


  const formatNumber = (
    number
  ) => {
    return new Intl.NumberFormat(
      isEnglish
        ? 'en-US'
        : 'fa-IR'
    ).format(
      Number(number) || 0
    );
  };


  // =======================================================
  // Render
  // =======================================================

  return (
    <section>

      {/* ===================================================
          Header
      ==================================================== */}

      <div
        className="
          mb-4
          sm:mb-5
        "
      >

        <div
          className="
            flex
            items-center
            gap-2.5
          "
        >

          <div
            className="
              h-5
              w-1
              rounded-full
              bg-[var(--accent-500)]
            "
          />

          <h2
            className="
              text-base
              sm:text-lg
              font-semibold
              tracking-tight
              text-[var(--text)]
            "
          >
            {t(
              'credit.stats.sectionTitle'
            )}
          </h2>

        </div>


        <p
          className="
            mt-1.5
            text-[11px]
            sm:text-xs
            text-[var(--text-muted)]
          "
        >
          {t(
            'credit.stats.sectionDescription'
          )}
        </p>

      </div>


      {/* ===================================================
          Cards
      ==================================================== */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4
          gap-3
          sm:gap-4
        "
      >

        {stats.map(
          (stat) => {
            const Icon =
              stat.icon;

            const colors =
              colorClasses[
                stat.color
              ];


            return (
              <article
                key={
                  stat.title
                }
                className="
                  group
                  relative
                  min-w-0
                  overflow-hidden
                  rounded-2xl
                  border
                  border-[var(--border)]
                  p-4
                  sm:p-5
                  shadow-[var(--shadow-card)]
                  transition-all
                  duration-300
                  ease-[var(--ease-out)]
                  hover:-translate-y-0.5
                  hover:border-[var(--glass-border-hover)]
                  hover:shadow-[var(--shadow-card-hover)]
                "
                style={{
                  background: `
                    linear-gradient(
                      135deg,
                      var(--glass-active-tint),
                      var(--glass-active-tint-soft) 70%,
                      transparent 100%
                    ),
                    var(--surface)
                  `,
                }}
              >

                {/* =================================================
                    Hover Tint Overlay
                    Fades in on hover, follows accent color.
                ================================================== */}

                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    rounded-2xl
                    opacity-0
                    transition-opacity
                    duration-300
                    ease-[var(--ease-out)]
                    group-hover:opacity-100
                  "
                  style={{
                    background: `
                      linear-gradient(
                        135deg,
                        var(--glass-hover-tint),
                        var(--glass-hover-tint-soft) 70%,
                        transparent 100%
                      )
                    `,
                  }}
                />


                {/* =================================================
                    Accent Top Line (per-tone, for icon identity)
                ================================================== */}

                <div
                  aria-hidden="true"
                  className={`
                    absolute
                    inset-x-0
                    top-0
                    h-px
                    opacity-60
                    transition-opacity
                    duration-300
                    group-hover:opacity-100
                    ${colors.accent}
                  `}
                />


                {/* =================================================
                    Decorative Glow
                ================================================== */}

                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    -right-8
                    -top-8
                    h-24
                    w-24
                    rounded-full
                    bg-white/5
                    blur-2xl
                    opacity-0
                    transition-opacity
                    duration-300
                    group-hover:opacity-100
                    dark:bg-white/[0.03]
                  "
                />


                {/* =================================================
                    Top Row
                ================================================== */}

                <div
                  className="
                    relative
                    z-10
                    flex
                    items-start
                    justify-between
                    gap-3
                  "
                >

                  <div
                    className={`
                      flex
                      h-10
                      w-10
                      sm:h-11
                      sm:w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-white/5
                      ${colors.iconBg}
                    `}
                  >

                    <Icon
                      size={20}
                      strokeWidth={1.9}
                      className={
                        colors.iconText
                      }
                    />

                  </div>


                  {loading ? (
                    <span
                      className="
                        h-5
                        w-14
                        rounded-md
                        bg-[var(--surface-muted)]
                        animate-pulse
                      "
                    />
                  ) : (
                    <span
                      className="
                        rounded-md
                        border
                        border-[var(--border)]
                        bg-[var(--surface-muted)]
                        px-2
                        py-1
                        text-[9px]
                        sm:text-[10px]
                        font-medium
                        text-[var(--text-muted)]
                      "
                    >
                      {t(
                        'common.today'
                      )}
                    </span>
                  )}

                </div>


                {/* =================================================
                    Content
                ================================================== */}

                <div
                  className="
                    relative
                    z-10
                    mt-4
                    sm:mt-5
                  "
                >

                  <p
                    className="
                      text-xs
                      sm:text-sm
                      font-medium
                      text-[var(--text-secondary)]
                    "
                  >
                    {stat.title}
                  </p>


                  <div
                    className="
                      mt-1.5
                      flex
                      min-w-0
                      items-baseline
                      gap-1.5
                    "
                  >

                    {loading ? (
                      <div
                        className="
                          h-8
                          w-28
                          rounded-lg
                          bg-[var(--surface-muted)]
                          animate-pulse
                        "
                      />
                    ) : (
                      <>

                        <h3
                          dir="ltr"
                          className="
                            min-w-0
                            truncate
                            number-font
                            text-2xl
                            font-bold
                            tracking-tight
                            text-[var(--text-primary)]
                          "
                        >
                          {formatNumber(
                            stat.value
                          )}
                        </h3>


                        <span
                          className="
                            shrink-0
                            text-xs
                            sm:text-sm
                            font-medium
                            text-[var(--text-muted)]
                          "
                        >
                          {stat.unit}
                        </span>

                      </>
                    )}

                  </div>


                  <p
                    className="
                      mt-2.5
                      min-h-[2.5rem]
                      text-[10px]
                      sm:text-[11px]
                      leading-5
                      text-[var(--text-muted)]
                    "
                  >
                    {stat.label}
                  </p>

                </div>


                {/* =================================================
                    Bottom indicator
                ================================================== */}

                <div
                  className="
                    relative
                    z-10
                    mt-4
                    h-px
                    overflow-hidden
                    rounded-full
                    bg-[var(--border)]
                  "
                >

                  <div
                    className={`
                      h-full
                      w-10
                      rounded-full
                      opacity-70
                      transition-all
                      duration-500
                      group-hover:w-20
                      group-hover:opacity-100
                      ${colors.accent}
                    `}
                  />

                </div>

              </article>
            );
          }
        )}

      </div>

    </section>
  );
}


export default CreditStats;