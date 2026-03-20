"use server";

import { redirect } from "next/navigation";
import type { ApplicationID, ConflictField } from "@/types/sync";
import { applyMockConflictMerge } from "@/services/sync.service";

export async function applyConflictMergeAction(
  id: ApplicationID,
  resolvedConflicts: ConflictField[],
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  applyMockConflictMerge(id, resolvedConflicts);
  redirect(`/integrations/${id}`);
}

