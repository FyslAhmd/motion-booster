/**
 * Derive a human-friendly delivery status matching Facebook Ads Manager.
 * Meta's API only returns basic effective_status (ACTIVE/PAUSED/DELETED/ARCHIVED/
 * IN_PROCESS/WITH_ISSUES), but Ads Manager derives richer statuses from multiple
 * fields: stop_time, start_time, budget_remaining, etc.
 *
 * This is the single source of truth — shared by all API routes.
 */

export interface CampaignLike {
  effective_status: string;
  status: string;
  configured_status?: string;
  stop_time?: string;
  start_time?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  budget_remaining?: string;
  spend_cap?: string;
}

export function deriveDeliveryStatus(c: CampaignLike): { label: string; key: string } {
  const now = new Date();

  // ── Hard statuses from API ──
  if (c.effective_status === 'DELETED')
    return { label: 'Deleted', key: 'DELETED' };
  if (c.effective_status === 'ARCHIVED')
    return { label: 'Archived', key: 'ARCHIVED' };
  if (c.effective_status === 'IN_PROCESS')
    return { label: 'In Review', key: 'IN_REVIEW' };
  if (c.effective_status === 'WITH_ISSUES')
    return { label: 'Not Approved', key: 'NOT_APPROVED' };

  // ── Paused ──
  if (
    c.effective_status === 'PAUSED' ||
    c.status === 'PAUSED' ||
    c.configured_status === 'PAUSED'
  )
    return { label: 'Paused', key: 'PAUSED' };

  // ── ACTIVE campaigns: derive richer status ──
  if (c.effective_status === 'ACTIVE') {
    // Completed: stop_time is in the past
    if (c.stop_time && new Date(c.stop_time) <= now) {
      const daysSinceEnd =
        (now.getTime() - new Date(c.stop_time).getTime()) /
        (1000 * 60 * 60 * 24);
      if (daysSinceEnd <= 3)
        return { label: 'Recently Completed', key: 'RECENTLY_COMPLETED' };
      return { label: 'Completed', key: 'COMPLETED' };
    }

    // Completed: lifetime budget fully spent
    if (
      c.lifetime_budget &&
      c.budget_remaining !== undefined &&
      parseInt(c.budget_remaining, 10) <= 0
    )
      return { label: 'Completed', key: 'COMPLETED' };

    // Completed: spend cap reached
    if (
      c.spend_cap &&
      parseInt(c.spend_cap, 10) > 0 &&
      c.budget_remaining !== undefined &&
      parseInt(c.budget_remaining, 10) <= 0
    )
      return { label: 'Completed', key: 'COMPLETED' };

    // Scheduled: start_time is in the future
    if (c.start_time && new Date(c.start_time) > now)
      return { label: 'Scheduled', key: 'SCHEDULED' };

    // Not Delivering: no budget of any kind
    if (!c.daily_budget && !c.lifetime_budget && !c.spend_cap)
      return { label: 'Not Delivering', key: 'NOT_DELIVERING' };

    // Active and delivering
    return { label: 'Active', key: 'ACTIVE' };
  }

  // ── Fallback ──
  return {
    label: c.effective_status?.replace(/_/g, ' ') || 'Unknown',
    key: c.effective_status || 'UNKNOWN',
  };
}

// ── Label maps for ad sets and ads ──────────────────────────────────────────

const AD_SET_LABELS: Record<string, string> = {
  ACTIVE:               'Active',
  PAUSED:               'Paused',
  CAMPAIGN_PAUSED:      'Campaign Off',
  IN_PROCESS:           'In Review',
  WITH_ISSUES:          'Issues',
  PENDING_REVIEW:       'Pending Review',
  DISAPPROVED:          'Not Approved',
  PENDING_BILLING_INFO: 'Billing Issue',
  PREAPPROVED:          'Preapproved',
  DELETED:              'Deleted',
  ARCHIVED:             'Archived',
};

const AD_LABELS: Record<string, string> = {
  ...AD_SET_LABELS,
  ADSET_PAUSED: 'Ad Set Off',
};

/**
 * Normalize an ad set's effective_status into a { label, key } pair.
 * Unlike campaigns, ad sets don't have stop_time-derived statuses —
 * effective_status from Meta is already accurate.
 */
export function deriveAdSetStatus(c: { effective_status: string; status: string }): { label: string; key: string } {
  const key = c.effective_status || c.status || 'UNKNOWN';
  return { label: AD_SET_LABELS[key] ?? key.replace(/_/g, ' '), key };
}

/**
 * Normalize an ad's effective_status into a { label, key } pair.
 */
export function deriveAdStatus(c: { effective_status: string; status: string }): { label: string; key: string } {
  const key = c.effective_status || c.status || 'UNKNOWN';
  return { label: AD_LABELS[key] ?? key.replace(/_/g, ' '), key };
}
