import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

export function LandingLayout() {
  const { pathname, hash } = useLocation();

  // The landing page is light-only; clear the app's dark attribute when the
  // user navigates back out of the dashboard.
  useEffect(() => {
    document.documentElement.dataset.theme = "light";
  }, []);

  // Static export used to resolve #anchors on load. In a SPA the browser will
  // not scroll on a client-side navigation, so do it here.
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
  }, [pathname, hash]);

  return <Outlet />;
}
