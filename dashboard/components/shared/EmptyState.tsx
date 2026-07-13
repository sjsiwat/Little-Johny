import Link from "next/link";

interface EmptyStateProps {
  message: string;
  href?: string;
  action?: string;
}

export function EmptyState({ message, href, action }: EmptyStateProps) {
  return (
    <div className="border border-hairline bg-paper-dim px-6 py-12 text-center dark:border-white/10 dark:bg-dark-surface-soft">
      <p className="mx-auto max-w-sm text-sm leading-relaxed text-ink-muted">{message}</p>
      {href && action && (
        <Link
          href={href}
          className="mt-4 inline-flex items-center border border-ink px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-paper dark:border-white/30 dark:text-white/90 dark:hover:bg-white dark:hover:text-dark-bg"
        >
          {action}
        </Link>
      )}
    </div>
  );
}
