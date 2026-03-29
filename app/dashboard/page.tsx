"use client";

import { useState, useEffect, useRef, useCallback, type ComponentType } from "react";
import {
  BarChart2,
  MessageCircle,
  TrendingUp,
  CalendarDays,
  Eye,
  EyeOff,
  X,
  Lock,
  Loader2,
  ShieldCheck,
  Megaphone,
} from "lucide-react";
import AdminShell from "./_components/AdminShell";
import MetaOverviewSection from "./_components/MetaOverviewSection";
import {
  DashboardHeaderSkeleton,
  DashboardQuickStatsSkeleton,
} from "./_components/OverviewSectionSkeletons";
import { useAuth } from "@/lib/auth/context";
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
  icon: ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  href?: string;
}

function TakaIcon({ className = "" }: { className?: string }) {
  return <span className={`font-bold leading-none ${className}`}>৳</span>;
}

interface MetaAccountSummary {
  id?: string;
  account_id?: string;
  amount_spent?: string;
}

interface ConversationSummary {
  unreadCount?: number;
}

interface InsightSpendRow {
  spend?: string;
}

interface UserBudgetSummaryRow {
  totalBudget?: number;
  totalSpent?: number;
  balance?: number;
}

interface UserOverviewProps {
  statCards: StatCard[];
}

function UserOverview({ statCards }: UserOverviewProps) {
  const [activeMetric, setActiveMetric] = useState<"Spend" | "Reach" | "Impression">("Spend");
  const secondScreenRef = useRef<HTMLDivElement | null>(null);

  const totalSpendValue = String(statCards.find((c) => c.label === "Daily Spend")?.value ?? "—");
  const activeAdsValue = String(statCards.find((c) => c.label === "Active Ads")?.value ?? "—");
  const unseenValue = String(statCards.find((c) => c.label === "Unseen Messages")?.value ?? "—");

  return (
    <div className="w-full overflow-x-hidden bg-gray-50 pb-6">
      <div className="px-3 pt-3 sm:px-4 lg:hidden">
        <PromoSlider />
      </div>

      <div className="space-y-4 px-3 py-4 sm:px-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">Performance & Accounts spotlight</h3>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {statCards.map((card) => {
              const Icon = card.icon;
              const hasNewBadge =
                (card.label === "Unseen Messages" || card.label === "Unread Messages") &&
                Number(card.value) > 0;
              const inner = (
                <>
                  {hasNewBadge && (
                    <span className="absolute right-2.5 top-2.5 inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-600">
                      New
                    </span>
                  )}
                  <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${card.bg}`}>
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                  <p className="mt-2 text-lg font-bold text-gray-900">{card.value}</p>
                  <p className="text-xs text-gray-600">{card.label}</p>
                </>
              );
              const cls = `relative rounded-xl border border-gray-200 bg-white px-3 py-3 shadow-sm transition hover:shadow-md${card.href ? " cursor-pointer" : ""}`;

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
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">Meta Ads Performance</p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              className="flex-1 rounded-lg border border-rose-200 bg-rose-100/70 px-3 py-2 text-left text-xs font-medium text-gray-700"
            >
              Custom date range ^
            </button>
            <button
              type="button"
              onClick={() => secondScreenRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="h-9 w-12 rounded-lg border border-rose-200 bg-rose-100/70 text-xs font-semibold text-gray-700 transition hover:bg-rose-200/70"
              aria-label="Open performance details"
              title="Open performance details"
              >
              {">"}
            </button>
          </div>
        </div>

        <div ref={secondScreenRef} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">Total Spend</p>
              <p className="mt-1 text-lg font-bold text-gray-900">{totalSpendValue}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Join Date</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">—</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-gray-300 bg-gray-50 px-3 py-3 text-center">
              <p className="text-xs text-gray-500">Spend</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{totalSpendValue}</p>
            </div>
            <div className="rounded-xl border border-gray-300 bg-gray-50 px-3 py-3 text-center">
              <p className="text-xs text-gray-500">Reach</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{activeAdsValue}</p>
            </div>
            <div className="rounded-xl border border-gray-300 bg-gray-50 px-3 py-3 text-center">
              <p className="text-xs text-gray-500">Impression</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{unseenValue}</p>
            </div>
            <div className="rounded-xl border border-gray-300 bg-gray-50 px-3 py-3 text-center">
              <p className="text-xs text-gray-500">CTR</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">—</p>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-sm font-semibold text-gray-900">Ads Performance</p>
            <div className="mt-2 grid grid-cols-3 overflow-hidden rounded-lg border border-rose-200">
              {(["Spend", "Reach", "Impression"] as const).map((metric) => (
                <button
                  key={metric}
                  type="button"
                  onClick={() => setActiveMetric(metric)}
                  className={`border-r border-rose-200 px-2 py-2 text-xs font-medium last:border-r-0 ${activeMetric === metric ? "bg-rose-100 text-gray-900" : "bg-white text-gray-600 hover:bg-rose-50"}`}
                >
                  {metric}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-3">
            <svg viewBox="0 0 320 170" className="h-44 w-full" aria-label="Performance graph">
              <line x1="16" y1="150" x2="304" y2="150" stroke="#111827" strokeWidth="2" />
              <line x1="16" y1="150" x2="16" y2="20" stroke="#111827" strokeWidth="2" />
              <path
                d={activeMetric === "Spend" ? "M20 145 C 48 103, 74 96, 102 114 C 132 133, 165 85, 194 64 C 221 45, 257 37, 300 28" : activeMetric === "Reach" ? "M20 146 C 52 136, 86 112, 116 92 C 146 73, 181 70, 214 57 C 244 45, 274 38, 300 30" : "M20 145 C 48 126, 78 133, 109 106 C 141 78, 173 90, 205 76 C 238 62, 267 52, 300 43"}
                fill="none"
                stroke="#111827"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path d="M284 34 L300 28 L292 44" fill="none" stroke="#111827" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Meta account summary card (shown on admin overview) ─────────────────
const BDT_RATE = 145;

function metaAmountToUsd(amount: string | undefined): number {
  if (!amount) return 0;
  const n = Number(amount);
  if (!Number.isFinite(n)) return 0;

  // Meta amount_spent may arrive as:
  // - decimal string (e.g. "123.45")
  // - minor units string (e.g. "12345")
  return amount.includes(".") ? n : n / 100;
}

function resolveAccountId(account: MetaAccountSummary | null | undefined): string | null {
  const id = account?.account_id || account?.id;
  return typeof id === "string" && id.trim() ? id.trim() : null;
}

function fmtBDT(n: number) {
  return (
    "৳ " +
    new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 }).format(n)
  );
}

function fmtUSD(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
}

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const userName = user?.fullName || user?.username || "User";
  const [unseenMessages, setUnseenMessages] = useState<number | null>(null);
  const [pendingBoostRequests, setPendingBoostRequests] = useState<number | null>(null);
  const [totalSpendBDT, setTotalSpendBDT] = useState<number | null>(null);
  const [totalAds, setTotalAds] = useState<number | null>(null);
  const [dailySpendUSD, setDailySpendUSD] = useState<number | null>(null);
  const [clientNetBalanceUSD, setClientNetBalanceUSD] = useState<number | null>(null);
  const [adminStatsLoading, setAdminStatsLoading] = useState(true);
  const [metaSummaryLoading, setMetaSummaryLoading] = useState(true);
  const [budgetSummaryLoading, setBudgetSummaryLoading] = useState(true);

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
            setUnseenMessages(d.data.unseenMessages ?? 0);
            setPendingBoostRequests(d.data.pendingBoostRequests ?? 0);
          }
        })
        .catch(() => {})
        .finally(() => setAdminStatsLoading(false));
      return;
    }

    setUnseenMessages(0);
    setPendingBoostRequests(0);
    setAdminStatsLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) {
      fetch("/api/v1/chat/conversations")
        .then((r) => r.json())
        .then((d) => {
          if (Array.isArray(d.conversations)) {
            setClientChats(d.conversations.length);
            const conversations = d.conversations as ConversationSummary[];
            const unread = conversations.reduce(
              (sum, c) => sum + (c.unreadCount || 0),
              0,
            );
            setClientUnread(unread);
            setUnseenMessages(unread);
          }
        })
        .catch(() => {});
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin || !user?.id) return;

    fetch(`/api/v1/admin/meta-assignments/users/${encodeURIComponent(user.id)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d?.success) return;
        const campaigns = Array.isArray(d?.data?.campaigns) ? d.data.campaigns.length : 0;
        setTotalAds(campaigns);
      })
      .catch(() => {
        setTotalAds(0);
      });
  }, [isAdmin, user?.id]);

  useEffect(() => {
    if (!isAdmin) {
      setClientNetBalanceUSD(0);
      setBudgetSummaryLoading(false);
      return;
    }

    let mounted = true;
    setBudgetSummaryLoading(true);

    fetch('/api/v1/admin/user-budgets', {
      method: 'GET',
      credentials: 'include',
    })
      .then((r) => r.json())
      .then((d) => {
        if (!mounted || !d?.success || !Array.isArray(d.data)) return;
        const totals = (d.data as UserBudgetSummaryRow[]).reduce(
          (acc: { totalBudget: number; totalSpent: number; balance: number }, row) => {
            acc.totalBudget += Number(row.totalBudget || 0);
            acc.totalSpent += Number(row.totalSpent || 0);
            acc.balance += Number(row.balance || 0);
            return acc;
          },
          { totalBudget: 0, totalSpent: 0, balance: 0 },
        );
        setClientNetBalanceUSD(totals.balance);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setBudgetSummaryLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) {
      setDailySpendUSD(0);
      setMetaSummaryLoading(false);
      return;
    }

    let mounted = true;
    setMetaSummaryLoading(true);

    const loadMetaSummary = async () => {
      try {
        const response = await fetch("/api/v1/meta/account?discover=1", {
          cache: "no-store",
        });
        const d = await response.json();

        if (!mounted || !d.success || !Array.isArray(d.data)) {
          return;
        }

        const accounts = d.data as MetaAccountSummary[];
        const total = accounts.reduce(
          (sum: number, a) => sum + metaAmountToUsd(a.amount_spent),
          0,
        );
        setTotalSpendBDT(total * BDT_RATE);

        const accountIds = accounts
          .map((a) => resolveAccountId(a))
          .filter((id: string | null): id is string => Boolean(id));

        if (accountIds.length === 0) {
          setTotalAds(0);
          setDailySpendUSD(0);
          return;
        }

        const [allActiveCountsRes, perAccountSummaries] = await Promise.all([
          fetch('/api/v1/meta/active-counts', { cache: 'no-store' })
            .then((r) => r.json())
            .catch(() => null),
          Promise.allSettled(
            accountIds.map(async (accountId: string) => {
              const insightsRes = await fetch(
                `/api/v1/meta/insights?type=account&date_preset=today&account_id=${encodeURIComponent(accountId)}`,
                { cache: "no-store" },
              ).then((r) => r.json());

              let todaySpendUsd = 0;
              if (insightsRes?.success && Array.isArray(insightsRes.data)) {
                todaySpendUsd = (insightsRes.data as InsightSpendRow[]).reduce((sum: number, row) => {
                  const spend = Number.parseFloat(String(row?.spend ?? "0"));
                  return sum + (Number.isFinite(spend) ? spend : 0);
                }, 0);
              }

              return { todaySpendUsd };
            }),
          ),
        ]);

        if (!mounted) return;

        let adsTotal: number | null = null;
        let dailySpendUsdTotal = 0;

        if (
          allActiveCountsRes?.success &&
          typeof allActiveCountsRes?.data?.campaigns === 'number' &&
          Number.isFinite(allActiveCountsRes.data.campaigns)
        ) {
          // Keep the same active metric users see in /dashboard/meta summary.
          adsTotal = allActiveCountsRes.data.campaigns;
        }

        for (const item of perAccountSummaries) {
          if (item.status !== "fulfilled") continue;
          const { todaySpendUsd } = item.value;
          if (Number.isFinite(todaySpendUsd)) dailySpendUsdTotal += todaySpendUsd;
        }

        setTotalAds(adsTotal);
        setDailySpendUSD(dailySpendUsdTotal);
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

  const advanceUSD =
    clientNetBalanceUSD != null && Number.isFinite(clientNetBalanceUSD) && clientNetBalanceUSD > 0
      ? clientNetBalanceUSD
      : 0;
  const dueUSD =
    clientNetBalanceUSD != null && Number.isFinite(clientNetBalanceUSD) && clientNetBalanceUSD < 0
      ? Math.abs(clientNetBalanceUSD)
      : 0;

  const advanceValue =
    clientNetBalanceUSD == null
      ? "—"
      : fmtBDT(advanceUSD * BDT_RATE);
  const dueValue =
    clientNetBalanceUSD == null
      ? "—"
      : fmtBDT(dueUSD * BDT_RATE);

  const statCards: StatCard[] = [
    {
      label: "Active Ads",
      value: totalAds ?? "—",
      icon: Megaphone,
      color: "text-red-600",
      bg: "bg-red-50",
      href: "/dashboard/meta",
    },
    {
      label: "Daily Spend",
      value: dailySpendUSD != null ? fmtUSD(dailySpendUSD) : "—",
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Advance Payment",
      value: advanceValue,
      icon: TakaIcon,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Due Amount",
      value: dueValue,
      icon: TakaIcon,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Unseen Messages",
      value: unseenMessages ?? "—",
      icon: MessageCircle,
      color: unseenMessages ? "text-orange-600" : "text-gray-400",
      bg: unseenMessages ? "bg-orange-50" : "bg-gray-50",
      href: "/dashboard/chat",
    },
    {
      label: "Schedule",
      value: pendingBoostRequests ?? "—",
      icon: CalendarDays,
      color: "text-violet-600",
      bg: "bg-violet-50",
      href: "/dashboard/boost-requests",
    },
  ];

  const clientStatCards: StatCard[] = [
    {
      label: "Active Ads",
      value: totalAds ?? "—",
      icon: Megaphone,
      color: "text-red-600",
      bg: "bg-red-50",
      href: "/dashboard/user-campaigns",
    },
    {
      label: "Daily Spend",
      value: dailySpendUSD != null ? fmtUSD(dailySpendUSD) : "—",
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Advance Payment",
      value: advanceValue,
      icon: TakaIcon,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Due Amount",
      value: dueValue,
      icon: TakaIcon,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Send Ads Request",
      value: pendingBoostRequests ?? "—",
      icon: CalendarDays,
      color: "text-violet-600",
      bg: "bg-violet-50",
      href: "/dashboard/chat",
    },
    {
      label: "Unseen Messages",
      value: clientUnread ?? "—",
      icon: MessageCircle,
      color: clientUnread ? "text-orange-600" : "text-gray-400",
      bg: clientUnread ? "bg-orange-50" : "bg-gray-50",
      href: "/dashboard/chat",
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
        <div className="max-w-7xl mx-auto py-3 sm:p-6 space-y-4 sm:space-y-6">
          {adminStatsLoading || metaSummaryLoading || budgetSummaryLoading ? (
            <DashboardQuickStatsSkeleton />
          ) : (
            /* Quick Stats */
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {statCards.map((card) => {
                const Icon = card.icon;
                const hasNewBadge = card.label === "Unseen Messages" && (unseenMessages ?? 0) > 0;
                const inner = (
                  <>
                    {hasNewBadge && (
                      <span className="absolute right-3 top-3 inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-600">
                        New
                      </span>
                    )}
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
                    </div>
                  </>
                );
                const cls = `relative rounded-xl border border-gray-100 bg-white p-4 min-h-[132px] flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow${card.href ? " cursor-pointer" : ""}`;
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
