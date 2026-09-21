import { adminClient, organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "/api/auth",
  plugins: [adminClient(), organizationClient()],
});
