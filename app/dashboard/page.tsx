"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import {
  Users,
  Briefcase,
  BarChart2,
  Layers,
  MessageCircle,
  UserCheck,
  BellDot,
  TrendingUp,
  CalendarDays,
  Eye,
  EyeOff,
  X,
  Lock,
  Loader2,
  ShieldCheck,
  Megaphone,
  DollarSign,
} from "lucide-react";
import AdminShell from "./_components/AdminShell";
import MetaOverviewSection from "./_components/MetaOverviewSection";
import {
  DashboardHeaderSkeleton,
  DashboardQuickStatsSkeleton,
} from "./_components/OverviewSectionSkeletons";
import { useAuth } from "@/lib/auth/context";
import { useSiteData } from "@/lib/admin/context";
import { AdminStore } from "@/lib/admin/store";
import { Slider, SlideData } from "@/components/ui";
import Link from "next/link";

// ── How many seconds the spend stays revealed before auto-hiding ──────────
const REVEAL_TIMEOUT_SEC = 30;

// ── Password Verification Modal ───────────────────────────────────────────
function SpendPasswordModal({
  onSuccess,
  onClose,
}: {
  onSuccess: () => void;
  onClose: () => void;
}) {
  const { accessToken } = useAuth();
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/auth/verify-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (data.success) {
        onSuccess();
      } else {
        setError(data.error || "Incorrect password. Please try again.");
        setPassword("");
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-999 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <Lock className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Verify Identity
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Enter your login password to view Total Ad Spend
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              <span className="mt-0.5 shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Password field */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Enter your login password"
                className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPw ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !password}
              className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying…
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Reveal
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PromoSlider() {
  const [slides, setSlides] = useState<SlideData[]>([]);

  useEffect(() => {
    fetch("/api/v1/cms/hero-slides")
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        setSlides(
          data.map((s, i) => ({
            id: i + 1,
            image: s.customImage || s.image,
            title: "",
            description: "",
            ctaLink: s.ctaLink,
          })),
        );
      })
      .catch(() => {});
  }, []);

  if (slides.length === 0) return null;

  return (
    <Slider
      slides={slides}
      autoPlay={true}
      autoPlayInterval={5000}
      showControls={false}
      showIndicators={true}
      height="h-[200px]"
    />
  );
}

interface StatCard {
  label: string;
  value: number | string;
  icon: typeof Users;
  color: string;
  bg: string;
  href?: string;
}

interface UserOverviewProps {
  userName: string;
  statCards: StatCard[];
  userEmail?: string;
}

function UserOverview({ statCards }: Pick<UserOverviewProps, "statCards">) {
  return (
    <div className="w-full overflow-x-hidden bg-gray-50 pb-6">
      {/* Promo banner slider — full width top */}
      <div className="px-3 sm:px-4 pt-3 lg:hidden">
        <PromoSlider />
      </div>

      <div className="px-3 sm:px-4 py-4 space-y-3">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {statCards.map((card) => {
            const Icon = card.icon;
            const inner = (
              <>
                <div
                  className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}
                >
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">
                    {card.value}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {card.label}
                  </p>
                  {(card.label === "Unseen Messages" ||
                    card.label === "Unread Messages") &&
                    (card.value as number) > 0 && (
                      <span className="inline-block mt-1 text-[10px] bg-orange-100 text-orange-600 font-semibold px-1.5 py-0.5 rounded-full">
                        New
                      </span>
                    )}
                </div>
              </>
            );
            const cls = `rounded-xl border border-gray-100 bg-white p-4 flex flex-col gap-3 shadow-sm active:scale-95 transition-transform${card.href ? " cursor-pointer hover:shadow-md" : ""}`;
            return card.href ? (
              <Link key={card.label} href={card.href} className={cls}>
                {inner}
              </Link>
            ) : (
              <div key={card.label} className={cls}>
                {inner}
              </div>
            );
          })}
        </div>

        {/* Meta Ads Performance */}
        <MetaOverviewSection />
      </div>
    </div>
  );
}

// ── Meta account summary card (shown on admin overview) ─────────────────
const BDT_RATE = 145;

function usdCentsToNum(cents: string | undefined): number {
  if (!cents) return 0;
  return parseInt(cents, 10) / 100;
}

function fmtBDT(n: number) {
  return (
    "৳ " +
    new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 }).format(n)
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { team, services } = useSiteData();
  const portfolio = useMemo(() => AdminStore.getPortfolio(), []);
  const isAdmin = user?.role === "ADMIN";
  const userName = user?.fullName || user?.username || "User";
  const [totalClients, setTotalClients] = useState<number | null>(null);
  const [unseenMessages, setUnseenMessages] = useState<number | null>(null);
  const [totalSpendBDT, setTotalSpendBDT] = useState<number | null>(null);
  const [totalAds, setTotalAds] = useState<number | null>(null);
  const [dailySpendBDT, setDailySpendBDT] = useState<number | null>(null);
  const [adminStatsLoading, setAdminStatsLoading] = useState(true);
  const [metaSummaryLoading, setMetaSummaryLoading] = useState(true);

  // Spend reveal / mask
  const [spendRevealed, setSpendRevealed] = useState(false);
  const [showSpendModal, setShowSpendModal] = useState(false);
  const [revealCountdown, setRevealCountdown] = useState(0);
  const revealTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-hide spend after REVEAL_TIMEOUT_SEC seconds
  const startRevealTimer = useCallback(() => {
    setRevealCountdown(REVEAL_TIMEOUT_SEC);
    if (revealTimerRef.current) clearInterval(revealTimerRef.current);
    revealTimerRef.current = setInterval(() => {
      setRevealCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(revealTimerRef.current!);
          setSpendRevealed(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (revealTimerRef.current) clearInterval(revealTimerRef.current);
    };
  }, []);

  const handleRevealSuccess = useCallback(() => {
    setShowSpendModal(false);
    setSpendRevealed(true);
    startRevealTimer();
  }, [startRevealTimer]);

  const handleHideSpend = useCallback(() => {
    setSpendRevealed(false);
    if (revealTimerRef.current) clearInterval(revealTimerRef.current);
    setRevealCountdown(0);
  }, []);

  // Client-specific: unread messages + active chat count
  const [clientUnread, setClientUnread] = useState<number | null>(null);
  const [clientChats, setClientChats] = useState<number | null>(null);

  useEffect(() => {
    if (isAdmin) {
      setAdminStatsLoading(true);
      fetch("/api/v1/admin/stats")
        .then((r) => r.json())
        .then((d) => {
          if (d.success) {
            setTotalClients(d.data.totalClients);
            setUnseenMessages(d.data.unseenMessages ?? 0);
          }
        })
        .catch(() => {})
        .finally(() => setAdminStatsLoading(false));
      return;
    }

    setAdminStatsLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) {
      fetch("/api/v1/chat/conversations")
        .then((r) => r.json())
        .then((d) => {
          if (Array.isArray(d.conversations)) {
            setClientChats(d.conversations.length);
            const unread = (d.conversations as any[]).reduce(
              (sum, c) => sum + (c.unreadCount || 0),
              0,
            );
            setClientUnread(unread);
          }
        })
        .catch(() => {});
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) {
      setMetaSummaryLoading(false);
      return;
    }

    let mounted = true;
    setMetaSummaryLoading(true);

    const loadMetaSummary = async () => {
      try {
        const response = await fetch("/api/v1/meta/account?discover=1");
        const d = await response.json();

        if (!mounted || !d.success || !Array.isArray(d.data)) {
          return;
        }

        const total = d.data.reduce(
          (sum: number, a: any) => sum + usdCentsToNum(a.amount_spent),
          0,
        );
        setTotalSpendBDT(total * BDT_RATE);

        const firstAccount = d.data[0];
        const accountId = firstAccount?.account_id || firstAccount?.id;
        if (!accountId) {
          setDailySpendBDT(0);
          return;
        }

        const [activeCountsRes, insightsRes] = await Promise.allSettled([
          fetch(`/api/v1/meta/active-counts?account_id=${accountId}`).then((r) =>
            r.json(),
          ),
          fetch(
            `/api/v1/meta/insights?type=account&date_preset=today&account_id=${accountId}`,
          ).then((r) => r.json()),
        ]);

        if (!mounted) return;

        if (activeCountsRes.status === "fulfilled" && activeCountsRes.value.success) {
          setTotalAds(activeCountsRes.value.data.ads ?? null);
        }

        if (insightsRes.status === "fulfilled") {
          const json = insightsRes.value;
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const spend = parseFloat(json.data[0]?.spend ?? "0");
            setDailySpendBDT(spend * BDT_RATE);
          } else {
            setDailySpendBDT(0);
          }
        }
      } catch {
        // Keep null values when API is unavailable; overview cards will show dashes.
      } finally {
        if (mounted) setMetaSummaryLoading(false);
      }
    };

    loadMetaSummary();

    return () => {
      mounted = false;
    };
  }, [isAdmin]);

  const statCards: StatCard[] = [
    {
      label: "Total Ads",
      value: totalAds ?? "—",
      icon: Megaphone,
      color: "text-red-600",
      bg: "bg-red-50",
      href: "/dashboard/meta",
    },
    {
      label: "Daily Spend",
      value: dailySpendBDT != null ? fmtBDT(dailySpendBDT) : "—",
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Total Client Due",
      value: "—",
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Unseen Messages",
      value: unseenMessages ?? "—",
      icon: BellDot,
      color: unseenMessages ? "text-orange-600" : "text-gray-400",
      bg: unseenMessages ? "bg-orange-50" : "bg-gray-50",
      href: "/dashboard/chat",
    },
    {
      label: "Schedule",
      value: "—",
      icon: CalendarDays,
      color: "text-violet-600",
      bg: "bg-violet-50",
      href: "/dashboard/schedule",
    },
  ];

  const clientStatCards: StatCard[] = [
    {
      label: "Active Chats",
      value: clientChats ?? "—",
      icon: MessageCircle,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Unread Messages",
      value: clientUnread ?? "—",
      icon: BellDot,
      color: clientUnread ? "text-orange-600" : "text-gray-400",
      bg: clientUnread ? "bg-orange-50" : "bg-gray-50",
    },
  ];

  if (!isAdmin) {
    return (
      <AdminShell>
        <UserOverview statCards={clientStatCards} />
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="h-full overflow-y-auto no-scrollbar bg-gray-50">
        {metaSummaryLoading ? (
          <DashboardHeaderSkeleton />
        ) : (
          /* Welcome Header */
          <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-5 sm:py-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    Welcome back, {userName}! 👋
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">
                    <span className="hidden sm:inline">
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span className="sm:hidden">
                      {new Date().toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </p>
                </div>
                <div className="flex w-full items-center gap-2 text-sm text-gray-400 sm:w-auto">
                  {totalSpendBDT !== null ? (
                    <div className="flex w-full max-w-65 items-center gap-3 rounded-2xl bg-red-600 px-4 py-3 sm:w-auto sm:max-w-none sm:min-w-62.5 text-white shadow-lg shadow-red-500/25">
                      <TrendingUp className="h-4.5 w-4.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="mb-1 text-[10px] sm:text-[11px] font-semibold text-red-200 uppercase tracking-wide leading-none">
                          Total Ad Spend (BDT)
                        </p>
                        {spendRevealed ? (
                          <p className="text-xl sm:text-2xl font-bold leading-none truncate">
                            {fmtBDT(totalSpendBDT)}
                          </p>
                        ) : (
                          <p className="text-xl sm:text-2xl font-bold leading-none tracking-widest">
                            ••••••
                          </p>
                        )}
                      </div>
                      {/* Eye toggle */}
                      <button
                        type="button"
                        onClick={() => {
                          if (spendRevealed) {
                            handleHideSpend();
                          } else {
                            setShowSpendModal(true);
                          }
                        }}
                        title={
                          spendRevealed
                            ? `Hide (auto-hides in ${revealCountdown}s)`
                            : "Click to reveal"
                        }
                        className="ml-1 p-1.5 rounded-lg hover:bg-red-700 transition-colors shrink-0 relative group"
                      >
                        {spendRevealed ? (
                          <EyeOff className="h-4 w-4 text-red-200" />
                        ) : (
                          <Eye className="h-4 w-4 text-red-200" />
                        )}
                        {/* Countdown badge */}
                        {spendRevealed && revealCountdown > 0 && (
                          <span className="absolute -top-2 -right-2 min-w-4 h-4 flex items-center justify-center bg-yellow-400 text-gray-900 text-[9px] font-bold rounded-full px-0.5 leading-none">
                            {revealCountdown}
                          </span>
                        )}
                      </button>
                    </div>
                  ) : (
                    <>
                      <BarChart2 className="h-4 w-4" />
                      <span>Overview Dashboard</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Dashboard Content */}
        <div className="max-w-7xl mx-auto px-3 py-3 sm:p-6 space-y-4 sm:space-y-6">
          {adminStatsLoading || metaSummaryLoading ? (
            <DashboardQuickStatsSkeleton />
          ) : (
            /* Quick Stats */
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {statCards.map((card) => {
                const Icon = card.icon;
                const inner = (
                  <>
                    <div
                      className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}
                    >
                      <Icon className={`h-5 w-5 ${card.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {card.value}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
                      {card.label === "Unseen Messages" &&
                        (unseenMessages ?? 0) > 0 && (
                          <span className="inline-block mt-1 text-[10px] bg-orange-100 text-orange-600 font-semibold px-1.5 py-0.5 rounded-full">
                            New
                          </span>
                        )}
                    </div>
                  </>
                );
                const cls = `rounded-xl border border-gray-100 bg-white p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow${card.href ? " cursor-pointer" : ""}`;
                return card.href ? (
                  <Link key={card.label} href={card.href} className={cls}>
                    {inner}
                  </Link>
                ) : (
                  <div key={card.label} className={cls}>
                    {inner}
                  </div>
                );
              })}
            </div>
          )}

          {/* Meta Ads Performance Overview */}
          <MetaOverviewSection />
        </div>
      </div>

      {/* Password modal (portal-style, rendered inside AdminShell but fixed to viewport) */}
      {showSpendModal && (
        <SpendPasswordModal
          onSuccess={handleRevealSuccess}
          onClose={() => setShowSpendModal(false)}
        />
      )}
    </AdminShell>
  );
}
