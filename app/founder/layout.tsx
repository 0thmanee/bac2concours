import { requireFounder } from "@/lib/auth-security";

export default async function FounderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Validate user is founder with verified email
  // This checks DB state, not just JWT, preventing stale session attacks
  await requireFounder();

  // Just render children - payment/dashboard layouts will handle their own logic
  return <>{children}</>;
}

