import { SpriteIcon } from "@/components/SpriteIcon/SpriteIcon";
import type { ExternalLink, LinkIcon } from "@/types/link";

interface LinkListProps {
  links: readonly ExternalLink[];
}

function Icon({ icon }: { icon: LinkIcon }) {
  if (icon.kind === "image") {
    return <img className={icon.className} src={icon.src} alt="" />;
  }
  return <SpriteIcon id={icon.id} className="button-icon" />;
}

export function LinkList({ links }: LinkListProps) {
  return (
    <ul>
      {links.map((link) => (
        <li key={link.href}>
          <a href={link.href} target="_blank" rel="noreferrer">
            <Icon icon={link.icon} />
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
