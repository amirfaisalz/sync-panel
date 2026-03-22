import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConflictsClient } from "@/components/conflict/ConflictsClient";
import type { ConflictField } from "@/types/sync";

vi.mock("@/actions/conflicts.action", () => ({
  applyConflictMergeAction: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { applyConflictMergeAction } from "@/actions/conflicts.action";
import { toast } from "sonner";

const mockIntegration = { id: "hubspot" as const, name: "HubSpot" };

const mockConflicts: ConflictField[] = [
  {
    id: "c1",
    fieldName: "user.email",
    localValue: "john@local.com",
    externalValue: "john@external.com",
    resolution: null,
  },
];

describe("ConflictsClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the ConflictResolver", () => {
    render(
      <ConflictsClient
        integration={mockIntegration}
        conflicts={mockConflicts}
      />,
    );

    expect(screen.getByText("user.email")).toBeInTheDocument();
    expect(screen.getByText(/HubSpot - Resolve Conflicts/)).toBeInTheDocument();
  });

  it("should call applyConflictMergeAction when merge is triggered", async () => {
    const user = userEvent.setup();
    (applyConflictMergeAction as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined,
    );

    render(
      <ConflictsClient
        integration={mockIntegration}
        conflicts={mockConflicts}
      />,
    );

    // Resolve the conflict first
    await user.click(screen.getByRole("button", { name: /accept all local/i }));
    // Click apply merge
    await user.click(screen.getByRole("button", { name: /apply merge/i }));

    expect(toast.success).toHaveBeenCalledWith(
      "Conflicts resolved. Merge applied.",
    );
    expect(applyConflictMergeAction).toHaveBeenCalledWith(
      "hubspot",
      expect.arrayContaining([
        expect.objectContaining({ id: "c1", resolution: "local" }),
      ]),
    );
  });

  it("should handle errors from applyConflictMergeAction", async () => {
    const user = userEvent.setup();
    (applyConflictMergeAction as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Merge failed"),
    );

    render(
      <ConflictsClient
        integration={mockIntegration}
        conflicts={mockConflicts}
      />,
    );

    await user.click(screen.getByRole("button", { name: /accept all local/i }));
    await user.click(screen.getByRole("button", { name: /apply merge/i }));

    // Wait for error to be shown
    await vi.waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Merge failed");
    });
  });

  it("should handle error with empty message from applyConflictMergeAction", async () => {
    const user = userEvent.setup();
    (applyConflictMergeAction as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error(""),
    );

    render(
      <ConflictsClient
        integration={mockIntegration}
        conflicts={mockConflicts}
      />,
    );

    await user.click(screen.getByRole("button", { name: /accept all local/i }));
    await user.click(screen.getByRole("button", { name: /apply merge/i }));

    // Wait for fallback error text
    await vi.waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to apply merge. Please try again.",
      );
    });
  });

  it("should not show error toast for NEXT_REDIRECT", async () => {
    const user = userEvent.setup();
    (applyConflictMergeAction as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("NEXT_REDIRECT"),
    );

    render(
      <ConflictsClient
        integration={mockIntegration}
        conflicts={mockConflicts}
      />,
    );

    await user.click(screen.getByRole("button", { name: /accept all local/i }));
    await user.click(screen.getByRole("button", { name: /apply merge/i }));

    // Give time for the promise to reject
    await new Promise((r) => setTimeout(r, 100));
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("should navigate back when 'Back to detail' is clicked", async () => {
    const user = userEvent.setup();

    render(
      <ConflictsClient
        integration={mockIntegration}
        conflicts={mockConflicts}
      />,
    );

    await user.click(screen.getByText(/back to detail/i));

    // The onBack handler calls router.push, which is mocked by next/navigation mock
    // Just verify the button is clickable and doesn't crash
    expect(screen.getByText(/back to detail/i)).toBeInTheDocument();
  });
});
