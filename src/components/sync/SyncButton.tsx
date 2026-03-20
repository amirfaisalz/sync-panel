"use client";

import { useState, useTransition } from "react";
import { RefreshCw, Check, X, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { syncIntegration, applySyncAction } from "@/actions/sync.action";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import type { ApplicationID, SyncChange } from "@/types/sync";

const changeTypeConfig: Record<
  string,
  { label: string; icon: React.ReactNode; className: string }
> = {
  ADD: {
    label: "Add",
    icon: <Plus className="size-3" />,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  UPDATE: {
    label: "Update",
    icon: <Pencil className="size-3" />,
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  DELETE: {
    label: "Delete",
    icon: <Trash2 className="size-3" />,
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

export function SyncButton({
  id,
  integrationName,
}: {
  id: ApplicationID;
  integrationName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [changes, setChanges] = useState<SyncChange[]>([]);
  const [isApplying, setIsApplying] = useState(false);

  const handleSyncClick = () => {
    startTransition(async () => {
      try {
        const result = await syncIntegration(id);

        if (result.isApiError) {
          if (result.statusCode === 400 || result.statusCode === 404) {
            toast.error("Configuration issue: Please check your integration settings.");
          } else if (result.statusCode === 500) {
            toast.error("Internal server error. Please try again later.");
          } else if (result.statusCode === 502) {
            toast.error("Gateway error: Integration service is currently unavailable.");
          } else {
            toast.error(result.message || "Sync failed. Please try again.");
          }
          return;
        }

        if (result.changes.length === 0) {
          toast.success(
            `${integrationName} is already in sync — no changes to review.`,
          );
          return;
        }

        setChanges(result.changes);
        setDialogOpen(true);
      } catch (error) {
        if (error instanceof Error && error.message !== "NEXT_REDIRECT") {
          toast.error(error.message || "Failed to sync. Please try again.");
        }
      }
    });
  };

  const handleApprove = () => {
    setIsApplying(true);
    toast.success(`${integrationName} synced successfully!`);
    startTransition(async () => {
      try {
        await applySyncAction(id, changes);
      } catch (error) {
        if (error instanceof Error && error.message !== "NEXT_REDIRECT") {
          toast.error(error.message);
          setIsApplying(false);
        }
      }
    });
  };

  const stats = {
    added: changes.filter((c) => c.change_type === "ADD").length,
    updated: changes.filter((c) => c.change_type === "UPDATE").length,
    deleted: changes.filter((c) => c.change_type === "DELETE").length,
  };

  return (
    <>
      <Button
        onClick={handleSyncClick}
        disabled={isPending}
        className="inline-flex items-center gap-2 border px-3 py-2 rounded-md"
      >
        <RefreshCw className={`size-4 ${isPending ? "animate-spin" : ""}`} />
        {isPending ? "Syncing..." : "Sync Now"}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[90vw]! max-h-[85vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle>Sync Approval — {integrationName}</DialogTitle>
            <DialogDescription>
              Review the following changes before applying them.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-0 flex gap-4 text-sm">
            {stats.added > 0 && (
              <div className="flex items-center gap-1.5 text-emerald-700">
                <Plus className="size-3.5" />
                <span className="font-medium">{stats.added} additions</span>
              </div>
            )}
            {stats.updated > 0 && (
              <div className="flex items-center gap-1.5 text-blue-700">
                <Pencil className="size-3.5" />
                <span className="font-medium">{stats.updated} updates</span>
              </div>
            )}
            {stats.deleted > 0 && (
              <div className="flex items-center gap-1.5 text-red-700">
                <Trash2 className="size-3.5" />
                <span className="font-medium">{stats.deleted} deletions</span>
              </div>
            )}
            <div className="ml-auto text-muted-foreground">
              {changes.length} total change{changes.length !== 1 ? "s" : ""}
            </div>
          </div>

          <Separator className="mx-6" />

          <div className="flex-1 overflow-y-auto space-y-3 px-6 pb-4">
            {changes.map((change) => {
              const config = changeTypeConfig[change.change_type];
              return (
                <Card key={change.id} className="border-border/50">
                  <CardContent className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium font-mono">
                        {change.field_name}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs gap-1 ${config.className}`}
                      >
                        {config.icon}
                        {config.label}
                      </Badge>
                    </div>

                    {change.change_type === "UPDATE" && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="bg-muted/60 rounded px-2 py-1 text-muted-foreground line-through">
                          {change.current_value}
                        </span>
                        <span className="text-muted-foreground">→</span>
                        <span className="bg-emerald-50 rounded px-2 py-1 text-emerald-800 font-medium">
                          {change.new_value}
                        </span>
                      </div>
                    )}

                    {change.change_type === "ADD" && (
                      <div className="text-sm">
                        <span className="bg-emerald-50 rounded px-2 py-1 text-emerald-800 font-medium">
                          {change.new_value}
                        </span>
                      </div>
                    )}

                    {change.change_type === "DELETE" && (
                      <div className="text-sm">
                        <span className="bg-red-50 rounded px-2 py-1 text-red-700 line-through">
                          {change.current_value}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Separator />

          <div className="flex justify-end gap-2 px-6 py-4">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isApplying}
            >
              <X className="size-3.5 mr-1.5" />
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={isApplying}>
              <Check className="size-3.5 mr-1.5" />
              {isApplying
                ? "Applying..."
                : `Approve & Apply (${changes.length})`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
