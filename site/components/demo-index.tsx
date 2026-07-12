"use client";

import { motion } from "framer-motion";
import { indexEntries } from "@/lib/content";
import { DEMO_PREVIEWS } from "@/components/demo-previews";

export function DemoIndex() {
  return (
    <section id="index" className="border-b border-hairline px-6 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-edit">
        <div className="mb-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 className="font-grotesk text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            Inside the workspace
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-ink-muted">
            Six surfaces, one app. Each one shipped because a real day needed
            it — not because a roadmap had a slot open.
          </p>
        </div>

        <div role="list" className="border-t border-ink">
          {indexEntries.map((entry, i) => {
            const Preview = DEMO_PREVIEWS[entry.name];
            return (
              <motion.div
                key={entry.number}
                role="listitem"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="group grid grid-cols-1 items-start gap-x-6 gap-y-4 border-b border-hairline py-7 transition-colors duration-200 hover:bg-paper-dim md:grid-cols-12 md:gap-y-0 md:py-8"
              >
                <span className="font-serif text-lg italic text-ink-faint md:col-span-1">
                  {entry.number}
                </span>

                <div className="md:col-span-6">
                  <h3 className="font-grotesk text-xl font-semibold text-ink transition-transform duration-200 md:group-hover:translate-x-1">
                    {entry.name}
                  </h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.1em] text-ink-faint">
                    {entry.category}
                  </p>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
                    {entry.description}
                  </p>
                </div>

                <div className="md:col-span-5">
                  {Preview && (
                    <div className="h-[130px] overflow-hidden border border-hairline bg-paper-dim">
                      <Preview />
                    </div>
                  )}
                  <p className="mt-2 text-xs font-medium text-ink">{entry.outcome}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
