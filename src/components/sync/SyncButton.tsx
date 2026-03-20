"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { syncIntegration } from "@/actions/sync.action";
import { Button } from "../ui/button";
import type { ApplicationID } from "@/types/sync";

export function SyncButton({ id }: { id: ApplicationID }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    startTransition(async () => {
      try {
        await syncIntegration(id);
        router.refresh();
      } catch (error) {
        if (error instanceof Error && error.message !== "NEXT_REDIRECT") {
          toast.error(error.message || "Failed to sync");
        }
      }
    });
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center gap-2 border px-3 py-2 rounded-md"
    >
      <RefreshCw className={`size-4 ${isPending ? "animate-spin" : ""}`} />
      {isPending ? "Syncing..." : "Sync Now"}
    </Button>
  );
}
