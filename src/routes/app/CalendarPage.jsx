import { useDocumentTitle } from "@/lib/useDocumentTitle";
import { CalendarView } from "@/components/calendar/CalendarView";

export default function CalendarPage() {
  useDocumentTitle("Johny Memo — ปฏิทิน");
  return <CalendarView />;
}