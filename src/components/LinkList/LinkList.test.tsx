import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LinkList } from "@/components/LinkList/LinkList";
import type { ExternalLink } from "@/types/link";

const links: ExternalLink[] = [
  {
    label: "Image link",
    href: "https://example.com/image",
    icon: { kind: "image", src: "/logo.svg", className: "logo" },
  },
  {
    label: "Sprite link",
    href: "https://example.com/sprite",
    icon: { kind: "sprite", id: "github-icon" },
  },
];

describe("LinkList", () => {
  it("renders every link as a safe external link", () => {
    render(<LinkList links={links} />);

    const anchors = screen.getAllByRole("link");
    expect(anchors).toHaveLength(2);
    for (const anchor of anchors) {
      expect(anchor).toHaveAttribute("target", "_blank");
      expect(anchor).toHaveAttribute("rel", "noreferrer");
    }
  });

  it("renders an image icon or a sprite icon based on the link icon kind", () => {
    const { container } = render(<LinkList links={links} />);

    expect(screen.getByRole("link", { name: "Image link" })).toHaveAttribute(
      "href",
      "https://example.com/image",
    );
    expect(container.querySelector("img.logo")).toHaveAttribute(
      "src",
      "/logo.svg",
    );
    expect(container.querySelector("use")).toHaveAttribute(
      "href",
      "/icons.svg#github-icon",
    );
  });
});
