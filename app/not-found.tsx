import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROOT_ROUTES } from "@/lib/routes";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-ops-background">
      <div className="w-full max-w-md text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-neutral-100 border border-ops p-4">
            <FileQuestion className="h-16 w-16 text-ops-tertiary" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-ops-primary">404</h1>
          <h2 className="text-2xl font-semibold text-ops-primary">
            Page Not Found
          </h2>
          <p className="text-sm text-ops-secondary">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-4">
          <Button asChild className="ops-btn-primary w-full h-10">
            <Link href={ROOT_ROUTES.HOME}>
              <Home className="mr-2 h-4 w-4" />
              Go to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

