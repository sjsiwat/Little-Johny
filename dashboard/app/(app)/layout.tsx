"use client";

import { useEffect } from "react";
import { useAuthBootstrap } from "@/lib/useAuthBootstrap";
import { useStore } from "@/lib/store";
import { AuthGate } from "@/components/shared/AuthGate";
import { Sidebar } from "@/components/shared/Sidebar";
import { Topbar } from "@/components/shared/Topbar";
import { Toast } from "@/components/shared/Toast";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const auth = useAuthBootstrap();
  const theme = useStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  if (!auth.authReady) {
    return <div className="min-h-screen bg-paper dark:bg-dark-bg" />;
  }

  if (!auth.authed) {
    return (
      <>
        <AuthGate auth={auth} />
        <Toast />
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-paper dark:bg-dark-bg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar auth={auth} />
        <main className="min-w-0 flex-1 px-6 py-6">{children}</main>
      </div>
      <Toast />
    </div>
  );
}
