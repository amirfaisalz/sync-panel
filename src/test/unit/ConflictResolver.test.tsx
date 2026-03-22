import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConflictResolver } from "@/components/conflict/ConflictResolver";
import type { ConflictField } from "@/types/sync";

const mockIntegration = { id: "hubspot" as const, name: "HubSpot" };

const mockConflicts: ConflictField[] = [
  {
    id: "c1",
    fieldName: "user.email",
    localValue: "john@local.com",
    externalValue: "john@external.com",
    resolution: null,
  },
  {
    id: "c2",
    fieldName: "user.name",
    localValue: "John Smith",
    externalValue: "Jonathan Smith",
    resolution: null,
  },
  {
    id: "c3",
    fieldName: "user.phone",
    localValue: "+1-555-0100",
    externalValue: "+1-555-0200",
    resolution: null,
  },
];

describe("ConflictResolver", () => {
  it("should render conflict field names", () => {
    render(
      <ConflictResolver
        integration={mockIntegration}
        conflicts={mockConflicts}
        onBack={vi.fn()}
        onMerge={vi.fn()}
      />,
    );

    expect(screen.getByText("user.email")).toBeInTheDocument();
    expect(screen.getByText("user.name")).toBeInTheDocument();
    expect(screen.getByText("user.phone")).toBeInTheDocument();
  });

  it("should render local and external values for each conflict", () => {
    render(
      <ConflictResolver
        integration={mockIntegration}
        conflicts={mockConflicts}
        onBack={vi.fn()}
        onMerge={vi.fn()}
      />,
    );

    expect(screen.getByText("john@local.com")).toBeInTheDocument();
    expect(screen.getByText("john@external.com")).toBeInTheDocument();
    expect(screen.getByText("John Smith")).toBeInTheDocument();
    expect(screen.getByText("Jonathan Smith")).toBeInTheDocument();
  });

  it('should show "0 of N conflicts resolved" initially', () => {
    render(
      <ConflictResolver
        integration={mockIntegration}
        conflicts={mockConflicts}
        onBack={vi.fn()}
        onMerge={vi.fn()}
      />,
    );

    expect(screen.getByText(/0 of 3 conflicts resolved/)).toBeInTheDocument();
  });

  it("should render the integration name in the heading", () => {
    render(
      <ConflictResolver
        integration={mockIntegration}
        conflicts={mockConflicts}
        onBack={vi.fn()}
        onMerge={vi.fn()}
      />,
    );

    expect(screen.getByText(/HubSpot - Resolve Conflicts/)).toBeInTheDocument();
  });

  it('should update resolution count when clicking "Use This" button', async () => {
    const user = userEvent.setup();

    render(
      <ConflictResolver
        integration={mockIntegration}
        conflicts={mockConflicts}
        onBack={vi.fn()}
        onMerge={vi.fn()}
      />,
    );

    // Click the first "Use This" button (local of first conflict)
    const useThisButtons = screen.getAllByRole("button", { name: /use this/i });
    await user.click(useThisButtons[0]);

    expect(screen.getByText(/1 of 3 conflicts resolved/)).toBeInTheDocument();
  });

  it('should show "Selected" after choosing a resolution', async () => {
    const user = userEvent.setup();

    render(
      <ConflictResolver
        integration={mockIntegration}
        conflicts={mockConflicts}
        onBack={vi.fn()}
        onMerge={vi.fn()}
      />,
    );

    const useThisButtons = screen.getAllByRole("button", { name: /use this/i });
    await user.click(useThisButtons[0]);

    expect(
      screen.getByRole("button", { name: /selected/i }),
    ).toBeInTheDocument();
  });

  it('should resolve all conflicts with "Accept All Local"', async () => {
    const user = userEvent.setup();

    render(
      <ConflictResolver
        integration={mockIntegration}
        conflicts={mockConflicts}
        onBack={vi.fn()}
        onMerge={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /accept all local/i }));

    expect(screen.getByText(/3 of 3 conflicts resolved/)).toBeInTheDocument();
  });

  it('should resolve all conflicts with "Accept All External"', async () => {
    const user = userEvent.setup();

    render(
      <ConflictResolver
        integration={mockIntegration}
        conflicts={mockConflicts}
        onBack={vi.fn()}
        onMerge={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /accept all external/i }),
    );

    expect(screen.getByText(/3 of 3 conflicts resolved/)).toBeInTheDocument();
  });

  it('should disable "Apply Merge" button when not all conflicts are resolved', () => {
    render(
      <ConflictResolver
        integration={mockIntegration}
        conflicts={mockConflicts}
        onBack={vi.fn()}
        onMerge={vi.fn()}
      />,
    );

    const applyButton = screen.getByRole("button", { name: /apply merge/i });
    expect(applyButton).toBeDisabled();
  });

  it('should enable "Apply Merge" button when all conflicts are resolved', async () => {
    const user = userEvent.setup();

    render(
      <ConflictResolver
        integration={mockIntegration}
        conflicts={mockConflicts}
        onBack={vi.fn()}
        onMerge={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /accept all local/i }));

    const applyButton = screen.getByRole("button", { name: /apply merge/i });
    expect(applyButton).not.toBeDisabled();
  });

  it('should call onMerge with resolved conflicts when "Apply Merge" is clicked', async () => {
    const user = userEvent.setup();
    const onMerge = vi.fn();

    render(
      <ConflictResolver
        integration={mockIntegration}
        conflicts={mockConflicts}
        onBack={vi.fn()}
        onMerge={onMerge}
      />,
    );

    await user.click(screen.getByRole("button", { name: /accept all local/i }));
    await user.click(screen.getByRole("button", { name: /apply merge/i }));

    expect(onMerge).toHaveBeenCalledTimes(1);
    const resolvedConflicts = onMerge.mock.calls[0][0] as ConflictField[];
    expect(resolvedConflicts).toHaveLength(3);
    expect(
      resolvedConflicts.every((c: ConflictField) => c.resolution === "local"),
    ).toBe(true);
  });

  it('should show "Applying..." when isApplying is true', () => {
    render(
      <ConflictResolver
        integration={mockIntegration}
        conflicts={mockConflicts}
        onBack={vi.fn()}
        onMerge={vi.fn()}
        isApplying={true}
      />,
    );

    expect(screen.getByText(/applying/i)).toBeInTheDocument();
  });

  it('should call onBack when "Back to detail" is clicked', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();

    render(
      <ConflictResolver
        integration={mockIntegration}
        conflicts={mockConflicts}
        onBack={onBack}
        onMerge={vi.fn()}
      />,
    );

    await user.click(screen.getByText(/back to detail/i));

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('should display progress as "resolved/total" in merge button', () => {
    render(
      <ConflictResolver
        integration={mockIntegration}
        conflicts={mockConflicts}
        onBack={vi.fn()}
        onMerge={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: /apply merge \(0\/3\)/i }),
    ).toBeInTheDocument();
  });

  it("should resolve conflict by clicking the external value container", async () => {
    const user = userEvent.setup();

    render(
      <ConflictResolver
        integration={mockIntegration}
        conflicts={mockConflicts}
        onBack={vi.fn()}
        onMerge={vi.fn()}
      />,
    );

    // Click the external value text directly (hits the container div's onClick)
    await user.click(screen.getByText("john@external.com"));

    expect(screen.getByText(/1 of 3 conflicts resolved/)).toBeInTheDocument();
  });

  it("should resolve conflict by clicking the local value container", async () => {
    const user = userEvent.setup();

    render(
      <ConflictResolver
        integration={mockIntegration}
        conflicts={mockConflicts}
        onBack={vi.fn()}
        onMerge={vi.fn()}
      />,
    );

    // Click the local value text directly (hits the container div's onClick on line 127)
    await user.click(screen.getByText("john@local.com"));

    expect(screen.getByText(/1 of 3 conflicts resolved/)).toBeInTheDocument();
  });

  it("should resolve conflict by clicking the external Use This button", async () => {
    const user = userEvent.setup();

    render(
      <ConflictResolver
        integration={mockIntegration}
        conflicts={mockConflicts}
        onBack={vi.fn()}
        onMerge={vi.fn()}
      />,
    );

    // The first conflict's external value uses this button (line 180 onClick)
    const useThisButtons = screen.getAllByRole("button", { name: /use this/i });

    // Index 1 corresponds to "Use This" for the external value on the first conflict
    await user.click(useThisButtons[1]);

    expect(screen.getByText(/1 of 3 conflicts resolved/)).toBeInTheDocument();
  });
});
