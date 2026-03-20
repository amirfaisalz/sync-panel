"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ApplicationID, ConflictField } from "@/types/sync";
import { ConflictResolver } from "@/components/conflict/ConflictResolver";
import { applyConflictMergeAction } from "@/actions/conflicts.action";

export function ConflictsClient({
  integration,
  conflicts,
}: Readonly<{
  integration: { id: ApplicationID; name: string };
  conflicts: ConflictField[];
}>) {
  const router = useRouter();
  const [isApplying, setIsApplying] = useState(false);

  const handleMerge = async (resolved: ConflictField[]) => {
    setIsApplying(true);
    toast.success("Conflicts resolved. Merge applied.");

    try {
      await applyConflictMergeAction(integration.id, resolved);
      router.refresh();
    } catch (error) {
      if (error instanceof Error && error.message !== "NEXT_REDIRECT") {
        toast.error(
          error.message || "Failed to apply merge. Please try again.",
        );
        setIsApplying(false);
      }
    }
  };

  return (
    <ConflictResolver
      integration={integration}
      conflicts={conflicts}
      onBack={() => router.push(`/integrations/${integration.id}`)}
      onMerge={handleMerge}
      isApplying={isApplying}
    />
  );
}
