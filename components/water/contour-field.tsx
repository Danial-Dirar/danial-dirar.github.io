import { CONTOURS, CONTOUR_VIEWBOX } from "@/lib/data/contours";

/** Faint topographic contours behind a section — survey-map texture. */
export function ContourField() {
  return (
    <div className="contour-field" aria-hidden="true">
      <svg
        viewBox={CONTOUR_VIEWBOX}
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
      >
        {CONTOURS.map((c, i) => (
          <path key={i} d={c.d} data-index={c.index} />
        ))}
      </svg>
    </div>
  );
}
