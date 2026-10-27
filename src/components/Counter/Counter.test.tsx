import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Counter } from "@/components/Counter/Counter";

describe("Counter", () => {
  it("renders the initial count", () => {
    render(<Counter initialValue={3} />);
    expect(screen.getByRole("button")).toHaveTextContent("Count is 3");
  });

  it("increments when clicked", async () => {
    const user = userEvent.setup();
    render(<Counter />);

    await user.click(screen.getByRole("button", { name: "Count is 0" }));

    expect(screen.getByRole("button")).toHaveTextContent("Count is 1");
  });
});
