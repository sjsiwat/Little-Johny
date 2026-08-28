import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { LandingLayout } from "@/routes/landing/LandingLayout.jsx";
import Home from "@/routes/landing/Home.jsx";

// The app half pulls in TipTap, dnd-kit and the Supabase client. Next.js split
// those per route; keep the landing page from paying for them.
const About = lazy(() => import("@/routes/landing/About.jsx"));
const Signup = lazy(() => import("@/routes/landing/Signup.jsx"));
const AppLayout = lazy(() =>
  import("@/routes/app/AppLayout.jsx").then((m) => ({ default: m.AppLayout }))
);
const DashboardPage = lazy(() => import("@/routes/app/DashboardPage.jsx"));
const TasksPage = lazy(() => import("@/routes/app/TasksPage.jsx"));
const NotesPage = lazy(() => import("@/routes/app/NotesPage.jsx"));
const ExpensesPage = lazy(() => import("@/routes/app/ExpensesPage.jsx"));
const CalendarPage = lazy(() => import("@/routes/app/CalendarPage.jsx"));
const ReviewPage = lazy(() => import("@/routes/app/ReviewPage.jsx"));
const NotFound = lazy(() => import("@/routes/NotFound.jsx"));

// Matches AppLayout's own pre-auth placeholder, so a chunk fetch does not flash.
const Blank = <div className="min-h-screen bg-paper dark:bg-dark-bg" />;

export default function App() {
  return (
    <Suspense fallback={Blank}>
      <Routes>
        <Route element={<LandingLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/review" element={<ReviewPage />} />
        </Route>

        <Route path="/index.html" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
