/* ============================================================
   STORAGE — unified adapter (LocalStorage ↔ Supabase)
   Exposes a global `Storage` object. Must load after auth.js.

   Guest mode  → LocalStorage only (synchronous, offline-first)
   Logged in   → LocalStorage (instant) + Supabase (debounced sync)
   ============================================================ */

const Storage = (() => {
  const LOCAL_KEY = 'johny-os-lite-state';
  let _syncTimer = null;
  let _syncChangeListener = null;

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
      description: row.description || '',
      priority: row.priority,
      due: row.due || '',
      status: row.status,
      labels: Array.isArray(row.labels) ? row.labels : [],
      goal_id: row.goal_id || null,
      target_value: row.target_value != null ? Number(row.target_value) : null,
      target_unit: row.target_unit || '',
      progress_value: Number(row.progress_value) || 0,
      createdAt: new Date(row.created_at).getTime()
    };
  }

  function rowToGoal(row) {
    return {
      id: row.id,
      title: row.title,
      color: row.color || '#0A84FF',
      createdAt: new Date(row.created_at).getTime()
    };
  }

  function rowToNote(row) {
    return {
      id: row.id,
      title: row.title,
      body: row.body || '',
      tags: row.tags || '',
      goal_id: row.goal_id || null,
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
      goal_id: row.goal_id || null,
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
      goal_id: task.goal_id || null,
      target_value: task.target_value != null ? Number(task.target_value) : null,
      target_unit: task.target_unit || null,
      progress_value: Number(task.progress_value) || 0,
      created_at: new Date(task.createdAt).toISOString()
    };
  }

  function goalToRow(goal, uid) {
    return {
      id: goal.id,
      user_id: uid,
      title: goal.title,
      color: goal.color || '#0A84FF',
      created_at: new Date(goal.createdAt).toISOString()
    };
  }

  function noteToRow(note, uid) {
    return {
      id: note.id,
      user_id: uid,
      title: note.title,
      body: note.body || '',
      tags: note.tags || '',
      goal_id: note.goal_id || null,
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
      goal_id: expense.goal_id || null,
      created_at: new Date(expense.createdAt).toISOString()
    };
  }

  /* ── Deduplicate items by title — keeps latest createdAt per unique title ── */
  function dedupeByTitle(items) {
    const map = new Map();
    items.forEach(item => {
      const key = item.title.trim().toLowerCase();
      if (!map.has(key) || item.createdAt > map.get(key).createdAt) {
        map.set(key, item);
      }
    });
    return [...map.values()].sort((a, b) => b.createdAt - a.createdAt);
  }

  /* ── Cloud sync: upsert current items, delete orphans ── */
  async function syncTable(table, items, toRow, uid) {
    // Safety: never touch cloud when local is empty — prevents accidental wipe from bad merges
    if (items.length === 0) return;
    const db = Auth.db;
    const { error: upsertErr } = await db.from(table).upsert(items.map(i => toRow(i, uid)));
    if (upsertErr) {
      console.error(`[storage] upsert ${table}:`, upsertErr.message);
      throw new Error(`upsert ${table}: ${upsertErr.message}`);
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
    if (_syncChangeListener) _syncChangeListener('syncing');
    const uid = Auth.getUser().id;
    // Strip demo items — they are display-only and must never reach the cloud
    const tasks    = state.tasks.filter(t => !t._isDemo);
    const notes    = state.notes.filter(n => !n._isDemo && !n._isKVLine);
    const expenses = state.expenses.filter(e => !e._isDemo);
    const goals    = (state.goals || []).filter(g => !g._isDemo);
    try {
      // Goals must be synced first — tasks/notes/expenses have FK references to goals
      await syncTable('goals', goals, goalToRow, uid);
      const results = await Promise.allSettled([
        syncTable('tasks',    tasks,    taskToRow,    uid),
        syncTable('notes',    notes,    noteToRow,    uid),
        syncTable('expenses', expenses, expenseToRow, uid),
      ]);
      const failed = results.filter(r => r.status === 'rejected');
      if (failed.length > 0) {
        const msg = failed.map(r => r.reason?.message).filter(Boolean).join('; ');
        console.error('[storage] partial sync failure:', msg);
        if (_syncChangeListener) _syncChangeListener('error', msg);
      } else {
        if (_syncChangeListener) _syncChangeListener('synced');
      }
    } catch (err) {
      console.error('[storage] cloud sync failed:', err);
      if (_syncChangeListener) _syncChangeListener('error', err.message);
    }
  }

  /* ── Public API ── */
  return {
    loadLocal(defaultState) {
      const saved = localLoad();
      return saved ? { ...defaultState, ...saved } : defaultState;
    },

    save(state) {
      // Guest mode is ephemeral — no persistence anywhere, no cloud sync.
      // Data is saved only for authenticated users.
      if (!Auth.isLoggedIn()) return;
      // Strip display-only items before persisting locally
      const persistState = {
        ...state,
        notes: state.notes.filter(n => !n._isKVLine)
      };
      localSave(persistState);
      clearTimeout(_syncTimer);
      if (_syncChangeListener) _syncChangeListener('pending');
      _syncTimer = setTimeout(() => pushToCloud(state), 1500);
    },

    onSyncChange(fn) { _syncChangeListener = fn; },

    async loadCloud() {
      if (!Auth.isLoggedIn()) return null;
      const uid = Auth.getUser().id;
      const db = Auth.db;
      try {
        const [tasksRes, notesRes, expensesRes, goalsRes] = await Promise.all([
          db.from('tasks').select('*').eq('user_id', uid),
          db.from('notes').select('*').eq('user_id', uid),
          db.from('expenses').select('*').eq('user_id', uid),
          db.from('goals').select('*').eq('user_id', uid),
        ]);
        if (tasksRes.error || notesRes.error || expensesRes.error || goalsRes.error) return null;
        return {
          tasks:    dedupeByTitle(tasksRes.data.map(rowToTask)),
          notes:    dedupeByTitle(notesRes.data.map(rowToNote)),
          expenses: dedupeByTitle(expensesRes.data.map(rowToExpense)),
          goals:    goalsRes.data.map(rowToGoal).sort((a, b) => b.createdAt - a.createdAt),
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
