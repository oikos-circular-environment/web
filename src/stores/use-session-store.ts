import { create } from "zustand";

export type SessionOrganization = {
  id: string;
  name: string;
  role: string;
};

export type SessionUser = {
  id: string;
  name: string | null;
  email: string;
  email_verified: boolean;
  image: string | null;
  role: "user" | "moderator";
};

type SessionState = {
  user: SessionUser | null;
  role: SessionUser["role"] | null;
  organizations: SessionOrganization[];
  activeOrganizationId: string | null;
  sessionResolved: boolean;
  setSession: (
    user: SessionUser | null,
    organizations?: SessionOrganization[],
  ) => void;
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
  setSession: (user, organizations = []) =>
    set({
      user,
      role: user?.role ?? null,
      organizations,
      activeOrganizationId: organizations[0]?.id ?? null,
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
