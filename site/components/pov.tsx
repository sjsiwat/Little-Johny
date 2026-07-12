import { pointOfView } from "@/lib/content";

export function PointOfView() {
  return (
    <section
      id="pov"
      className="border-b border-hairline bg-ink px-6 py-24 text-paper md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-edit">
        <p className="mb-8 text-xs font-semibold uppercase tracking-[0.18em] text-paper/50">
          Point of view
        </p>
        <p className="max-w-4xl font-serif text-3xl italic leading-tight sm:text-4xl md:text-5xl">
          {pointOfView}
        </p>
      </div>
    </section>
  );
}
