import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EnvText } from "@/components/EnvText/EnvText";
import type { AppEnv } from "@/types/env";

describe("EnvText", () => {
  it.each<AppEnv>(["development", "test", "uat", "production"])(
    "shows the %s environment",
    (env) => {
      render(<EnvText env={env} />);

      expect(screen.getByText(/Environment:/)).toHaveTextContent(
        `Environment: ${env}`,
      );
    },
  );
});
