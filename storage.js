/* ============================================================
   STORAGE — unified adapter (LocalStorage ↔ Supabase)
   Exposes a global `Storage` object. Must load after auth.js.

   Guest mode  → LocalStorage only (synchronous, offline-first)
   Logged in   → LocalStorage (instant) + Supabase (debounced sync)
   ============================================================ */

const Storage = (() => {
  const LOCAL_KEY = 'johny-os-lite-state';
  let _syncTimer = null;

  /* ── Local helpers ── */
  function localLoad() {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_KEY)) || null;
    } catch {
      return null;
    }
  }

  function localSave(state) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
  }

  /* ── Cloud row mappers ── */
  function rowToTask(row) {
    return {
      id: row.id,
      title: row.title,
      priority: row.priority,
      due: row.due || '',
      status: row.status,
      createdAt: new Date(row.created_at).getTime()
    };
  }

  function rowToNote(row) {
    return {
      id: row.id,
      title: row.title,
      body: row.body || '',
      tags: row.tags || '',
      createdAt: new Date(row.created_at).getTime()
    };
  }

  function rowToExpense(row) {
    return {
      id: row.id,
      title: row.title,
      amount: Number(row.amount),
      category: row.category,
      date: row.date || '',
      createdAt: new Date(row.created_at).getTime()
    };
  }

  function taskToRow(task, uid) {
    return {
      id: task.id,
      user_id: uid,
      title: task.title,
      priority: task.priority,
      due: task.due || null,
      status: task.status,
      created_at: new Date(task.createdAt).toISOString()
    };
  }

  function noteToRow(note, uid) {
    return {
      id: note.id,
      user_id: uid,
      title: note.title,
      body: note.body || '',
      tags: note.tags || '',
      created_at: new Date(note.createdAt).toISOString()
    };
  }

  function expenseToRow(expense, uid) {
    return {
      id: expense.id,
      user_id: uid,
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: expense.date || null,
      created_at: new Date(expense.createdAt).toISOString()
    };
  }

  /* ── Cloud sync: upsert current items, delete orphans ── */
  async function syncTable(table, items, toRow, uid) {
    const db = Auth.db;
    if (items.length > 0) {
      const { error } = await db.from(table).upsert(items.map(i => toRow(i, uid)));
      if (error) console.error(`[storage] upsert ${table}:`, error.message);
    }
    const currentIds = items.map(i => i.id);
    const { data: existing } = await db.from(table).select('id').eq('user_id', uid);
    const toDelete = (existing || []).map(r => r.id).filter(id => !currentIds.includes(id));
    if (toDelete.length > 0) {
      const { error } = await db.from(table).delete().in('id', toDelete);
      if (error) console.error(`[storage] delete ${table}:`, error.message);
    }
  }

  async function pushToCloud(state) {
    if (!Auth.isLoggedIn()) return;
    const uid = Auth.getUser().id;
    try {
      await Promise.all([
        syncTable('tasks', state.tasks, taskToRow, uid),
        syncTable('notes', state.notes, noteToRow, uid),
        syncTable('expenses', state.expenses, expenseToRow, uid)
      ]);
    } catch (err) {
      console.error('[storage] cloud sync failed:', err);
    }
  }

  /* ── Public API ── */
  return {
    loadLocal(defaultState) {
      const saved = localLoad();
      return saved ? { ...defaultState, ...saved } : defaultState;
    },

    save(state) {
      localSave(state);
      if (Auth.isLoggedIn()) {
        clearTimeout(_syncTimer);
        _syncTimer = setTimeout(() => pushToCloud(state), 1500);
      }
    },

    async loadCloud() {
      if (!Auth.isLoggedIn()) return null;
      const uid = Auth.getUser().id;
      const db = Auth.db;
      try {
        const [tasksRes, notesRes, expensesRes] = await Promise.all([
          db.from('tasks').select('*').eq('user_id', uid),
          db.from('notes').select('*').eq('user_id', uid),
          db.from('expenses').select('*').eq('user_id', uid)
        ]);
        if (tasksRes.error || notesRes.error || expensesRes.error) return null;
        return {
          tasks: tasksRes.data.map(rowToTask),
          notes: notesRes.data.map(rowToNote),
          expenses: expensesRes.data.map(rowToExpense)
        };
      } catch (err) {
        console.error('[storage] loadCloud failed:', err);
        return null;
      }
    },

    clearLocal() {
      localStorage.removeItem(LOCAL_KEY);
    }
  };
})();
