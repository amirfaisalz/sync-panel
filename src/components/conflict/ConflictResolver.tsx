"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import type {
  ApplicationID,
  ConflictField,
  ResolutionChoice,
} from "@/types/sync";
import { cn } from "@/lib/utils";
import { IntegrationIcon } from "../integrations/IntegrationIcon";

export function ConflictResolver({
  integration,
  conflicts: initialConflicts,
  onBack,
  onMerge,
  isApplying = false,
}: {
  integration: { id: ApplicationID; name: string };
  conflicts: ConflictField[];
  onBack: () => void;
  onMerge: (resolved: ConflictField[]) => void;
  isApplying?: boolean;
}) {
  const [conflicts, setConflicts] = useState<ConflictField[]>(initialConflicts);

  const allResolved = conflicts.every((c) => c.resolution !== null);

  const setResolution = useCallback((id: string, choice: ResolutionChoice) => {
    setConflicts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, resolution: choice } : c)),
    );
  }, []);

  const acceptAllLocal = useCallback(() => {
    setConflicts((prev) => prev.map((c) => ({ ...c, resolution: "local" })));
  }, []);

  const acceptAllExternal = useCallback(() => {
    setConflicts((prev) => prev.map((c) => ({ ...c, resolution: "external" })));
  }, []);

  const resolvedCount = conflicts.filter((c) => c.resolution !== null).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Back to detail
          </button>
          <div className="flex items-center gap-3 mb-2">
            <IntegrationIcon id={integration.id} size="lg" />
            <h1 className="text-2xl font-bold tracking-tight">
              {integration.name} - Resolve Conflicts
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {resolvedCount} of {conflicts.length} conflicts resolved
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={acceptAllLocal}>
            Accept All Local
          </Button>
          <Button variant="outline" size="sm" onClick={acceptAllExternal}>
            Accept All External
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${(resolvedCount / conflicts.length) * 100}%` }}
        />
      </div>

      {/* Conflict Cards */}
      <div className="space-y-4">
        {conflicts.map((conflict) => (
          <Card
            key={conflict.id}
            className={cn(
              "transition-all border-border/50",
              conflict.resolution !== null &&
                "border-emerald-300/50 bg-emerald-50/20 dark:bg-emerald-950/10",
            )}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-mono font-medium">
                  {conflict.fieldName}
                </CardTitle>
                {conflict.resolution !== null && (
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs"
                  >
                    <Check className="size-3 mr-1" />
                    {conflict.resolution === "local" ? "Local" : "External"}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pb-5">
              <div className="grid grid-cols-2 gap-4">
                {/* Local Value */}
                <div
                  className={cn(
                    "rounded-lg border-2 p-4 cursor-pointer transition-all",
                    conflict.resolution === "local"
                      ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30"
                      : "border-border hover:border-muted-foreground/30",
                  )}
                  onClick={() => setResolution(conflict.id, "local")}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Local Value
                    </span>
                    <Button
                      variant={
                        conflict.resolution === "local" ? "default" : "outline"
                      }
                      size="xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setResolution(conflict.id, "local");
                      }}
                    >
                      {conflict.resolution === "local" ? (
                        <>
                          <Check className="size-3 mr-1" />
                          Selected
                        </>
                      ) : (
                        "Use This"
                      )}
                    </Button>
                  </div>
                  <p className="text-sm font-medium break-all">
                    {conflict.localValue}
                  </p>
                </div>

                {/* External Value */}
                <div
                  className={cn(
                    "rounded-lg border-2 p-4 cursor-pointer transition-all",
                    conflict.resolution === "external"
                      ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30"
                      : "border-border hover:border-muted-foreground/30",
                  )}
                  onClick={() => setResolution(conflict.id, "external")}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      External Value
                    </span>
                    <Button
                      variant={
                        conflict.resolution === "external"
                          ? "default"
                          : "outline"
                      }
                      size="xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setResolution(conflict.id, "external");
                      }}
                    >
                      {conflict.resolution === "external" ? (
                        <>
                          <Check className="size-3 mr-1" />
                          Selected
                        </>
                      ) : (
                        "Use This"
                      )}
                    </Button>
                  </div>
                  <p className="text-sm font-medium break-all">
                    {conflict.externalValue}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Apply Merge Button */}
      <Separator />
      <div className="flex justify-end">
        <Button
          size="lg"
          disabled={!allResolved || isApplying}
          onClick={() => onMerge(conflicts)}
          className="gap-2"
        >
          {isApplying ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Applying...
            </>
          ) : (
            <>
              <ArrowRight className="size-4" />
              Apply Merge ({resolvedCount}/{conflicts.length})
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
