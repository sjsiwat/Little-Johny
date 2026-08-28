import { useEffect } from "react";

// Replaces Next's per-route `metadata.title`. Static export gave each route its
// own <title>; in a SPA we set it on mount instead.
//
// Pass null to opt out — AppLayout uses that so an authenticated page's own
// title wins (child effects run before the parent's).
export function useDocumentTitle(title) {
  useEffect(() => {
    if (title) document.title = title;
  }, [title]);
}
