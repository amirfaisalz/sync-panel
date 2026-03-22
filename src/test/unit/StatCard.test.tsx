import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatCard } from "@/components/integrations/StatCard";
import React from "react";

describe("StatCard", () => {
  it("should render the label", () => {
    render(
      <StatCard icon={<span>📊</span>} label="Total Records" value={1000} />,
    );
    expect(screen.getByText("Total Records")).toBeInTheDocument();
  });

  it("should render a numeric value", () => {
    render(<StatCard icon={<span>📊</span>} label="Count" value={42} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("should render a string value", () => {
    render(<StatCard icon={<span>⏱️</span>} label="Duration" value="45s" />);
    expect(screen.getByText("45s")).toBeInTheDocument();
  });

  it("should render the icon", () => {
    render(
      <StatCard
        icon={<span data-testid="icon">📊</span>}
        label="Label"
        value="val"
      />,
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("should render subtext when provided", () => {
    render(
      <StatCard
        icon={<span>📅</span>}
        label="Last Synced"
        value="14:30"
        subtext="Mar 15, 2026"
      />,
    );
    expect(screen.getByText("Mar 15, 2026")).toBeInTheDocument();
  });

  it("should not render subtext when not provided", () => {
    const { container } = render(
      <StatCard icon={<span>📊</span>} label="Count" value={10} />,
    );
    // The subtext element has text-xs text-muted-foreground mt-1 classes
    const subtextElements = container.querySelectorAll(".mt-1");
    expect(subtextElements).toHaveLength(0);
  });
});
