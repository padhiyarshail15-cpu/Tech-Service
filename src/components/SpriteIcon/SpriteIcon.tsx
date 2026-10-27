interface SpriteIconProps {
  id: string;
  className: string;
}

/** Decorative icon from the SVG sprite in public/icons.svg. */
export function SpriteIcon({ id, className }: SpriteIconProps) {
  return (
    <svg className={className} role="presentation" aria-hidden="true">
      <use href={`/icons.svg#${id}`} />
    </svg>
  );
}
