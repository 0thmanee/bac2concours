import { requireStudent } from "@/lib/auth-security";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Validate user is student with verified email
  // This checks DB state, not just JWT, preventing stale session attacks
  await requireStudent();

  // Just render children - payment/dashboard layouts will handle their own logic
  return <>{children}</>;
}

