import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AUTH_ROUTES, ROOT_ROUTES } from "@/lib/routes";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-error-light p-4">
            <ShieldAlert className="h-16 w-16 text-error" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">
            You don&apos;t have permission to access this page.
          </p>
        </div>

        <div className="space-y-3 pt-4">
          <Button asChild className="w-full">
            <Link href={ROOT_ROUTES.HOME}>Go to Dashboard</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href={AUTH_ROUTES.LOGIN}>Back to Login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
