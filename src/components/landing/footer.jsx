import { footer } from "@/lib/content";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="px-6 py-14 md:px-10">
      <div className="mx-auto flex max-w-edit flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-grotesk text-lg font-semibold text-ink">{footer.company}</p>
          <p className="mt-2 max-w-[26ch] text-sm text-ink-muted">{footer.note}</p>
        </div>

        <div className="grid grid-cols-2 gap-x-10 gap-y-6 text-sm md:flex md:gap-16">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
              Contact
            </p>
            <a
              href={`mailto:${footer.email}`}
              className="text-ink underline decoration-hairline underline-offset-4 hover:decoration-accent"
            >
              {footer.email}
            </a>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
              Social
            </p>
            <div className="flex flex-col gap-1.5">
              <a
                href={footer.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink underline decoration-hairline underline-offset-4 hover:decoration-accent"
              >
                LinkedIn
              </a>
              <a
                href={footer.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink underline decoration-hairline underline-offset-4 hover:decoration-accent"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-14 max-w-edit border-t border-hairline pt-6 text-xs text-ink-faint">
        © {year} {footer.company}. All rights reserved.
      </div>
    </footer>
  );
}
