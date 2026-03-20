"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SyncHistoryEvent } from "@/types/sync";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  return (
    d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) +
    " " +
    d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
  );
}

function HistoryRow({ event }: { event: SyncHistoryEvent }) {
  const [expanded, setExpanded] = useState(false);
  const { id: applicationId } = useParams();

  // Generate generic detail text from the changes to simulate the image's "Details:"
  const isConflict = event.summary.toLowerCase().includes("conflict");
  const detailsText = isConflict
    ? "Field mismatch in contact records"
    : `Updated ${event.stats.total} records`;

  return (
    <div className="flex flex-col border-b last:border-b-0 border-border/50">
      <div
        className="grid grid-cols-[12px_1fr_1fr_1fr_2fr_1fr] items-center px-4 py-4 cursor-pointer hover:bg-muted/20 transition-colors gap-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex justify-center text-muted-foreground">
          {expanded ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </div>

        <div className="text-sm font-medium">
          {formatDateTime(event.timestamp)}
        </div>

        <div className="flex items-center">
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-medium border-0 px-2 py-0.5 rounded-full capitalize",
              event.source === "system"
                ? "bg-indigo-50 text-indigo-700"
                : "bg-slate-100 text-slate-700",
            )}
          >
            {event.source}
          </Badge>
        </div>

        <div className="text-sm text-muted-foreground">{event.version}</div>

        <div className="text-sm text-foreground truncate">{event.summary}</div>

        <div className="flex justify-center">
          <Link
            href={`/integrations/${applicationId}/version-diff?version=${event.version}`}
            className="flex flex-col items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors group"
            onClick={(e) => e.stopPropagation()}
          >
            <Eye className="size-4 group-hover:text-foreground" />
            <span className="leading-none">View Changes</span>
          </Link>
        </div>
      </div>

      {expanded && (
        <div className="bg-white border-t border-border/50 px-16 py-5 pl-[64px]">
          <h4 className="font-semibold text-sm mb-1 text-foreground">
            Details:
          </h4>
          <p className="text-sm text-muted-foreground">{detailsText}</p>
        </div>
      )}
    </div>
  );
}

export function HistoryTable({ events }: { events: SyncHistoryEvent[] }) {
  return (
    <div className="border border-border/60 rounded-xl bg-white overflow-hidden shadow-sm">
      {/* Table Header */}
      <div className="grid grid-cols-[12px_1fr_1fr_1fr_2fr_1fr] items-center px-4 py-3 border-b border-border/60 bg-white gap-4">
        <div></div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          TIMESTAMP
        </div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          SOURCE
        </div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          VERSION
        </div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          SUMMARY
        </div>
        <div className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          ACTIONS
        </div>
      </div>

      {/* Table Body */}
      <div className="flex flex-col">
        {!events || events.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-white">
            No sync history available.
          </div>
        ) : (
          events.map((event) => <HistoryRow key={event.id} event={event} />)
        )}
      </div>
    </div>
  );
}
