import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import { PinGate } from "./PinGate.jsx";

describe("PinGate", () => {
  it("exposes an accessible modal dialog", () => {
    render(<PinGate lang="en" onDone={() => {}} onCancel={() => {}} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleName(/pin/i);
  });

  it("has labelled digit buttons operable by mouse", async () => {
    const onDone = vi.fn();
    render(<PinGate lang="en" onDone={onDone} onCancel={() => {}} />);
    for (const d of ["1", "2", "3", "4"]) {
      fireEvent.click(screen.getByRole("button", { name: d }));
    }
    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1), { timeout: 1000 });
  });

  it("accepts a physical keyboard (digits complete the PIN)", async () => {
    const onDone = vi.fn();
    render(<PinGate lang="en" onDone={onDone} onCancel={() => {}} />);
    for (const d of ["1", "2", "3", "4"]) {
      fireEvent.keyDown(document, { key: d });
    }
    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1), { timeout: 1000 });
  });

  it("cancels on Escape and via the Cancel button", () => {
    const onCancel = vi.fn();
    render(<PinGate lang="en" onDone={() => {}} onCancel={onCancel} />);
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(2);
  });

  it("has no axe accessibility violations", async () => {
    const { container } = render(<PinGate lang="en" onDone={() => {}} onCancel={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
