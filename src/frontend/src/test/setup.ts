import "@testing-library/jest-dom/vitest";
import { configure } from "@testing-library/react";

// Generated components expose `data-ocid` hooks; treat them as test ids so
// semantic queries can target them without relying on CSS classes.
configure({ testIdAttribute: "data-ocid" });

// recharts' ResponsiveContainer observes its host element; jsdom has no
// ResizeObserver, so provide a no-op implementation.
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = globalThis.ResizeObserver ?? ResizeObserverMock;
