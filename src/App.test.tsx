import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "@/App";
import { DOC_LINKS, SOCIAL_LINKS } from "@/constants/links";

describe("App", () => {
  it("renders the main heading and counter", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Get started Test" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Count is 0" }),
    ).toBeInTheDocument();
  });

  it("renders all documentation and social links", () => {
    render(<App />);

    expect(screen.getAllByRole("link")).toHaveLength(
      DOC_LINKS.length + SOCIAL_LINKS.length,
    );
  });

  it("shows which environment the app is running in", () => {
    render(<App />);

    expect(screen.getByText(/Environment:/)).toHaveTextContent(
      "Environment: test",
    );
  });
});
