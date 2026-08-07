import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import App from "./App.jsx";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";

describe("App (smoke)", () => {
  it("renders the MyMTN shell without crashing", () => {
    render(<App />);
    // Tab bar is the persistent chrome.
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("MoMo")).toBeInTheDocument();
  });

  it("has no structural axe violations on first paint", async () => {
    const { container } = render(<App />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("ErrorBoundary", () => {
  it("shows a recoverable fallback instead of a blank screen", () => {
    const Boom = () => {
      throw new Error("boom");
    };
    // Silence the expected React error log for this render.
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/something went wrong/i);
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
    spy.mockRestore();
  });
});
