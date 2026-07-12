import { ArrowUpRight } from "lucide-react";
import { finalCta, appUrl } from "@/lib/content";

export function FinalCta() {
  return (
    <section id="final-cta" className="border-b border-hairline px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto flex max-w-edit flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="max-w-xl font-grotesk text-4xl font-semibold tracking-tight text-ink md:text-6xl">
            {finalCta.heading}
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-muted">
            {finalCta.body}
          </p>
        </div>

        <a
          href={appUrl}
          className="group inline-flex shrink-0 items-center gap-3 border border-ink bg-ink px-7 py-4 text-sm font-medium text-paper transition-colors duration-200 hover:bg-accent hover:border-accent"
        >
          {finalCta.action}
          <ArrowUpRight
            size={16}
            aria-hidden
            className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </a>
      </div>
    </section>
  );
}
