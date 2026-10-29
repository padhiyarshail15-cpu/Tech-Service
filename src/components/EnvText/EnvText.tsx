import type { AppEnv } from "@/types/env";

export interface EnvTextProps {
  env: AppEnv;
}

export function EnvText({ env }: EnvTextProps) {
  return (
    <p className="env-text" data-env={env}>
      Environment: <strong>{env}</strong>
    </p>
  );
}
