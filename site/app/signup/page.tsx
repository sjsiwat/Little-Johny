import { ArrowUpRight } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { signup, signupAppUrl, appUrl } from "@/lib/content";

export default function Signup() {
  return (
    <main>
      <Nav />
      <section className="border-b border-hairline px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-edit">
          <p className="mb-6 font-grotesk text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Get started
          </p>
          <h1 className="max-w-xl font-grotesk text-4xl font-semibold tracking-tight text-ink md:text-6xl">
            {signup.heading}
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-muted">
            {signup.body}
          </p>

          <a
            href={signupAppUrl}
            className="group mt-10 inline-flex shrink-0 items-center gap-3 border border-ink bg-ink px-7 py-4 text-sm font-medium text-paper transition-colors duration-200 hover:bg-accent hover:border-accent"
          >
            {signup.action}
            <ArrowUpRight
              size={16}
              aria-hidden
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>

          <p className="mt-6 text-sm text-ink-muted">
            Already have an account?{" "}
            <a
              href={appUrl}
              className="text-ink underline decoration-hairline underline-offset-4 hover:decoration-accent"
            >
              Log in instead
            </a>
            .
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
