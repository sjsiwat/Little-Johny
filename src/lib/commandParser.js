import { useStore } from "@/lib/store";
import { addTask, addNote, addExpense, isTaskDone } from "@/lib/actions";
import { formatMoney, getTodayKey } from "@/lib/format";

// The commands the capture bar understands, declared next to the parser that
// matches them. `prefix` is what a quick-action chip drops into the input;
// `test` is how we recognise it afterwards to show the right placeholder hint.
export const COMMANDS = [
  {
    id: "task",
    label: "งานใหม่",
    prefix: "เพิ่มงาน ",
    test: (t) => t.startsWith("เพิ่มงาน"),
    hint: "ส่งรายงานประจำเดือน",
  },
  {
    id: "note",
    label: "โน้ตใหม่",
    prefix: "โน้ต: ",
    test: (t) => t.startsWith("โน้ต:") || t.toLowerCase().startsWith("note:"),
    hint: "ไอเดียที่เพิ่งคิดออก",
  },
  {
    id: "expense",
    label: "รายจ่ายใหม่",
    prefix: "จ่าย ",
    test: (t) => t.startsWith("จ่าย"),
    hint: "กาแฟ 60 เครื่องดื่ม  (ชื่อ จำนวน หมวด)",
  },
];

// Ported verbatim from app.js's parseCommand() — the quick-capture bar's
// tiny natural-language-ish parser.
export function parseCommand(rawText) {
  const text = rawText.trim();
  if (!text) return "ยังไม่ได้พิมพ์คำสั่ง";
  const state = useStore.getState();

  if (text.startsWith("เพิ่มงาน")) {
    const title = text.replace("เพิ่มงาน", "").trim() || "งานใหม่";
    addTask(title, "Medium", "", "todo", "", []);
    return `เพิ่มงานแล้ว: ${title}`;
  }

  if (text.startsWith("โน้ต:") || text.startsWith("note:")) {
    const body = text.replace(/^โน้ต:|^note:/i, "").trim();
    const title = body.split("\n")[0].trim() || "โน้ตใหม่";
    addNote(title, body, "secretary");
    return `บันทึกโน้ตแล้ว: ${title}`;
  }

  if (text.startsWith("จ่าย")) {
    const parts = text.split(/\s+/);
    const amountIndex = parts.findIndex((p) => Number.isFinite(Number(p)));
    if (amountIndex > 0) {
      const title = parts.slice(1, amountIndex).join(" ").trim() || "รายจ่าย";
      const amount = Number(parts[amountIndex]);
      const category = parts[amountIndex + 1] || "อื่นๆ";
      addExpense(title, amount, category, getTodayKey());
      return `บันทึกรายจ่ายแล้ว: ${title} ${formatMoney(amount)}`;
    }
  }

  if (text.includes("วันนี้มีงานอะไร")) {
    const openTasks = state.tasks.filter((task) => !isTaskDone(task));
    return openTasks.length
      ? `งานค้างตอนนี้: ${openTasks.map((task) => task.title).join(", ")}`
      : "วันนี้ยังไม่มีงานค้าง";
  }

  if (text.includes("สรุปรายจ่าย")) {
    const total = state.expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    return `รายจ่ายทั้งหมดที่บันทึกไว้ตอนนี้คือ ${formatMoney(total)}`;
  }

  return "ยังไม่เข้าใจคำสั่งนี้ ตอนนี้รองรับ:\nเพิ่มงาน, โน้ต:, จ่าย, วันนี้มีงานอะไร, สรุปรายจ่าย";
}
