import { test, expect } from "@playwright/test";

// These run against the rule-based English path (VITE_VOICE_ENABLED=false), so
// they need no provider keys and are deterministic offline.

test("first run → pick language → buy airtime → confirm → PIN gate", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Home")).toBeVisible();

  // Open the assistant via the floating action button.
  await page.getByRole("button", { name: /Zigi voice assistant/i }).click();

  // First run shows the language picker.
  await page.getByRole("button", { name: /English/i }).click();

  // Type a full request and submit with the keyboard.
  const input = page.getByPlaceholder(/say what you want/i);
  await input.fill("buy me 5 cedis airtime for myself");
  await input.press("Enter");

  // Zigi reads the order back and asks to confirm.
  await expect(page.getByText(/please confirm/i)).toBeVisible();
  await page.getByRole("button", { name: /^Yes$/ }).click();

  // Confirmation hands off to the PIN gate (a labelled modal dialog).
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("keyboard-only: the assistant FAB is focusable and operable", async ({ page }) => {
  await page.goto("/");
  const fab = page.getByRole("button", { name: /Zigi voice assistant/i });
  await fab.focus();
  await expect(fab).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: /English/i })).toBeVisible();
});
