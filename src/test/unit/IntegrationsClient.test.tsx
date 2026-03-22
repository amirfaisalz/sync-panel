import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IntegrationsClient } from "@/components/integrations/IntegrationsClient";
import type { Integration } from "@/types/sync";

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

const mockIntegrations: Integration[] = [
  {
    id: "salesforce",
    name: "Salesforce",
    status: "synced",
    lastSyncedAt: "2026-03-02T07:15:00Z",
    version: "v2.4.1",
    totalRecords: 12453,
    lastSyncDuration: "45s",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    status: "conflict",
    lastSyncedAt: "2026-03-02T07:15:00Z",
    version: "v1.8.3",
    totalRecords: 8921,
    lastSyncDuration: "32s",
  },
  {
    id: "stripe",
    name: "Stripe",
    status: "syncing",
    lastSyncedAt: "2026-03-02T07:15:00Z",
    version: "v3.1.0",
    totalRecords: 34102,
    lastSyncDuration: "1m 12s",
  },
];

describe("IntegrationsClient", () => {
  it("should render all integrations in the table", () => {
    render(<IntegrationsClient integrations={mockIntegrations} />);

    expect(screen.getByText("Salesforce")).toBeInTheDocument();
    expect(screen.getByText("HubSpot")).toBeInTheDocument();
    expect(screen.getByText("Stripe")).toBeInTheDocument();
  });

  it("should render table headers", () => {
    render(<IntegrationsClient integrations={mockIntegrations} />);

    expect(screen.getByText("Integration")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Last Synced")).toBeInTheDocument();
    expect(screen.getByText("Version")).toBeInTheDocument();
  });

  it("should render version badges for each integration", () => {
    render(<IntegrationsClient integrations={mockIntegrations} />);

    expect(screen.getByText("v2.4.1")).toBeInTheDocument();
    expect(screen.getByText("v1.8.3")).toBeInTheDocument();
    expect(screen.getByText("v3.1.0")).toBeInTheDocument();
  });

  it("should render status badges", () => {
    render(<IntegrationsClient integrations={mockIntegrations} />);

    // Status text may appear in both the filter dropdown options and the badges
    expect(screen.getAllByText("Synced").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Conflict").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Syncing").length).toBeGreaterThanOrEqual(1);
  });

  it("should render links to integration detail pages", () => {
    render(<IntegrationsClient integrations={mockIntegrations} />);

    const salesforceLink = screen.getByText("Salesforce").closest("a");
    expect(salesforceLink).toHaveAttribute("href", "/integrations/salesforce");

    const hubspotLink = screen.getByText("HubSpot").closest("a");
    expect(hubspotLink).toHaveAttribute("href", "/integrations/hubspot");
  });

  it("should filter integrations by search text", async () => {
    const user = userEvent.setup();
    render(<IntegrationsClient integrations={mockIntegrations} />);

    const searchInput = screen.getByPlaceholderText("Search integrations...");
    await user.type(searchInput, "sales");

    expect(screen.getByText("Salesforce")).toBeInTheDocument();
    expect(screen.queryByText("HubSpot")).not.toBeInTheDocument();
    expect(screen.queryByText("Stripe")).not.toBeInTheDocument();
  });

  it("should be case-insensitive when searching", async () => {
    const user = userEvent.setup();
    render(<IntegrationsClient integrations={mockIntegrations} />);

    const searchInput = screen.getByPlaceholderText("Search integrations...");
    await user.type(searchInput, "HUBSPOT");

    expect(screen.getByText("HubSpot")).toBeInTheDocument();
    expect(screen.queryByText("Salesforce")).not.toBeInTheDocument();
  });

  it("should filter integrations by status", async () => {
    const user = userEvent.setup();
    render(<IntegrationsClient integrations={mockIntegrations} />);

    const statusSelect = screen.getByDisplayValue("All Status");
    await user.selectOptions(statusSelect, "conflict");

    expect(screen.getByText("HubSpot")).toBeInTheDocument();
    expect(screen.queryByText("Salesforce")).not.toBeInTheDocument();
    expect(screen.queryByText("Stripe")).not.toBeInTheDocument();
  });

  it('should show "No integrations found" when filter matches nothing', async () => {
    const user = userEvent.setup();
    render(<IntegrationsClient integrations={mockIntegrations} />);

    const searchInput = screen.getByPlaceholderText("Search integrations...");
    await user.type(searchInput, "zzz_nonexistent");

    expect(screen.getByText("No integrations found.")).toBeInTheDocument();
  });

  it("should show all integrations when filter is cleared", async () => {
    const user = userEvent.setup();
    render(<IntegrationsClient integrations={mockIntegrations} />);

    const searchInput = screen.getByPlaceholderText("Search integrations...");
    await user.type(searchInput, "sales");
    expect(screen.queryByText("HubSpot")).not.toBeInTheDocument();

    await user.clear(searchInput);
    expect(screen.getByText("Salesforce")).toBeInTheDocument();
    expect(screen.getByText("HubSpot")).toBeInTheDocument();
    expect(screen.getByText("Stripe")).toBeInTheDocument();
  });

  it("should render search input and status filter", () => {
    render(<IntegrationsClient integrations={mockIntegrations} />);

    expect(
      screen.getByPlaceholderText("Search integrations..."),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("All Status")).toBeInTheDocument();
  });

  it("should handle empty integrations array", () => {
    render(<IntegrationsClient integrations={[]} />);

    expect(screen.getByText("No integrations found.")).toBeInTheDocument();
  });
});
