import { Link } from "react-router-dom";

export function EmptyState({ message, href, action }) {
  return (
    <div className="border border-hairline bg-paper-dim px-6 py-12 text-center">
      <p className="mx-auto max-w-sm text-sm leading-relaxed text-ink-muted">{message}</p>
      {href && action && (
        <Link
          to={href}
          className="mt-4 inline-flex items-center border border-accent px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-accent hover:text-accent-fg"
        >
          {action}
        </Link>
      )}
    </div>
  );
}
