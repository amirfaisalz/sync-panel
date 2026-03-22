import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HistoryTable } from "@/components/integrations/hystory/HistoryTable";
import type { SyncHistoryEvent } from "@/types/sync";

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

const mockEvents: SyncHistoryEvent[] = [
  {
    id: "evt-1",
    timestamp: "2026-03-02T07:15:00Z",
    source: "system",
    version: "v2.4.1",
    summary: "Scheduled sync completed — 3 records updated",
    changes: [
      {
        id: "c1",
        fieldName: "user.email",
        changeType: "UPDATE",
        previousValue: "old@test.com",
        newValue: "new@test.com",
      },
    ],
    stats: { added: 0, updated: 3, deleted: 0, total: 3 },
  },
  {
    id: "evt-2",
    timestamp: "2026-02-28T14:30:00Z",
    source: "external",
    version: "v2.4.0",
    summary: "Conflicts resolved — 2 fields merged",
    changes: [],
    stats: { added: 0, updated: 2, deleted: 0, total: 2 },
  },
];

describe("HistoryTable", () => {
  it("should render table headers", () => {
    render(<HistoryTable events={mockEvents} />);

    expect(screen.getByText("TIMESTAMP")).toBeInTheDocument();
    expect(screen.getByText("SOURCE")).toBeInTheDocument();
    expect(screen.getByText("VERSION")).toBeInTheDocument();
    expect(screen.getByText("SUMMARY")).toBeInTheDocument();
    expect(screen.getByText("ACTIONS")).toBeInTheDocument();
  });

  it("should render event summaries", () => {
    render(<HistoryTable events={mockEvents} />);

    expect(
      screen.getByText("Scheduled sync completed — 3 records updated"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Conflicts resolved — 2 fields merged"),
    ).toBeInTheDocument();
  });

  it("should render event versions", () => {
    render(<HistoryTable events={mockEvents} />);

    expect(screen.getByText("v2.4.1")).toBeInTheDocument();
    expect(screen.getByText("v2.4.0")).toBeInTheDocument();
  });

  it("should render source badges", () => {
    render(<HistoryTable events={mockEvents} />);

    expect(screen.getByText("system")).toBeInTheDocument();
    expect(screen.getByText("external")).toBeInTheDocument();
  });

  it('should render "View Changes" links', () => {
    render(<HistoryTable events={mockEvents} />);

    const viewLinks = screen.getAllByText("View Changes");
    expect(viewLinks).toHaveLength(2);
  });

  it("should show empty state when no events", () => {
    render(<HistoryTable events={[]} />);

    expect(screen.getByText("No sync history available.")).toBeInTheDocument();
  });

  it("should expand to show details when row is clicked", async () => {
    const user = userEvent.setup();
    render(<HistoryTable events={mockEvents} />);

    // Details should not be visible initially
    expect(screen.queryByText("Details:")).not.toBeInTheDocument();

    // Click the first row (the summary text)
    await user.click(
      screen.getByText("Scheduled sync completed — 3 records updated"),
    );

    expect(screen.getByText("Details:")).toBeInTheDocument();
    expect(screen.getByText("Updated 3 records")).toBeInTheDocument();
  });

  it("should show conflict detail text for conflict events", async () => {
    const user = userEvent.setup();
    render(<HistoryTable events={mockEvents} />);

    // Click the conflict event row
    await user.click(screen.getByText("Conflicts resolved — 2 fields merged"));

    expect(
      screen.getByText("Field mismatch in contact records"),
    ).toBeInTheDocument();
  });

  it("should collapse details when row is clicked again", async () => {
    const user = userEvent.setup();
    render(<HistoryTable events={mockEvents} />);

    // Expand
    await user.click(
      screen.getByText("Scheduled sync completed — 3 records updated"),
    );
    expect(screen.getByText("Details:")).toBeInTheDocument();

    // Collapse
    await user.click(
      screen.getByText("Scheduled sync completed — 3 records updated"),
    );
    expect(screen.queryByText("Details:")).not.toBeInTheDocument();
  });

  it("should render formatted timestamp", () => {
    render(<HistoryTable events={mockEvents} />);

    // The formatDateTime function produces "Mar 2, 2026 HH:MM:SS" in some locale
    // We just check part of it is present
    expect(screen.getByText(/Mar 2, 2026/)).toBeInTheDocument();
  });

  it("should not expand row when 'View Changes' link is clicked", async () => {
    const user = userEvent.setup();
    render(<HistoryTable events={mockEvents} />);

    // Click the "View Changes" link (has stopPropagation)
    const viewLinks = screen.getAllByText("View Changes");
    await user.click(viewLinks[0]);

    // The row should NOT have expanded because the link calls stopPropagation
    expect(screen.queryByText("Details:")).not.toBeInTheDocument();
  });
});
