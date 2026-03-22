import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { IntegrationIcon } from "@/components/integrations/IntegrationIcon";
import type { ApplicationID } from "@/types/sync";

const knownIcons: { id: ApplicationID; emoji: string }[] = [
  { id: "salesforce", emoji: "☁️" },
  { id: "hubspot", emoji: "🎯" },
  { id: "stripe", emoji: "💳" },
  { id: "slack", emoji: "💬" },
  { id: "zendesk", emoji: "🎫" },
  { id: "intercom", emoji: "💡" },
];

describe("IntegrationIcon", () => {
  it.each(knownIcons)(
    'should render "$emoji" emoji for $id',
    ({ id, emoji }) => {
      render(<IntegrationIcon id={id} />);
      expect(screen.getByText(emoji)).toBeInTheDocument();
    },
  );

  it('should apply small size classes when size is "sm"', () => {
    const { container } = render(<IntegrationIcon id="salesforce" size="sm" />);
    const div = container.firstElementChild!;
    expect(div.className).toContain("w-8");
    expect(div.className).toContain("h-8");
  });

  it('should apply medium size classes when size is "md"', () => {
    const { container } = render(<IntegrationIcon id="salesforce" size="md" />);
    const div = container.firstElementChild!;
    expect(div.className).toContain("w-10");
    expect(div.className).toContain("h-10");
  });

  it('should apply large size classes when size is "lg"', () => {
    const { container } = render(<IntegrationIcon id="salesforce" size="lg" />);
    const div = container.firstElementChild!;
    expect(div.className).toContain("w-14");
    expect(div.className).toContain("h-14");
  });

  it("should default to md size when no size prop is given", () => {
    const { container } = render(<IntegrationIcon id="stripe" />);
    const div = container.firstElementChild!;
    expect(div.className).toContain("w-10");
    expect(div.className).toContain("h-10");
  });

  it("should apply integration-specific background class", () => {
    const { container } = render(<IntegrationIcon id="salesforce" />);
    const div = container.firstElementChild!;
    expect(div.className).toContain("bg-sky-100");
  });
});
