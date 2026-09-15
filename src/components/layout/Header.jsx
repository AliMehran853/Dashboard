import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  Sun,
  Moon,
  Menu,
  ShoppingCart,
  AlertTriangle,
  CreditCard,
  CheckCircle2,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import ProfileMenu from "./ProfileMenu";
import {
  buildNotifications,
  recordSuccessfulAction,
  markNotificationsAsRead,
} from "../../utils/notificationService";

// =========================================================
// Constants
// =========================================================

const PAGE_MAP = {
  "/": { title: "common.dashboard", description: "common.dashboardSummary" },
  "/dashboard": {
    title: "common.dashboard",
    description: "common.dashboardSummary",
  },
  "/products": {
    title: "navigation.products",
    description: "common.dashboardSummary",
  },
  "/sales": {
    title: "navigation.sales",
    description: "common.dashboardSummary",
  },
  "/credit": {
    title: "navigation.credit",
    description: "common.dashboardSummary",
  },
  "/credit-sales": {
    title: "navigation.creditSales",
    description: "common.dashboardSummary",
  },
  "/shopping-list": {
    title: "navigation.shoppingList",
    description: "common.dashboardSummary",
  },
  "/reports": {
    title: "navigation.reports",
    description: "common.dashboardSummary",
  },
  "/settings": {
    title: "navigation.settings",
    description: "common.dashboardSummary",
  },
};

// ✅ FIXED: تمام eventهای db.js — قبلاً فقط "credit-updated" (اشتباه) بود
const DB_EVENTS = [
  "database-updated",
  "products-updated",
  "categories-updated",
  "units-updated",
  "purchases-updated",
  "sales-updated",
  "credit-sales-updated",
  "credit-payments-updated",
  "customers-updated",
  "expenses-updated",
  "shopping-list-updated",
];

const NOTIFICATION_ICONS = {
  lowStock: {
    icon: AlertTriangle,
    className: "text-[var(--warning)] bg-[var(--warning-soft)]",
  },
  newSale: {
    icon: ShoppingCart,
    className: "text-[var(--success)] bg-[var(--success-soft)]",
  },
  credit: {
    icon: CreditCard,
    className: "text-[var(--danger)] bg-[var(--danger-soft)]",
  },
};

const DEFAULT_NOTIFICATION_ICON = {
  icon: CheckCircle2,
  className: "text-[var(--info)] bg-[var(--info-soft)]",
};

// =========================================================
// Header
// =========================================================

function Header({ onMenuClick }) {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [themeAnimating, setThemeAnimating] = useState(false);

  const notificationRef = useRef(null);
  const notificationPanelRef = useRef(null);
  const notificationOpenRef = useRef(false);
  const themeButtonRef = useRef(null);

  const isDark = theme === "dark";

  useEffect(() => {
    notificationOpenRef.current = notificationOpen;
  }, [notificationOpen]);

  const pageInfo = useMemo(
    () => PAGE_MAP[location.pathname] || PAGE_MAP["/"],
    [location.pathname],
  );

  const loadNotifications = useCallback(
    async ({ keepCurrentWhileOpen = true, mergeNewWhileOpen = true } = {}) => {
      try {
        setNotificationsLoading(true);
        const result = await buildNotifications({ includeRead: true });
        const all = Array.isArray(result) ? result : [];
        const unread = all.filter((n) => !n.isRead);
        setUnreadCount(unread.length);

        if (notificationOpenRef.current && keepCurrentWhileOpen) {
          if (mergeNewWhileOpen) {
            setNotifications((current) => {
              const currentIds = new Set(current.map((i) => String(i.id)));
              const newUnread = unread.filter(
                (i) => !currentIds.has(String(i.id)),
              );
              if (newUnread.length === 0) return current;
              return [...newUnread, ...current].slice(0, 10);
            });
          }
          return;
        }
        setNotifications(unread);
      } catch (error) {
        console.error("Failed to load notifications:", error);
        setNotifications([]);
        setUnreadCount(0);
      } finally {
        setNotificationsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadNotifications({
      keepCurrentWhileOpen: false,
      mergeNewWhileOpen: false,
    });
  }, [loadNotifications]);

  useEffect(() => {
    const handleDatabaseChange = (event) => {
      recordSuccessfulAction(event.type);
      loadNotifications();
    };
    DB_EVENTS.forEach((name) =>
      window.addEventListener(name, handleDatabaseChange),
    );
    return () =>
      DB_EVENTS.forEach((name) =>
        window.removeEventListener(name, handleDatabaseChange),
      );
  }, [loadNotifications]);

  useEffect(() => {
    const handleSettingsChange = () => {
      loadNotifications({
        keepCurrentWhileOpen: false,
        mergeNewWhileOpen: false,
      });
    };
    const handleReadStateChange = () => loadNotifications();
    const handleSuccessfulAction = () => loadNotifications();

    window.addEventListener(
      "notification-settings-updated",
      handleSettingsChange,
    );
    window.addEventListener(
      "notifications-read-updated",
      handleReadStateChange,
    );
    window.addEventListener(
      "successful-action-updated",
      handleSuccessfulAction,
    );
    return () => {
      window.removeEventListener(
        "notification-settings-updated",
        handleSettingsChange,
      );
      window.removeEventListener(
        "notifications-read-updated",
        handleReadStateChange,
      );
      window.removeEventListener(
        "successful-action-updated",
        handleSuccessfulAction,
      );
    };
  }, [loadNotifications]);

  const openNotifications = async () => {
    try {
      notificationOpenRef.current = true;
      setNotificationOpen(true);
      setNotificationsLoading(true);

      const result = await buildNotifications({ includeRead: true });
      const all = Array.isArray(result) ? result : [];
      const unread = all.filter((n) => !n.isRead);

      setNotifications(unread);
      setUnreadCount(0);

      const ids = unread.map((n) => n.id);
      if (ids.length > 0) markNotificationsAsRead(ids);
    } catch (error) {
      console.error("Failed to open notifications:", error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const closeNotifications = useCallback(async () => {
    notificationOpenRef.current = false;
    setNotificationOpen(false);
    await loadNotifications({
      keepCurrentWhileOpen: false,
      mergeNewWhileOpen: false,
    });
  }, [loadNotifications]);

  const handleNotificationClick = async () => {
    if (notificationOpenRef.current) {
      await closeNotifications();
      return;
    }
    await openNotifications();
  };

  useEffect(() => {
    const handleToggleNotification = async () => {
      if (notificationOpenRef.current) {
        await closeNotifications();
        return;
      }
      await openNotifications();
    };
    window.addEventListener("toggle-notifications", handleToggleNotification);
    return () =>
      window.removeEventListener(
        "toggle-notifications",
        handleToggleNotification,
      );
  }, [closeNotifications]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const clickedInsideButton =
        notificationRef.current &&
        notificationRef.current.contains(event.target);
      const clickedInsidePanel =
        notificationPanelRef.current &&
        notificationPanelRef.current.contains(event.target);
      if (
        !clickedInsideButton &&
        !clickedInsidePanel &&
        notificationOpenRef.current
      )
        closeNotifications();
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [closeNotifications]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && notificationOpenRef.current)
        closeNotifications();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeNotifications]);

  const handleThemeToggle = useCallback(() => {
    if (themeAnimating) return;
    const button = themeButtonRef.current;
    if (!button) {
      toggleTheme();
      return;
    }

    const rect = button.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;
    const supportsViewTransition =
      typeof document.startViewTransition === "function";

    setThemeAnimating(true);

    if (supportsViewTransition) {
      document.documentElement.style.setProperty(
        "--theme-toggle-x",
        `${originX}px`,
      );
      document.documentElement.style.setProperty(
        "--theme-toggle-y",
        `${originY}px`,
      );
      const transition = document.startViewTransition(() => {
        toggleTheme();
      });
      transition.finished.finally(() => setThemeAnimating(false));
    } else {
      const overlay = document.createElement("div");
      overlay.className = "theme-transition-overlay";
      overlay.style.background = isDark ? "#ffffff" : "#0f0f0f";
      overlay.style.setProperty("--tx", `${originX}px`);
      overlay.style.setProperty("--ty", `${originY}px`);
      document.body.appendChild(overlay);
      requestAnimationFrame(() =>
        overlay.classList.add("theme-transition-overlay--active"),
      );

      window.setTimeout(() => {
        toggleTheme();
        overlay.classList.remove("theme-transition-overlay--active");
        overlay.classList.add("theme-transition-overlay--fade-out");
        window.setTimeout(() => {
          overlay.remove();
          setThemeAnimating(false);
        }, 220);
      }, 650);
    }
  }, [toggleTheme, isDark, themeAnimating]);

  const getNotificationText = (item) => {
    if (item.type === "lowStock") {
      return {
        title: t("settings.notifications.items.lowStock.title"),
        description:
          item.productName ||
          t("settings.notifications.items.lowStock.description"),
      };
    }
    if (item.type === "newSale") {
      return {
        title: t("settings.notifications.items.newSale.title"),
        description: `${Number(item.amount || 0).toLocaleString("en-US")} AF`,
      };
    }
    if (item.type === "credit") {
      return {
        title: t("settings.notifications.items.credit.title"),
        description: `${Number(item.amount || 0).toLocaleString("en-US")} AF`,
      };
    }
    return {
      title: t("settings.notifications.items.successfulActions.title"),
      description: t(
        "settings.notifications.items.successfulActions.description",
      ),
    };
  };

  const renderNotificationHeader = () => (
    <div className="relative flex items-center justify-between gap-3 border-b border-[var(--nav-border)] px-4 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white shadow-[0_4px_14px_var(--accent-glow)]"
          style={{
            background:
              "linear-gradient(135deg, var(--accent-400), var(--accent-600))",
          }}
        >
          <Bell size={15} />
        </div>
        <h3 className="truncate text-sm font-medium text-[var(--nav-text)]">
          {t("common.notifications")}
        </h3>
      </div>

      <button
        type="button"
        onClick={closeNotifications}
        aria-label={t("common.closeMenu")}
        title={t("common.closeMenu")}
        className="ui-icon-button h-7 w-7 min-h-0 shrink-0 p-0"
      >
        <X size={14} />
      </button>
    </div>
  );

  const renderNotificationsContent = (mobile = false) => (
    <div
      className="main-scrollbar overflow-y-auto p-2"
      style={
        mobile ? { maxHeight: "calc(100dvh - 6rem)" } : { maxHeight: "22rem" }
      }
    >
      {notificationsLoading ? (
        <div className="py-10 text-center text-xs text-[var(--nav-text-muted)]">
          {t("settings.account.loading")}
        </div>
      ) : notifications.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--nav-border)] bg-[var(--nav-surface)] text-[var(--nav-text-soft)]">
            <Bell size={17} />
          </div>
          <p className="text-xs text-[var(--nav-text-muted)]">
            {t("reports.empty")}
          </p>
        </div>
      ) : (
        notifications.map((item) => {
          const { icon: Icon, className } =
            NOTIFICATION_ICONS[item.type] || DEFAULT_NOTIFICATION_ICON;
          const { title, description } = getNotificationText(item);
          return (
            <div
              key={item.id}
              className="group flex items-start gap-3 rounded-xl border border-transparent p-3 transition-all duration-200 hover:border-[var(--nav-border)] hover:bg-[var(--nav-surface)]"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${className} transition-transform duration-200 group-hover:scale-[1.03]`}
              >
                <Icon size={17} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="break-words text-xs font-medium leading-5 text-[var(--nav-text)]">
                  {title}
                </p>
                <p className="mt-1 break-words text-[11px] leading-5 text-[var(--nav-text-muted)]">
                  {description}
                </p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <>
      <header
        className="glass-nav relative flex h-16 shrink-0 items-center justify-between gap-3 px-3 sm:px-4 md:px-6 transition-[background-color,border-color,box-shadow] duration-300"
        style={{
          borderBottom: "1px solid var(--accent-border-hover)",
          boxShadow:
            "inset 0 1px 0 var(--nav-highlight), 0 1px 0 var(--accent-border)",
        }}
      >
        <div className="relative flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label={t("common.openMenu")}
            title={t("common.openMenu")}
            className="ui-icon-button flex h-10 w-10 shrink-0 items-center justify-center lg:hidden lg:!hidden"
          >
            <Menu size={19} strokeWidth={2} />
          </button>

          <div className="min-w-0 max-w-[48vw] sm:max-w-none">
            <div className="flex min-w-0 items-center gap-2">
              <h2 className="truncate text-sm sm:text-[15px] font-medium tracking-[-0.01em] text-[var(--nav-text)]">
                {t(pageInfo.title)}
              </h2>
              <span className="hidden sm:block h-1 w-1 shrink-0 rounded-full bg-[var(--accent-500)] shadow-[0_0_8px_var(--accent-glow)]" />
            </div>
            <p className="mt-0.5 truncate text-[10px] sm:text-[11px] font-normal text-[var(--nav-text-muted)]">
              {t(pageInfo.description)}
            </p>
          </div>
        </div>

        <div className="relative flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            ref={themeButtonRef}
            type="button"
            onClick={handleThemeToggle}
            disabled={themeAnimating}
            aria-label={
              isDark ? t("common.enableLightMode") : t("common.enableDarkMode")
            }
            title={isDark ? t("common.lightMode") : t("common.darkMode")}
            className="ui-icon-button group h-10 w-10 relative overflow-hidden"
          >
            <span className="relative flex items-center justify-center h-5 w-5">
              <Sun
                size={18}
                strokeWidth={2}
                className={`absolute transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"}`}
              />
              <Moon
                size={18}
                strokeWidth={2}
                className={`absolute transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isDark ? "-rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`}
              />
            </span>
          </button>

          <div ref={notificationRef} className="relative z-10">
            <button
              type="button"
              onClick={handleNotificationClick}
              aria-label={t("common.notifications")}
              title={t("common.notifications")}
              aria-expanded={notificationOpen}
              className={`ui-icon-button group relative h-10 w-10 ${notificationOpen ? "border-[var(--accent-border-hover)] text-[var(--accent-500)] shadow-[var(--shadow-accent)]" : ""}`}
              style={
                notificationOpen
                  ? {
                      background:
                        "linear-gradient(135deg, var(--accent-soft-strong), var(--accent-soft))",
                    }
                  : undefined
              }
            >
              <Bell
                size={18}
                strokeWidth={notificationOpen ? 2.1 : 2}
                className="transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6"
              />

              {unreadCount > 0 && (
                <span
                  className="absolute -top-0.5 -end-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-medium text-white shadow-[0_0_0_2px_var(--nav-bg)]"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--danger), #b91c1c)",
                  }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </div>

          <div
            className="hidden sm:block mx-1 h-7 w-px"
            style={{
              background:
                "linear-gradient(180deg, transparent, var(--nav-border), transparent)",
            }}
          />

          <ProfileMenu />
        </div>
      </header>

      {notificationOpen && (
        <div
          className="fixed inset-0 z-[1001] bg-black/[0.015] dark:bg-black/[0.04] backdrop-blur-[4px] pointer-events-auto"
          onClick={closeNotifications}
          aria-hidden="true"
        />
      )}

      {notificationOpen && (
        <div
          ref={notificationPanelRef}
          className="pointer-events-none fixed inset-0 z-[1002]"
        >
          <div className="notification-panel pointer-events-auto fixed inset-x-2 top-[4.75rem] w-auto overflow-hidden rounded-2xl border border-[var(--nav-border)] bg-[var(--nav-bg)] shadow-[var(--shadow-xl)] lg:hidden">
            {renderNotificationHeader()}
            {renderNotificationsContent(true)}
          </div>

          <div className="notification-panel pointer-events-auto fixed end-3 sm:end-4 md:end-6 top-[4.75rem] hidden w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-[var(--nav-border)] bg-[var(--nav-bg)] shadow-[var(--shadow-xl)] lg:block">
            {renderNotificationHeader()}
            {renderNotificationsContent(false)}
          </div>
        </div>
      )}
    </>
  );
}

export default Header;