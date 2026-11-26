import { prisma } from '@/lib/db/prisma';
import {
  metaFetch,
  fetchSingleCampaignInsights,
  fetchAdSetsByCampaign,
  type TimeRange,
} from '@/lib/meta/client';
import { deriveDeliveryStatus } from '@/lib/meta/derive-status';
import { sendDailySpendReportEmail } from '@/lib/server/mailer';
import { logActivity } from '@/lib/server/activity-history';

export const FX_RATE_BDT_PER_USD = 145;

export interface CampaignSpendMetric {
  campaignId: string;
  campaignName: string;
  status: string;
  objective?: string;
  resultLabel: string;
  resultValue: number;
  costLabel: string;
  costPerResultUsd: number;
  costPerResultBdt: number;
  spendUsd: number;
  spendBdt: number;
  impressions: number;
  clicks: number;
  cpc: number;
  ctr: number;
}

export interface UserDailySpendReport {
  user: {
    id: string;
    fullName: string;
    username: string;
    email: string;
    phone: string;
  };
  dateStr: string;
  dateFormatted: string;
  totalSpendUsd: number;
  totalSpendBdt: number;
  totalImpressions: number;
  totalClicks: number;
  resultsSummary: Array<{ label: string; value: number }>;
  campaigns: CampaignSpendMetric[];
}

// ───────────────────────────────────────────────
// Goal & Dynamic Metric Resolution Mappings
// ───────────────────────────────────────────────

export const GOAL_TO_DYNAMIC_METRIC: Record<
  string,
  { metricLabel: string; pluralLabel: string; costLabel: string; actionTypes: string[] }
> = {
  CONVERSATIONS: {
    metricLabel: 'Message',
    pluralLabel: 'Messages',
    costLabel: 'Cost / Message',
    actionTypes: [
      'onsite_conversion.total_messaging_connection',
      'onsite_conversion.messaging_conversation_started_7d',
    ],
  },
  MESSAGING_PURCHASE_CONVERSION: {
    metricLabel: 'Message',
    pluralLabel: 'Messages',
    costLabel: 'Cost / Message',
    actionTypes: [
      'onsite_conversion.messaging_conversation_started_7d',
      'onsite_conversion.total_messaging_connection',
    ],
  },
  PAGE_LIKES: {
    metricLabel: 'Page Like',
    pluralLabel: 'Page Likes',
    costLabel: 'Cost / Like',
    actionTypes: ['like'],
  },
  LEAD_GENERATION: {
    metricLabel: 'Lead',
    pluralLabel: 'Leads',
    costLabel: 'Cost / Lead',
    actionTypes: ['lead', 'onsite_conversion.lead', 'onsite_web_lead'],
  },
  LINK_CLICKS: {
    metricLabel: 'Link Click',
    pluralLabel: 'Link Clicks',
    costLabel: 'Cost / Click',
    actionTypes: ['link_click'],
  },
  LANDING_PAGE_VIEWS: {
    metricLabel: 'Landing Page View',
    pluralLabel: 'Landing Page Views',
    costLabel: 'Cost / LPV',
    actionTypes: ['landing_page_view', 'link_click'],
  },
  OFFSITE_CONVERSIONS: {
    metricLabel: 'Purchase',
    pluralLabel: 'Purchases',
    costLabel: 'Cost / Purchase',
    actionTypes: ['purchase', 'onsite_web_purchase'],
  },
  POST_ENGAGEMENT: {
    metricLabel: 'Post Engagement',
    pluralLabel: 'Post Engagements',
    costLabel: 'Cost / Engagement',
    actionTypes: ['post_engagement', 'page_engagement'],
  },
  THRUPLAY: {
    metricLabel: 'Video View',
    pluralLabel: 'Video Views',
    costLabel: 'Cost / View',
    actionTypes: ['video_view', 'thruplay'],
  },
  QUALITY_CALL: {
    metricLabel: 'Call',
    pluralLabel: 'Calls',
    costLabel: 'Cost / Call',
    actionTypes: [
      'onsite_conversion.messaging_user_call_placed',
      'onsite_conversion.messaging_60s_call_connect',
      'onsite_conversion.messaging_20s_call_connect',
    ],
  },
  REACH: {
    metricLabel: 'Reach',
    pluralLabel: 'Reach',
    costLabel: 'Cost / Reach',
    actionTypes: ['reach'],
  },
};

const OBJECTIVE_TO_GOAL: Record<string, string> = {
  OUTCOME_MESSAGES: 'CONVERSATIONS',
  MESSAGES: 'CONVERSATIONS',
  OUTCOME_LEADS: 'LEAD_GENERATION',
  LEAD_GENERATION: 'LEAD_GENERATION',
  OUTCOME_ENGAGEMENT: 'POST_ENGAGEMENT',
  POST_ENGAGEMENT: 'POST_ENGAGEMENT',
  PAGE_LIKES: 'PAGE_LIKES',
  OUTCOME_TRAFFIC: 'LINK_CLICKS',
  LINK_CLICKS: 'LINK_CLICKS',
  OUTCOME_SALES: 'OFFSITE_CONVERSIONS',
  CONVERSIONS: 'OFFSITE_CONVERSIONS',
  OUTCOME_AWARENESS: 'REACH',
  BRAND_AWARENESS: 'REACH',
  REACH: 'REACH',
  VIDEO_VIEWS: 'THRUPLAY',
};

function parseCampaignInsights(insight: any) {
  if (!insight) return null;
  const actions = insight.actions || [];
  const costs = insight.cost_per_action_type || [];

  const getAction = (type: string) =>
    Number(actions.find((a: any) => a.action_type === type)?.value || 0);
  const getCost = (type: string) =>
    Number(costs.find((a: any) => a.action_type === type)?.value || 0);

  const rawSpend = Number.parseFloat(String(insight.spend ?? '0'));
  const spend = Number.isFinite(rawSpend) ? rawSpend : 0;

  return {
    spend,
    reach: Number(insight.reach || 0),
    impressions: Number(insight.impressions || 0),
    clicks: Number(insight.clicks || 0),
    cpc: Number(insight.cpc || 0),
    ctr: Number(insight.ctr || 0),
    actions,
    costs,
    getAction,
    getCost,
  };
}

function detectGoalFromActions(actions: any[]): string | undefined {
  if (!Array.isArray(actions) || actions.length === 0) return undefined;
  const hasAction = (types: string[]) =>
    actions.some((a) => types.includes(a.action_type) && Number(a.value || 0) > 0);

  if (hasAction(['onsite_conversion.total_messaging_connection', 'onsite_conversion.messaging_conversation_started_7d'])) {
    return 'CONVERSATIONS';
  }
  if (hasAction(['lead', 'onsite_conversion.lead', 'onsite_web_lead'])) {
    return 'LEAD_GENERATION';
  }
  if (hasAction(['like'])) {
    return 'PAGE_LIKES';
  }
  if (hasAction(['purchase', 'onsite_web_purchase'])) {
    return 'OFFSITE_CONVERSIONS';
  }
  if (hasAction(['video_view', 'thruplay'])) {
    return 'THRUPLAY';
  }
  if (hasAction(['onsite_conversion.messaging_user_call_placed', 'onsite_conversion.messaging_60s_call_connect'])) {
    return 'QUALITY_CALL';
  }
  if (hasAction(['landing_page_view'])) {
    return 'LANDING_PAGE_VIEWS';
  }
  if (hasAction(['link_click'])) {
    return 'LINK_CLICKS';
  }
  return undefined;
}

function resolveDynamicInsightMetric(
  data: ReturnType<typeof parseCampaignInsights>,
  dominantGoal?: string,
) {
  const goal = dominantGoal || 'LINK_CLICKS';
  const config = GOAL_TO_DYNAMIC_METRIC[goal] || GOAL_TO_DYNAMIC_METRIC.LINK_CLICKS;

  if (!data) {
    return {
      goal,
      metricLabel: config.pluralLabel,
      costLabel: config.costLabel,
      metricValue: 0,
      costValue: 0,
    };
  }

  if (goal === 'REACH') {
    return {
      goal,
      metricLabel: config.metricLabel,
      costLabel: config.costLabel,
      metricValue: data.reach,
      costValue: data.reach > 0 ? data.spend / data.reach : 0,
    };
  }

  let metricValue = 0;
  let costValue = 0;
  for (const actionType of config.actionTypes) {
    const value = data.getAction(actionType);
    if (value > 0) {
      metricValue = value;
      costValue = data.getCost(actionType);
      break;
    }
  }

  // Fallback: first mapped action if any
  if (metricValue === 0 && config.actionTypes.length > 0) {
    metricValue = data.getAction(config.actionTypes[0]);
    costValue = data.getCost(config.actionTypes[0]);
  }

  // Compute costValue from spend if Meta did not return cost_per_action_type
  if (costValue === 0 && metricValue > 0 && data.spend > 0) {
    costValue = data.spend / metricValue;
  }

  const metricLabel = metricValue === 1 ? config.metricLabel : config.pluralLabel;

  return {
    goal,
    metricLabel,
    costLabel: config.costLabel,
    metricValue,
    costValue,
  };
}

/**
 * Returns date information for Asia/Dhaka (UTC+6).
 * offsetDays = -1 returns yesterday's date in Dhaka time.
 */
export function getDhakaDate(offsetDays = -1): { dateStr: string; formatted: string } {
  const now = new Date();
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  const dhakaOffset = 6 * 60 * 60000; // UTC+6
  const dhakaDate = new Date(utcTime + dhakaOffset);

  dhakaDate.setDate(dhakaDate.getDate() + offsetDays);

  const year = dhakaDate.getFullYear();
  const month = String(dhakaDate.getMonth() + 1).padStart(2, '0');
  const day = String(dhakaDate.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  const formatted = dhakaDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Dhaka',
  });

  return { dateStr, formatted };
}

/** Helper to pause execution briefly to prevent hitting Meta API rate limits */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetches yesterday's metrics for a single Meta campaign.
 * If Meta returns no insights (e.g. 0 spend/impressions),
 * it queries the campaign node for its name and status.
 */
export async function fetchCampaignDailyMetrics(
  campaignId: string,
  dateStr: string,
): Promise<CampaignSpendMetric> {
  const timeRange: TimeRange = { since: dateStr, until: dateStr };

  try {
    // 1. Fetch campaign details and yesterday's insights in parallel
    const [basic, insights] = await Promise.all([
      metaFetch<{
        name?: string;
        status?: string;
        effective_status?: string;
        configured_status?: string;
        stop_time?: string;
        start_time?: string;
        daily_budget?: string;
        lifetime_budget?: string;
        budget_remaining?: string;
        spend_cap?: string;
        objective?: string;
      }>(`/${campaignId}`, {
        fields: 'name,status,effective_status,configured_status,stop_time,start_time,daily_budget,lifetime_budget,budget_remaining,spend_cap,objective',
      }).catch(() => null),
      fetchSingleCampaignInsights(campaignId, undefined, timeRange).catch(() => null),
    ]);

    const delivery = basic ? deriveDeliveryStatus(basic as any) : null;
    const status = delivery?.key || basic?.effective_status || basic?.status || 'UNKNOWN';

    const row = Array.isArray(insights) && insights.length > 0 ? (insights[0] as Record<string, any>) : null;
    const parsed = parseCampaignInsights(row);
    const spendUsd = parsed?.spend || 0;

    // Fast-path: If campaign is NOT active AND had zero spend (< $0.005) yesterday, skip further processing
    if (status !== 'ACTIVE' && spendUsd < 0.005) {
      return {
        campaignId,
        campaignName: basic?.name || `Campaign ${campaignId}`,
        status,
        objective: basic?.objective,
        resultLabel: 'Results',
        resultValue: 0,
        costLabel: 'Cost / Result',
        costPerResultUsd: 0,
        costPerResultBdt: 0,
        spendUsd: 0,
        spendBdt: 0,
        impressions: 0,
        clicks: 0,
        cpc: 0,
        ctr: 0,
      };
    }

    // 2. For campaigns that are ACTIVE or had spend > 0 yesterday, fetch adsets for goal resolution
    const adSetsRes = await fetchAdSetsByCampaign(campaignId, 25).catch(() => null);
    const adSets = (adSetsRes?.data || []) as Array<{ optimization_goal?: string }>;
    let dominantGoal: string | undefined;

    if (adSets.length > 0) {
      const countMap = new Map<string, number>();
      for (const a of adSets) {
        if (a.optimization_goal) {
          countMap.set(a.optimization_goal, (countMap.get(a.optimization_goal) || 0) + 1);
        }
      }
      dominantGoal = [...countMap.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    }

    if (!dominantGoal && basic?.objective) {
      dominantGoal = OBJECTIVE_TO_GOAL[basic.objective];
    }

    if (!dominantGoal && parsed?.actions) {
      dominantGoal = detectGoalFromActions(parsed.actions);
    }

    const dynamic = resolveDynamicInsightMetric(parsed, dominantGoal);
    const spendBdt = Math.round(spendUsd * FX_RATE_BDT_PER_USD * 100) / 100;
    const impressions = parsed?.impressions || 0;
    const clicks = parsed?.clicks || 0;
    const cpc = parsed?.cpc || 0;
    const ctr = parsed?.ctr || 0;

    const costPerResultUsd = Math.round(dynamic.costValue * 10000) / 10000;
    const costPerResultBdt = Math.round(dynamic.costValue * FX_RATE_BDT_PER_USD * 100) / 100;

    return {
      campaignId,
      campaignName: row?.campaign_name || basic?.name || `Campaign ${campaignId}`,
      status,
      objective: basic?.objective,
      resultLabel: dynamic.metricLabel,
      resultValue: dynamic.metricValue,
      costLabel: dynamic.costLabel,
      costPerResultUsd,
      costPerResultBdt,
      spendUsd,
      spendBdt,
      impressions,
      clicks,
      cpc,
      ctr,
    };
  } catch (err) {
    console.warn(`[daily-spend] Failed to fetch metrics for campaign ${campaignId}:`, err);
    return {
      campaignId,
      campaignName: `Campaign ${campaignId}`,
      status: 'UNKNOWN',
      resultLabel: 'Results',
      resultValue: 0,
      costLabel: 'Cost / Result',
      costPerResultUsd: 0,
      costPerResultBdt: 0,
      spendUsd: 0,
      spendBdt: 0,
      impressions: 0,
      clicks: 0,
      cpc: 0,
      ctr: 0,
    };
  }
}

/**
 * Builds the daily spend report for a specific user across all their assigned campaigns.
 */
export async function generateUserDailySpendReport(
  userId: string,
  targetDateStr?: string,
): Promise<UserDailySpendReport | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      username: true,
      email: true,
      phone: true,
      status: true,
    },
  });

  if (!user || user.status !== 'ACTIVE' || !user.email) {
    return null;
  }

  // Find all campaign assignments for this user
  const assignments = await prisma.metaAdAssignment.findMany({
    where: {
      userId,
      metaObjectType: 'CAMPAIGN',
    },
    select: {
      metaObjectId: true,
    },
  });

  const campaignIds = Array.from(new Set(assignments.map((a) => a.metaObjectId)));
  if (campaignIds.length === 0) {
    return null;
  }

  const { dateStr, formatted } = targetDateStr
    ? {
        dateStr: targetDateStr,
        formatted: new Date(targetDateStr).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'Asia/Dhaka',
        }),
      }
    : getDhakaDate(-1);

  const campaignMetrics: CampaignSpendMetric[] = [];
  let totalSpendUsd = 0;
  let totalImpressions = 0;
  let totalClicks = 0;

  // Process campaigns sequentially with gentle throttling (120ms)
  for (const cid of campaignIds) {
    const metric = await fetchCampaignDailyMetrics(cid, dateStr);

    // Include campaigns that are currently ACTIVE, or paused/inactive with spend >= $0.01 (or any spend > 0)
    const hasSpend = metric.spendUsd >= 0.01 || metric.spendUsd > 0.0001;
    const shouldInclude = metric.status === 'ACTIVE' || hasSpend;
    if (!shouldInclude) {
      continue;
    }

    campaignMetrics.push(metric);
    totalSpendUsd += metric.spendUsd;
    totalImpressions += metric.impressions;
    totalClicks += metric.clicks;
    await sleep(120);
  }

  // If user has no active campaigns, return null so no email is sent
  if (campaignMetrics.length === 0) {
    return null;
  }

  const totalSpendBdt = Math.round(totalSpendUsd * FX_RATE_BDT_PER_USD * 100) / 100;

  // Aggregate non-zero key results by label
  const resultsMap = new Map<string, number>();
  for (const c of campaignMetrics) {
    if (c.resultValue > 0) {
      resultsMap.set(c.resultLabel, (resultsMap.get(c.resultLabel) || 0) + c.resultValue);
    }
  }
  const resultsSummary = Array.from(resultsMap.entries()).map(([label, value]) => ({
    label,
    value,
  }));

  return {
    user,
    dateStr,
    dateFormatted: formatted,
    totalSpendUsd: Math.round(totalSpendUsd * 100) / 100,
    totalSpendBdt,
    totalImpressions,
    totalClicks,
    resultsSummary,
    campaigns: campaignMetrics,
  };
}

/**
 * Orchestrator: Processes daily spend reports for all eligible users.
 */
export async function processAllDailySpendReports(options: {
  targetDateStr?: string;
  dryRun?: boolean;
  force?: boolean;
  specificUserId?: string;
} = {}): Promise<{
  date: string;
  totalUsersChecked: number;
  sentCount: number;
  skippedCount: number;
  failedCount: number;
  results: Array<{
    userId: string;
    email: string;
    username: string;
    campaignsCount: number;
    totalSpendUsd: number;
    totalSpendBdt: number;
    status: 'SENT' | 'DRY_RUN' | 'SKIPPED_ALREADY_SENT' | 'FAILED' | 'NO_CAMPAIGNS';
    error?: string;
  }>;
}> {
  const { dateStr } = options.targetDateStr
    ? { dateStr: options.targetDateStr }
    : getDhakaDate(-1);

  // 1. Find users who have at least one campaign assignment
  const assignments = await prisma.metaAdAssignment.findMany({
    where: {
      metaObjectType: 'CAMPAIGN',
      ...(options.specificUserId ? { userId: options.specificUserId } : {}),
    },
    select: {
      userId: true,
    },
    distinct: ['userId'],
  });

  const userIds = assignments.map((a) => a.userId);
  const results: Array<any> = [];
  let sentCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const userId of userIds) {
    try {
      // 2. Check if report was already sent for this date (Idempotency)
      if (!options.force && !options.dryRun) {
        const existingLog = await prisma.activityHistory.findFirst({
          where: {
            userId,
            eventType: 'CUSTOM_ACTION',
            action: 'DAILY_SPEND_REPORT_SENT',
            metadata: {
              path: ['dateStr'],
              equals: dateStr,
            },
          },
        });

        if (existingLog) {
          skippedCount++;
          results.push({
            userId,
            email: '',
            username: '',
            campaignsCount: 0,
            totalSpendUsd: 0,
            totalSpendBdt: 0,
            status: 'SKIPPED_ALREADY_SENT',
          });
          continue;
        }
      }

      // 3. Generate report
      const report = await generateUserDailySpendReport(userId, dateStr);
      if (!report) {
        results.push({
          userId,
          email: '',
          username: '',
          campaignsCount: 0,
          totalSpendUsd: 0,
          totalSpendBdt: 0,
          status: 'NO_CAMPAIGNS',
        });
        continue;
      }

      if (options.dryRun) {
        results.push({
          userId: report.user.id,
          email: report.user.email,
          username: report.user.username,
          campaignsCount: report.campaigns.length,
          totalSpendUsd: report.totalSpendUsd,
          totalSpendBdt: report.totalSpendBdt,
          status: 'DRY_RUN',
        });
        continue;
      }

      // 4. Send email
      await sendDailySpendReportEmail({
        to: report.user.email,
        recipientName: report.user.fullName || report.user.username,
        reportDateFormatted: report.dateFormatted,
        totalSpendUsd: report.totalSpendUsd,
        totalSpendBdt: report.totalSpendBdt,
        totalImpressions: report.totalImpressions,
        totalClicks: report.totalClicks,
        resultsSummary: report.resultsSummary,
        campaigns: report.campaigns,
        dashboardUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://motionbooster.com',
      });

      // 5. Log activity for audit and idempotency
      await logActivity({
        userId: report.user.id,
        eventType: 'CUSTOM_ACTION',
        action: 'DAILY_SPEND_REPORT_SENT',
        path: '/dashboard/my-campaigns',
        method: 'SYSTEM',
        metadata: {
          module: 'daily-spend-report',
          dateStr: report.dateStr,
          recipientEmail: report.user.email,
          campaignsCount: report.campaigns.length,
          totalSpendUsd: report.totalSpendUsd,
          totalSpendBdt: report.totalSpendBdt,
          totalImpressions: report.totalImpressions,
          totalClicks: report.totalClicks,
          resultsSummary: report.resultsSummary,
        },
      });

      sentCount++;
      results.push({
        userId: report.user.id,
        email: report.user.email,
        username: report.user.username,
        campaignsCount: report.campaigns.length,
        totalSpendUsd: report.totalSpendUsd,
        totalSpendBdt: report.totalSpendBdt,
        status: 'SENT',
      });
    } catch (userErr: any) {
      console.error(`[daily-spend] Failed to send report for user ${userId}:`, userErr);
      failedCount++;
      results.push({
        userId,
        email: '',
        username: '',
        campaignsCount: 0,
        totalSpendUsd: 0,
        totalSpendBdt: 0,
        status: 'FAILED',
        error: userErr?.message || 'Unknown error',
      });
    }
  }

  return {
    date: dateStr,
    totalUsersChecked: userIds.length,
    sentCount,
    skippedCount,
    failedCount,
    results,
  };
}
