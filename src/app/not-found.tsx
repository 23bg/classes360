// app/not-found.tsx
import Link from "next/link";
import { Ghost } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center bg-background">
      <Ghost className="h-16 w-16 text-muted-foreground mb-4" />
      <h2 className="text-2xl font-semibold">Page Not Found</h2>
      <p className="mt-2 text-muted-foreground">
        Oops! The page youâ€™re looking for doesnâ€™t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center rounded-xl bg-primary px-4 py-2 text-white hover:bg-primary/90 transition-colors"
      >
        Go Back Home
      </Link>
    </div>
  );
}


