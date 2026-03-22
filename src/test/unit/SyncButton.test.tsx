import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SyncButton } from "@/components/sync/SyncButton";

vi.mock("@/actions/sync.action", () => ({
  syncIntegration: vi.fn(),
  applySyncAction: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { syncIntegration, applySyncAction } from "@/actions/sync.action";
import { toast } from "sonner";

describe("SyncButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render sync button", () => {
    render(<SyncButton id="salesforce" integrationName="Salesforce" />);
    expect(screen.getByText("Sync Now")).toBeInTheDocument();
  });

  it("should show syncing text when pending", () => {
    render(<SyncButton id="salesforce" integrationName="Salesforce" />);
    const button = screen.getByRole("button", { name: /sync now/i });
    expect(button).not.toBeDisabled();
  });

  it("should display integration name in dialog title when opened", async () => {
    const user = userEvent.setup();
    (syncIntegration as ReturnType<typeof vi.fn>).mockResolvedValue({
      isApiError: false,
      changes: [
        {
          id: "1",
          field_name: "email",
          change_type: "UPDATE",
          current_value: "old@test.com",
          new_value: "new@test.com",
        },
      ],
    });

    render(<SyncButton id="salesforce" integrationName="Salesforce" />);
    await user.click(screen.getByRole("button", { name: /sync now/i }));

    await waitFor(() => {
      expect(screen.getByText(/salesforce/i)).toBeInTheDocument();
    });
  });

  it("should show stats when changes exist", async () => {
    const user = userEvent.setup();
    (syncIntegration as ReturnType<typeof vi.fn>).mockResolvedValue({
      isApiError: false,
      changes: [
        {
          id: "1",
          field_name: "email",
          change_type: "UPDATE",
          current_value: "old@test.com",
          new_value: "new@test.com",
        },
        { id: "2", field_name: "name", change_type: "ADD", new_value: "John" },
        {
          id: "3",
          field_name: "phone",
          change_type: "DELETE",
          current_value: "123",
        },
      ],
    });

    render(<SyncButton id="salesforce" integrationName="Salesforce" />);
    await user.click(screen.getByRole("button", { name: /sync now/i }));

    await waitFor(() => {
      expect(screen.getByText(/additions/)).toBeInTheDocument();
      expect(screen.getByText(/updates/)).toBeInTheDocument();
      expect(screen.getByText(/deletions/)).toBeInTheDocument();
    });
  });

  it("should show approve button with change count", async () => {
    const user = userEvent.setup();
    (syncIntegration as ReturnType<typeof vi.fn>).mockResolvedValue({
      isApiError: false,
      changes: [
        {
          id: "1",
          field_name: "email",
          change_type: "ADD",
          new_value: "test@test.com",
        },
      ],
    });

    render(<SyncButton id="salesforce" integrationName="Salesforce" />);
    await user.click(screen.getByRole("button", { name: /sync now/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /approve \& apply \(1\)/i }),
      ).toBeInTheDocument();
    });
  });

  it("should close dialog when cancel is clicked", async () => {
    const user = userEvent.setup();
    (syncIntegration as ReturnType<typeof vi.fn>).mockResolvedValue({
      isApiError: false,
      changes: [
        {
          id: "1",
          field_name: "email",
          change_type: "ADD",
          new_value: "test@test.com",
        },
      ],
    });

    render(<SyncButton id="salesforce" integrationName="Salesforce" />);
    await user.click(screen.getByRole("button", { name: /sync now/i }));

    // Wait for the dialog to open and "Cancel" button to appear
    const cancelBtn = await screen.findByRole("button", { name: /cancel/i });
    await user.click(cancelBtn);

    // Dialog should be gone (or button absent)
    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /approve \& apply/i }),
      ).not.toBeInTheDocument();
    });
  });

  it("should show cancel button", async () => {
    const user = userEvent.setup();
    (syncIntegration as ReturnType<typeof vi.fn>).mockResolvedValue({
      isApiError: false,
      changes: [
        {
          id: "1",
          field_name: "email",
          change_type: "ADD",
          new_value: "test@test.com",
        },
      ],
    });

    render(<SyncButton id="salesforce" integrationName="Salesforce" />);
    await user.click(screen.getByRole("button", { name: /sync now/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /cancel/i }),
      ).toBeInTheDocument();
    });
  });

  // ─── Error handling branches ───────────────────────────────────────

  it("should show config error toast for 400 statusCode", async () => {
    const user = userEvent.setup();
    (syncIntegration as ReturnType<typeof vi.fn>).mockResolvedValue({
      isApiError: true,
      statusCode: 400,
      message: "Bad request",
    });

    render(<SyncButton id="salesforce" integrationName="Salesforce" />);
    await user.click(screen.getByRole("button", { name: /sync now/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Configuration issue: Please check your integration settings.",
      );
    });
  });

  it("should show config error toast for 404 statusCode", async () => {
    const user = userEvent.setup();
    (syncIntegration as ReturnType<typeof vi.fn>).mockResolvedValue({
      isApiError: true,
      statusCode: 404,
      message: "Not found",
    });

    render(<SyncButton id="salesforce" integrationName="Salesforce" />);
    await user.click(screen.getByRole("button", { name: /sync now/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Configuration issue: Please check your integration settings.",
      );
    });
  });

  it("should show server error toast for 500 statusCode", async () => {
    const user = userEvent.setup();
    (syncIntegration as ReturnType<typeof vi.fn>).mockResolvedValue({
      isApiError: true,
      statusCode: 500,
      message: "Internal server error",
    });

    render(<SyncButton id="salesforce" integrationName="Salesforce" />);
    await user.click(screen.getByRole("button", { name: /sync now/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Internal server error. Please try again later.",
      );
    });
  });

  it("should show gateway error toast for 502 statusCode", async () => {
    const user = userEvent.setup();
    (syncIntegration as ReturnType<typeof vi.fn>).mockResolvedValue({
      isApiError: true,
      statusCode: 502,
      message: "Gateway error",
    });

    render(<SyncButton id="salesforce" integrationName="Salesforce" />);
    await user.click(screen.getByRole("button", { name: /sync now/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Gateway error: Integration service is currently unavailable.",
      );
    });
  });

  it("should show generic error toast for other statusCodes", async () => {
    const user = userEvent.setup();
    (syncIntegration as ReturnType<typeof vi.fn>).mockResolvedValue({
      isApiError: true,
      statusCode: 503,
      message: "Service unavailable",
    });

    render(<SyncButton id="salesforce" integrationName="Salesforce" />);
    await user.click(screen.getByRole("button", { name: /sync now/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Service unavailable");
    });
  });

  it('should show "already in sync" toast when changes are empty', async () => {
    const user = userEvent.setup();
    (syncIntegration as ReturnType<typeof vi.fn>).mockResolvedValue({
      isApiError: false,
      changes: [],
    });

    render(<SyncButton id="salesforce" integrationName="Salesforce" />);
    await user.click(screen.getByRole("button", { name: /sync now/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Salesforce is already in sync — no changes to review.",
      );
    });
  });

  it("should show error toast when syncIntegration throws an error", async () => {
    const user = userEvent.setup();
    (syncIntegration as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Network failure"),
    );

    render(<SyncButton id="salesforce" integrationName="Salesforce" />);
    await user.click(screen.getByRole("button", { name: /sync now/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Network failure");
    });
  });

  it("should not show error toast for NEXT_REDIRECT errors", async () => {
    const user = userEvent.setup();
    (syncIntegration as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("NEXT_REDIRECT"),
    );

    render(<SyncButton id="salesforce" integrationName="Salesforce" />);
    await user.click(screen.getByRole("button", { name: /sync now/i }));

    // Wait a tick to ensure the catch handler runs
    await new Promise((r) => setTimeout(r, 100));
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("should call applySyncAction when approve is clicked", async () => {
    const user = userEvent.setup();
    (syncIntegration as ReturnType<typeof vi.fn>).mockResolvedValue({
      isApiError: false,
      changes: [
        {
          id: "1",
          field_name: "email",
          change_type: "ADD",
          new_value: "test@test.com",
        },
      ],
    });
    (applySyncAction as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("NEXT_REDIRECT"),
    );

    render(<SyncButton id="salesforce" integrationName="Salesforce" />);
    await user.click(screen.getByRole("button", { name: /sync now/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /approve/i }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /approve/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Salesforce synced successfully!",
      );
      expect(applySyncAction).toHaveBeenCalledWith(
        "salesforce",
        expect.arrayContaining([expect.objectContaining({ id: "1" })]),
      );
    });
  });

  it("should show error toast when applySyncAction fails", async () => {
    const user = userEvent.setup();
    (syncIntegration as ReturnType<typeof vi.fn>).mockResolvedValue({
      isApiError: false,
      changes: [
        {
          id: "1",
          field_name: "email",
          change_type: "ADD",
          new_value: "test@test.com",
        },
      ],
    });
    (applySyncAction as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Apply failed"),
    );

    render(<SyncButton id="salesforce" integrationName="Salesforce" />);
    await user.click(screen.getByRole("button", { name: /sync now/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /approve/i }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /approve/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Apply failed");
    });
  });
});
