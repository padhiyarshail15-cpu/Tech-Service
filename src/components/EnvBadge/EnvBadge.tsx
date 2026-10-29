import type { AppEnv } from "@/types/env";

export interface EnvBadgeProps {
  env: AppEnv;
}

// Production has no badge, so its label is null
const ENV_BADGE_LABELS: Record<AppEnv, string | null> = {
  development: "DEV",
  test: "TEST",
  uat: "UAT",
  production: null,
};

export function EnvBadge({ env }: EnvBadgeProps) {
  const label = ENV_BADGE_LABELS[env];
  if (label === null) {
    return null;
  }
  return (
    <span className="env-badge" data-env={env}>
      {label}
    </span>
  );
}
