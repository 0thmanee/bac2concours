import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDefaultDashboard } from "@/lib/routes";
import { PublicHeader } from "@/components/marketing/public-header";
import { HeroSection } from "@/components/marketing/hero-section";

export default async function Home() {
  let session = null;
  try {
    session = await auth();
  } catch {
    // If JWT fails, show homepage
    session = null;
  }

  // If user is logged in, redirect to dashboard
  if (session?.user) {
    // Redirect to role-specific dashboard
    const dashboardUrl = getDefaultDashboard(session.user.role);
    redirect(dashboardUrl);
  }

  // Not authenticated - show homepage
  return (
    <>
      <PublicHeader />
      <HeroSection />
    </>
  );
}
