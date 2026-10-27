import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "left" | "right" | "none";

const offset: Record<Direction, { x: string; y: string }> = {
  up: { x: "0px", y: "28px" },
  down: { x: "0px", y: "-28px" },
  left: { x: "28px", y: "0px" },
  right: { x: "-28px", y: "0px" },
  none: { x: "0px", y: "0px" },
};

/**
 * Scroll-triggered reveal — the single primitive every section uses.
 *
 * Driven by a CSS view timeline (`.reveal` in globals.css), so it needs no
 * JavaScript and the content is never hidden: browsers without scroll-driven
 * animations, and visitors who prefer reduced motion, simply see it in place.
 * `delay` (seconds, as before) staggers siblings by pushing back where in the
 * entry range each one starts.
 */
export function Reveal({
  children,
  className,
  direction = "up",
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  direction?: Direction;
  delay?: number;
  as?: "div" | "span" | "li" | "section";
}) {
  return (
    <Tag
      className={cn("reveal", className)}
      style={
        {
          "--reveal-x": offset[direction].x,
          "--reveal-y": offset[direction].y,
          "--reveal-delay": delay,
        } as React.CSSProperties
      }
    >
      {children}
    </Tag>
  );
}
