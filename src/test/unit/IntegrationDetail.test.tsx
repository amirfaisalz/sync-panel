import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { IntegrationDetail } from "@/components/integrations/IntegrationDetail";
import type { Integration } from "@/types/sync";

// Mock next/link to render as a simple anchor
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock SyncButton (it uses server actions which can't run in unit tests)
vi.mock("@/components/sync/SyncButton", () => ({
  SyncButton: ({
    integrationName,
  }: {
    id: string;
    integrationName: string;
  }) => <button>Sync {integrationName}</button>,
}));

const syncedIntegration: Integration = {
  id: "salesforce",
  name: "Salesforce",
  status: "synced",
  lastSyncedAt: "2026-03-15T14:30:00Z",
  version: "v2.4.1",
  totalRecords: 12453,
  lastSyncDuration: "45s",
};

const conflictIntegration: Integration = {
  id: "hubspot",
  name: "HubSpot",
  status: "conflict",
  lastSyncedAt: "2026-03-15T10:00:00Z",
  version: "v1.8.3",
  totalRecords: 8921,
  lastSyncDuration: "32s",
};

describe("IntegrationDetail", () => {
  it("should render the integration name as a heading", () => {
    render(<IntegrationDetail integration={syncedIntegration} />);
    expect(
      screen.getByRole("heading", { name: /salesforce/i }),
    ).toBeInTheDocument();
  });

  it("should render the version number", () => {
    render(<IntegrationDetail integration={syncedIntegration} />);
    // Version appears in both the header and Sync Summary
    const versionElements = screen.getAllByText("v2.4.1");
    expect(versionElements.length).toBeGreaterThanOrEqual(1);
  });

  it("should render the StatusBadge with correct status", () => {
    render(<IntegrationDetail integration={syncedIntegration} />);
    // StatusBadge renders "Synced" for 'synced' status
    expect(screen.getAllByText("Synced").length).toBeGreaterThanOrEqual(1);
  });

  it("should render stat cards", () => {
    render(<IntegrationDetail integration={syncedIntegration} />);
    expect(screen.getByText("Total Records")).toBeInTheDocument();
    expect(screen.getByText("Last Sync Duration")).toBeInTheDocument();
    expect(screen.getByText("Last Synced")).toBeInTheDocument();
  });

  it("should render formatted total records", () => {
    render(<IntegrationDetail integration={syncedIntegration} />);
    // 12453 formatted with toLocaleString()
    expect(screen.getByText("12,453")).toBeInTheDocument();
  });

  it("should render last sync duration", () => {
    render(<IntegrationDetail integration={syncedIntegration} />);
    expect(screen.getByText("45s")).toBeInTheDocument();
  });

  it('should render "View History" link', () => {
    render(<IntegrationDetail integration={syncedIntegration} />);
    const link = screen.getByText("View History");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute(
      "href",
      "/integrations/salesforce/history",
    );
  });

  it('should show conflict alert when status is "conflict"', () => {
    render(<IntegrationDetail integration={conflictIntegration} />);
    expect(screen.getByText("Conflict Detected")).toBeInTheDocument();
    expect(screen.getByText(/conflicting data/)).toBeInTheDocument();
  });

  it('should show "Resolve Conflicts" link in conflict alert', () => {
    render(<IntegrationDetail integration={conflictIntegration} />);
    const resolveLink = screen.getByText("Resolve Conflicts →");
    expect(resolveLink.closest("a")).toHaveAttribute(
      "href",
      "/integrations/hubspot/conflicts",
    );
  });

  it('should NOT show conflict alert when status is not "conflict"', () => {
    render(<IntegrationDetail integration={syncedIntegration} />);
    expect(screen.queryByText("Conflict Detected")).not.toBeInTheDocument();
  });

  it('should show "Resolve Conflicts" quick action only for conflict status', () => {
    const { rerender } = render(
      <IntegrationDetail integration={syncedIntegration} />,
    );

    // For synced — no "Resolve Conflicts" quick action link
    const resolveLinks = screen.queryAllByText(/Resolve Conflicts/);
    const quickActionResolve = resolveLinks.filter((el) =>
      el.closest("a")?.getAttribute("href")?.includes("/conflicts"),
    );
    // Only the alert link would exist; for synced there should be none
    expect(quickActionResolve).toHaveLength(0);

    // For conflict — both alert and quick action
    rerender(<IntegrationDetail integration={conflictIntegration} />);
    const conflictLinks = screen.getAllByText(/Resolve Conflicts/);
    expect(conflictLinks.length).toBeGreaterThanOrEqual(2); // alert + quick action
  });

  it("should render the Sync Summary section", () => {
    render(<IntegrationDetail integration={syncedIntegration} />);
    expect(screen.getByText("Sync Summary")).toBeInTheDocument();
    expect(screen.getByText("Integration Name")).toBeInTheDocument();
    expect(screen.getByText("Current Status")).toBeInTheDocument();
    expect(screen.getByText("Current Version")).toBeInTheDocument();
    expect(screen.getByText("Last Sync")).toBeInTheDocument();
  });
});
