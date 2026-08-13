import { create } from "zustand";

export type SessionOrganization = {
  id: string;
  company_id: string | null;
  name: string;
  role: string;
};

export type SessionUser = {
  id: string;
  name: string | null;
  email: string;
  email_verified: boolean;
  image: string | null;
  role: string;
  organizations: SessionOrganization[];
};

type SessionState = {
  user: SessionUser | null;
  role: string | null;
  organizations: SessionOrganization[];
  activeOrganizationId: string | null;
  sessionResolved: boolean;
  setSession: (user: SessionUser | null) => void;
  setActiveOrganizationId: (organizationId: string) => void;
  setSessionResolved: (resolved: boolean) => void;
  clearSession: () => void;
};

export const useSessionStore = create<SessionState>()((set) => ({
  user: null,
  role: null,
  organizations: [],
  activeOrganizationId: null,
  sessionResolved: false,
  setSession: (user) =>
    set({
      user,
      role: user?.role ?? null,
      organizations: user?.organizations ?? [],
      activeOrganizationId: user?.organizations[0]?.id ?? null,
    }),
  setActiveOrganizationId: (organizationId) =>
    set({ activeOrganizationId: organizationId }),
  setSessionResolved: (resolved) => set({ sessionResolved: resolved }),
  clearSession: () =>
    set({
      user: null,
      role: null,
      organizations: [],
      activeOrganizationId: null,
    }),
}));
