"use client";

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

  return (
    <ConflictResolver
      integration={integration}
      conflicts={conflicts}
      onBack={() => router.push(`/integrations/${integration.id}`)}
      onMerge={(resolved) => {
        toast.success("Conflicts resolved. Merge applied.");
        (async () => {
          try {
            await applyConflictMergeAction(integration.id, resolved);
          } catch (error) {
            if (!(error instanceof Error)) return;
            if (error.message === "NEXT_REDIRECT") return;
            toast.error(error.message);
          } finally {
            router.refresh();
          }
        })();
      }}
    />
  );
}
