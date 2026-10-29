import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EnvBadge } from "@/components/EnvBadge/EnvBadge";
import type { AppEnv } from "@/types/env";

describe("EnvBadge", () => {
  it.each<[AppEnv, string]>([
    ["development", "DEV"],
    ["test", "TEST"],
    ["uat", "UAT"],
  ])("shows the label for %s", (env, label) => {
    render(<EnvBadge env={env} />);

    expect(screen.getByText(label)).toHaveAttribute("data-env", env);
  });

  it("renders nothing in production", () => {
    const { container } = render(<EnvBadge env="production" />);

    expect(container).toBeEmptyDOMElement();
  });
});
