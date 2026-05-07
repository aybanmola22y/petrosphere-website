import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] w-full flex-col items-center justify-center bg-background px-6">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
        <AlertCircle className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="mb-4 text-3xl font-bold text-foreground">404 Page Not Found</h1>
      <p className="mb-8 max-w-sm text-center text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Return Home
      </Link>
    </div>
  );
}
