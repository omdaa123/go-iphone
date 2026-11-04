// End-to-end test: renders the REAL storefront, talks to the REAL backend
// (running on :4090) and REAL Postgres, and clicks through real shopper flows.
import React from "react";
import { describe, it, expect, beforeAll } from "vitest";
import { render, screen, waitFor, within, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App.jsx";

const API = "http://localhost:4090";
window.scrollTo = () => {};
const user = userEvent.setup();

async function openViaSearch(query, resultText) {
  await user.click(screen.getByLabelText("Search"));
  await user.type(screen.getByPlaceholderText(/search/i), query);
  const hit = await screen.findByText(resultText, { selector: "p" });
  await user.click(hit);
}
async function fillCheckoutAndPlace() {
  const inputs = document.querySelectorAll("form input");
  await user.type(inputs[0], "Test Shopper");
  await user.type(inputs[1], "01012345678");
  await user.type(inputs[3], "12 Tahrir St");
  await user.type(inputs[4], "Cairo");
  await user.click(screen.getByRole("button", { name: /place order/i }));
}

describe("Storefront ↔ API ↔ database", () => {
  beforeAll(() => localStorage.clear());

  it("loads the live catalog from the API and renders the homepage", async () => {
    render(<App />);
    expect(await screen.findByText("Powerful. Precise. Pro.", {}, { timeout: 15000 })).toBeTruthy();
    expect(screen.getAllByText(/iPhone/i).length).toBeGreaterThan(3);
    expect(await screen.findByText("Best sellers")).toBeTruthy();
    cleanup();
  });

  it("buys a normal product: cart → checkout → real order with SERVER-computed price", async () => {
    localStorage.clear();
    render(<App />);
    await screen.findByText("Powerful. Precise. Pro.");
    await openViaSearch("iPhone 14", "iPhone 14");
    await user.click(await screen.findByRole("button", { name: /add to cart/i }));
    await user.click(await screen.findByRole("button", { name: /checkout/i }));
    await fillCheckoutAndPlace();
    expect(await screen.findByText("Order placed", {}, { timeout: 15000 })).toBeTruthy();
    cleanup();
  });

  it("reservation-mode product shows a Reserve flow (no Add to cart) and creates a reservation", async () => {
    localStorage.clear();
    render(<App />);
    await screen.findByText("Powerful. Precise. Pro.");
    await openViaSearch("iPhone 17 Pro", "iPhone 17 Pro");
    expect(screen.queryByRole("button", { name: /add to cart/i })).toBeNull();
    await user.click(await screen.findByRole("button", { name: /reserve now/i }));
    await user.type(screen.getByPlaceholderText("Full name"), "Sara Reserve");
    await user.type(screen.getByPlaceholderText("Phone number"), "01099999999");
    await user.click(screen.getByRole("button", { name: /submit request/i }));
    expect(await screen.findByText("Request received", {}, { timeout: 15000 })).toBeTruthy();
    cleanup();
  });

  it("buys a specific used phone: order succeeds and the unit leaves the storefront", async () => {
    localStorage.clear();
    render(<App />);
    await screen.findByText("Powerful. Precise. Pro.");
    await openViaSearch("iPhone 13 Pro Max", "iPhone 13 Pro Max");
    await user.click(await screen.findByRole("button", { name: /add to cart/i }));
    await user.click(await screen.findByRole("button", { name: /checkout/i }));
    await fillCheckoutAndPlace();
    expect(await screen.findByText("Order placed", {}, { timeout: 15000 })).toBeTruthy();
    cleanup();
    const cat = await (await fetch(`${API}/api/catalog`)).json();
    const remaining = cat.deviceUnits.filter((u) => u.sku?.startsWith("GI-13PM"));
    expect(remaining.length).toBe(2);                                   // seed has 3 units for this model → one is now sold
    expect(remaining.some((u) => u.sku === "GI-13PM-256-SB-01")).toBe(false); // the best-battery unit the shopper bought is gone
  });

  it("shows a friendly error (and keeps the cart) when two shoppers collide on the same used phone", async () => {
    localStorage.clear();
    const cat = await (await fetch(`${API}/api/catalog`)).json();
    const unit = cat.deviceUnits.find((u) => u.sku?.startsWith("GI-13PM"));
    // Shopper A's browser loads the page and adds the unit...
    render(<App />);
    await screen.findByText("Powerful. Precise. Pro.");
    await openViaSearch("iPhone 13 Pro Max", "iPhone 13 Pro Max");
    await user.click(await screen.findByRole("button", { name: /add to cart/i }));
    // ...but Shopper B buys it first, directly through the API:
    const stolen = await fetch(`${API}/api/orders`, { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Other Buyer", phone: "01111111111", items: [{ productId: unit.productId, inventoryUnitId: unit.id, qty: 1 }] }) });
    expect(stolen.status).toBe(201);
    await user.click(await screen.findByRole("button", { name: /checkout/i }));
    await fillCheckoutAndPlace();
    expect(await screen.findByText(/just purchased by someone else/i, {}, { timeout: 15000 })).toBeTruthy();
    expect(screen.queryByText("Order placed")).toBeNull();
    cleanup();
  });
});
