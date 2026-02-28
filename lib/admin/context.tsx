'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AdminStore,
  ServiceItem,
  TeamMemberItem,
  FAQItem,
  TestimonialItem,
  StatItem,
  SiteSettings,
} from './store';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SiteDataContextValue {
  services: ServiceItem[];
  team: TeamMemberItem[];
  faqs: FAQItem[];
  testimonials: TestimonialItem[];
  stats: StatItem[];
  settings: SiteSettings;
  refreshAll: () => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const SiteDataContext = createContext<SiteDataContextValue | null>(null);

export function SiteDataProvider({ children }: { children: React.ReactNode }) {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [team, setTeam] = useState<TeamMemberItem[]>([]);
  const [faqs, setFAQs] = useState<FAQItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [stats, setStats] = useState<StatItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(AdminStore.getSettings());

  const refreshAll = useCallback(() => {
    setServices(AdminStore.getServices());
    setTeam(AdminStore.getTeam());
    setFAQs(AdminStore.getFAQs());
    setTestimonials(AdminStore.getTestimonials());
    setStats(AdminStore.getStats());
    setSettings(AdminStore.getSettings());
  }, []);

  useEffect(() => {
    refreshAll();
    // Also listen for storage events so admin changes in another tab propagate
    const handler = () => refreshAll();
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [refreshAll]);

  return (
    <SiteDataContext.Provider value={{ services, team, faqs, testimonials, stats, settings, refreshAll }}>
      {children}
    </SiteDataContext.Provider>
  );
}

export function useSiteData(): SiteDataContextValue {
  const ctx = useContext(SiteDataContext);
  if (!ctx) throw new Error('useSiteData must be used inside SiteDataProvider');
  return ctx;
}

// ─── Admin Auth ───────────────────────────────────────────────────────────────

const ADMIN_SESSION_KEY = 'mb_admin_session';
export const ADMIN_USERNAME = 'admin';

interface AdminAuthContextValue {
  isLoggedIn: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true');
  }, []);

  const login = (username: string, password: string): boolean => {
    const profile = AdminStore.getProfile();
    const correctPassword = profile.password || 'MotionBooster@2025';
    if (username === ADMIN_USERNAME && password === correctPassword) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setIsLoggedIn(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  return ctx;
}
