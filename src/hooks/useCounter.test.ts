import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useCounter } from "@/hooks/useCounter";

describe("useCounter", () => {
  it("starts at 0 by default", () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it("starts at the given initial value", () => {
    const { result } = renderHook(() => useCounter(5));
    expect(result.current.count).toBe(5);
  });

  it("increments the count", () => {
    const { result } = renderHook(() => useCounter());
    act(() => result.current.increment());
    act(() => result.current.increment());
    expect(result.current.count).toBe(2);
  });
});
