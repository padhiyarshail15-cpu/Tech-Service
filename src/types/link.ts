export type LinkIcon =
  | { kind: "image"; src: string; className: string }
  | { kind: "sprite"; id: string };

export interface ExternalLink {
  label: string;
  href: string;
  icon: LinkIcon;
}
