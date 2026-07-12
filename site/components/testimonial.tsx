import { testimonial } from "@/lib/content";

export function Testimonial() {
  return (
    <section className="border-b border-hairline px-6 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-edit">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <p className="font-grotesk text-xs font-semibold uppercase tracking-[0.18em] text-ink-faint md:col-span-3">
            From the developer
          </p>
          <div className="md:col-span-8 md:col-start-4">
            <p className="max-w-2xl font-grotesk text-2xl leading-snug text-ink md:text-3xl">
              &ldquo;{testimonial.quote}&rdquo;
            </p>
            <p className="mt-6 text-sm text-ink-muted">
              <span className="font-semibold text-ink">{testimonial.name}</span>
              {" — "}
              {testimonial.role}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
