"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function VersionDiffError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <Link
        href="/integrations"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        ← Back to integration
      </Link>
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-destructive/10 p-4 mb-4">
            <AlertTriangle className="size-8 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold mb-2">
            Failed to load version diff
          </h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm">
            {error.message || "An error occurred while loading version diff."}
          </p>
          <div className="flex gap-3">
            <Button onClick={() => reset()} variant="outline" className="gap-2">
              <RefreshCw className="size-4" />
              Try again
            </Button>
            <Link href="/integrations">
              <Button variant="ghost">Go back</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
