"use client";

import { AlertTriangle, WifiOff, ServerCrash, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorStateProps {
  title: string;
  message: string;
  type?: "client" | "server" | "gateway" | "generic";
  onRetry?: () => void;
}

const iconMap = {
  client: AlertTriangle,
  server: ServerCrash,
  gateway: WifiOff,
  generic: AlertTriangle,
};

const colorMap = {
  client: "text-amber-500",
  server: "text-red-500",
  gateway: "text-orange-500",
  generic: "text-muted-foreground",
};

export function ErrorState({
  title,
  message,
  type = "generic",
  onRetry,
}: ErrorStateProps) {
  const Icon = iconMap[type];

  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardContent className="flex flex-col items-center justify-center py-10 text-center">
        <Icon className={`size-10 ${colorMap[type]} mb-4`} />
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm max-w-md mb-6">{message}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="size-3.5 mr-1.5" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Maps an error message from our API layer to a user-friendly ErrorState.
 */
export function getErrorProps(
  message: string,
): Omit<ErrorStateProps, "onRetry"> {
  if (
    message.includes("missing configuration") ||
    message.includes("Missing")
  ) {
    return {
      title: "Configuration Error",
      message:
        "Possible missing configuration. Please check your integration settings and try again.",
      type: "client",
    };
  }
  if (message.includes("Gateway") || message.includes("gateway")) {
    return {
      title: "Gateway Error",
      message:
        "The integration service is currently unreachable. This usually means the external service is down. Please try again later.",
      type: "gateway",
    };
  }
  if (message.includes("Internal server") || message.includes("internal")) {
    return {
      title: "Server Error",
      message:
        "An internal server error occurred. Our team has been notified. Please try again later.",
      type: "server",
    };
  }
  return {
    title: "Something went wrong",
    message: message || "An unexpected error occurred. Please try again.",
    type: "generic",
  };
}
