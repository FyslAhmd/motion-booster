"use client";

import { useState, useEffect, type ComponentType } from "react";
import {
  MessageCircle,
  TrendingUp,
  CalendarDays,
  Megaphone,
} from "lucide-react";
import AdminShell from "./AdminShell";
import {
  DashboardQuickStatsSkeleton,
} from "./OverviewSectionSkeletons";
import { useAuth } from "@/lib/auth/context";
import { HeroSlider } from "@/components/sections";
import ClientMetaOverviewSection from "./ClientMetaOverviewSection";

interface StatCard {
  label: string;
  value: number | string;
  icon: ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}

function TakaIcon({ className = "" }: { className?: string }) {
  return <span className={`font-bold leading-none ${className}`}>৳</span>;
}

interface MetaAccountSummary {
  id?: string;
  account_id?: string;
  amount_spent?: string;
}

interface InsightSpendRow {
  spend?: string;
}

interface AssignedCampaignLite {
  metaObjectId: string;
  metaAccountId: string;
}

interface UserBudgetSummaryRow {
  totalBudget?: number;
  totalSpent?: number;
  balance?: number;
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

export default function ClientDashboardView() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [unseenMessages, setUnseenMessages] = useState<number | null>(null);
  const [adsBoostRequests, setAdsBoostRequests] = useState<number | null>(null);
  const [totalAds, setTotalAds] = useState<number | null>(null);
  const [dailySpendUSD, setDailySpendUSD] = useState<number | null>(null);
  const [clientNetBalanceUSD, setClientNetBalanceUSD] = useState<number | null>(null);
  const [adminStatsLoading, setAdminStatsLoading] = useState(true);
  const [metaSummaryLoading, setMetaSummaryLoading] = useState(true);
  const [budgetSummaryLoading, setBudgetSummaryLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      setAdminStatsLoading(true);
      fetch("/api/v1/admin/stats", {
        cache: "no-store",
        credentials: "include",
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.success) {
            setUnseenMessages(d.data.unseenMessages ?? 0);
            setAdsBoostRequests(d.data.pendingBoostRequests ?? 0);
          }
        })
        .catch(() => {})
        .finally(() => setAdminStatsLoading(false));
      return;
    }

    setUnseenMessages(0);
    setAdminStatsLoading(true);

    fetch('/api/v1/boost-requests?page=1&limit=1', {
      method: 'GET',
      credentials: 'include',
    })
      .then((r) => r.json())
      .then((d) => {
        const total = typeof d?.total === 'number' ? d.total : 0;
        setAdsBoostRequests(total);
      })
      .catch(() => {
        setAdsBoostRequests(0);
      })
      .finally(() => setAdminStatsLoading(false));
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) {
      fetch("/api/v1/chat/conversations")
        .then((r) => r.json())
        .then((d) => {
          if (Array.isArray(d.conversations)) {
            const unread = d.conversations.reduce(
              (sum: number, c: { unreadCount?: number }) => sum + (c.unreadCount || 0),
              0,
            );
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
    if (!user?.id) return;

    let mounted = true;
    setBudgetSummaryLoading(true);

    fetch('/api/v1/admin/user-budgets', {
      method: 'GET',
      credentials: 'include',
    })
      .then((r) => r.json())
      .then((d) => {
        if (!mounted || !d?.success || !Array.isArray(d.data)) return;

        const targetRow = isAdmin
          ? null
          : (d.data as Array<UserBudgetSummaryRow & { id: string }>).find((row) => row.id === user.id);

        if (isAdmin) {
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
          return;
        }

        setClientNetBalanceUSD(targetRow ? Number(targetRow.balance || 0) : 0);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setBudgetSummaryLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isAdmin, user?.id]);

  useEffect(() => {
    if (isAdmin) {
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
    }

    if (!user?.id) {
      setDailySpendUSD(0);
      setMetaSummaryLoading(false);
      return;
    }

    let mounted = true;
    setMetaSummaryLoading(true);

    const loadUserSpend = async () => {
      try {
        const assignedRes = await fetch(
          `/api/v1/admin/meta-assignments/users/${encodeURIComponent(user.id)}`,
          { cache: "no-store" },
        );
        const assignedData = await assignedRes.json();

        if (!mounted || !assignedData?.success) {
          setDailySpendUSD(0);
          return;
        }

        const campaigns = Array.isArray(assignedData?.data?.campaigns)
          ? (assignedData.data.campaigns as AssignedCampaignLite[])
          : [];

        if (campaigns.length === 0) {
          setDailySpendUSD(0);
          return;
        }

        const campaignsByAccount = new Map<string, Set<string>>();
        for (const campaign of campaigns) {
          if (!campaign.metaAccountId || !campaign.metaObjectId) continue;
          const ids = campaignsByAccount.get(campaign.metaAccountId) ?? new Set<string>();
          ids.add(campaign.metaObjectId);
          campaignsByAccount.set(campaign.metaAccountId, ids);
        }

        const accountResults = await Promise.all(
          Array.from(campaignsByAccount.entries()).map(async ([accountId, campaignIds]) => {
            const params = new URLSearchParams({
              type: 'campaigns',
              account_id: accountId,
              date_preset: 'today',
            });

            const insightsRes = await fetch(`/api/v1/meta/insights?${params.toString()}`, {
              cache: 'no-store',
            });
            const insightsData = await insightsRes.json();

            if (!insightsData?.success || !Array.isArray(insightsData?.data)) return 0;

            return insightsData.data
              .filter((row: { campaign_id?: string }) => row.campaign_id && campaignIds.has(String(row.campaign_id)))
              .reduce((sum: number, row: InsightSpendRow) => {
                const spend = Number.parseFloat(String(row?.spend ?? '0'));
                return sum + (Number.isFinite(spend) ? spend : 0);
              }, 0);
          }),
        );

        if (!mounted) return;
        const dailySpendUsdTotal = accountResults.reduce((sum, val) => sum + (Number.isFinite(val) ? val : 0), 0);
        setDailySpendUSD(dailySpendUsdTotal);
      } catch {
        setDailySpendUSD(0);
      } finally {
        if (mounted) setMetaSummaryLoading(false);
      }
    };

    loadUserSpend();

    return () => {
      mounted = false;
    };
  }, [isAdmin, user?.id]);

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
      label: "Ads Request",
      value: adsBoostRequests ?? "—",
      icon: CalendarDays,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Unseen Messages",
      value: unseenMessages ?? "—",
      icon: MessageCircle,
      color: unseenMessages ? "text-orange-600" : "text-gray-400",
      bg: unseenMessages ? "bg-orange-50" : "bg-gray-50",
    },
  ];

  return (
    <AdminShell>
      <div className="h-full overflow-y-auto no-scrollbar bg-gray-50">
        <div className="px-4 pt-4 sm:px-6 sm:pt-6">
          <div className="max-w-7xl mx-auto overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <HeroSlider />
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 sm:py-6 space-y-4 sm:space-y-6">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Performance & Accounts Spotlight
            </h2>
          </div>

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
                const cls = "relative rounded-xl border border-gray-100 bg-white p-4 min-h-[132px] flex flex-col gap-3 shadow-sm";
                return (
                  <div key={card.label} className={cls}>
                    {inner}
                  </div>
                );
              })}
            </div>
          )}

          {/* Meta Ads Performance Overview */}
          <ClientMetaOverviewSection />
        </div>
      </div>
    </AdminShell>
  );
}
