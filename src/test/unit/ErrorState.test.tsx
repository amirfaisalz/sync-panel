import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorState, getErrorProps } from "@/components/ui/ErrorState";

describe("ErrorState", () => {
  it("should render title and message", () => {
    render(<ErrorState title="Error Title" message="Error message here" />);

    expect(screen.getByText("Error Title")).toBeInTheDocument();
    expect(screen.getByText("Error message here")).toBeInTheDocument();
  });

  it("should render retry button when onRetry is provided", () => {
    render(<ErrorState title="Error" message="msg" onRetry={() => {}} />);

    expect(screen.getByText("Try Again")).toBeInTheDocument();
  });

  it("should not render retry button when onRetry is not provided", () => {
    render(<ErrorState title="Error" message="msg" />);

    expect(screen.queryByText("Try Again")).not.toBeInTheDocument();
  });

  it('should call onRetry when "Try Again" is clicked', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(<ErrorState title="Error" message="msg" onRetry={onRetry} />);
    await user.click(screen.getByText("Try Again"));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should render with "client" type', () => {
    const { container } = render(
      <ErrorState title="Client Error" message="msg" type="client" />,
    );
    expect(container.querySelector(".text-amber-500")).toBeInTheDocument();
  });

  it('should render with "server" type', () => {
    const { container } = render(
      <ErrorState title="Server Error" message="msg" type="server" />,
    );
    expect(container.querySelector(".text-red-500")).toBeInTheDocument();
  });

  it('should render with "gateway" type', () => {
    const { container } = render(
      <ErrorState title="Gateway Error" message="msg" type="gateway" />,
    );
    expect(container.querySelector(".text-orange-500")).toBeInTheDocument();
  });

  it('should default to "generic" type', () => {
    const { container } = render(<ErrorState title="Error" message="msg" />);
    expect(
      container.querySelector(".text-muted-foreground"),
    ).toBeInTheDocument();
  });
});

describe("getErrorProps", () => {
  it('should return config error for "missing configuration" messages', () => {
    const result = getErrorProps(
      "Possible missing configuration. Details: Bad request",
    );
    expect(result.title).toBe("Configuration Error");
    expect(result.type).toBe("client");
  });

  it('should return config error for "Missing" messages', () => {
    const result = getErrorProps("Missing API key");
    expect(result.title).toBe("Configuration Error");
    expect(result.type).toBe("client");
  });

  it('should return gateway error for "Gateway" messages', () => {
    const result = getErrorProps(
      "Gateway error (integration client server down)",
    );
    expect(result.title).toBe("Gateway Error");
    expect(result.type).toBe("gateway");
  });

  it('should return gateway error for lowercase "gateway" messages', () => {
    const result = getErrorProps("Bad gateway response");
    expect(result.title).toBe("Gateway Error");
    expect(result.type).toBe("gateway");
  });

  it('should return server error for "Internal server" messages', () => {
    const result = getErrorProps("Internal server error");
    expect(result.title).toBe("Server Error");
    expect(result.type).toBe("server");
  });

  it('should return server error for "internal" messages', () => {
    const result = getErrorProps("An internal error occurred");
    expect(result.title).toBe("Server Error");
    expect(result.type).toBe("server");
  });

  it("should return generic error for unknown messages", () => {
    const result = getErrorProps("Something unexpected happened");
    expect(result.title).toBe("Something went wrong");
    expect(result.type).toBe("generic");
    expect(result.message).toBe("Something unexpected happened");
  });

  it("should return fallback message for empty string", () => {
    const result = getErrorProps("");
    expect(result.title).toBe("Something went wrong");
    expect(result.message).toBe(
      "An unexpected error occurred. Please try again.",
    );
  });
});
