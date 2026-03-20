"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error]:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4 border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-destructive/10 p-4 mb-6">
              <AlertTriangle className="size-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Something went wrong!</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm">
              We encountered an unexpected error. Please try again or contact
              support if the problem persists.
            </p>
            <Button
              onClick={() => reset()}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="size-4" />
              Try again
            </Button>
          </CardContent>
        </Card>
      </body>
    </html>
  );
}
