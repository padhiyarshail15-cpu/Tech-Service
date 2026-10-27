import reactLogo from "@/assets/react.svg";
import viteLogo from "@/assets/vite.svg";
import type { ExternalLink } from "@/types/link";

export const DOC_LINKS: readonly ExternalLink[] = [
  {
    label: "Explore Vite",
    href: "https://vite.dev/",
    icon: { kind: "image", src: viteLogo, className: "logo" },
  },
  {
    label: "Learn more",
    href: "https://react.dev/",
    icon: { kind: "image", src: reactLogo, className: "button-icon" },
  },
];

export const SOCIAL_LINKS: readonly ExternalLink[] = [
  {
    label: "GitHub",
    href: "https://github.com/vitejs/vite",
    icon: { kind: "sprite", id: "github-icon" },
  },
  {
    label: "Discord",
    href: "https://chat.vite.dev/",
    icon: { kind: "sprite", id: "discord-icon" },
  },
  {
    label: "X.com",
    href: "https://x.com/vite_js",
    icon: { kind: "sprite", id: "x-icon" },
  },
  {
    label: "Bluesky",
    href: "https://bsky.app/profile/vite.dev",
    icon: { kind: "sprite", id: "bluesky-icon" },
  },
];
