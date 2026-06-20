// ============================================
// SplitMate — History Logic
// ============================================

import { getGroupExpenses } from './expenses.js';

// --- Load & Filter Expenses ---
export async function loadHistory(groupId) {
  return await getGroupExpenses(groupId);
}

export function filterExpenses(expenses, filters) {
  let result = [...expenses];

  if (filters.category && filters.category !== 'all') {
    result = result.filter(e => e.category === filters.category);
  }

  if (filters.paidBy && filters.paidBy !== 'all') {
    result = result.filter(e => e.paidById === filters.paidBy);
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(e => e.description.toLowerCase().includes(q));
  }

  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom).getTime();
    result = result.filter(e => {
      const d = e.createdAt?.toDate ? e.createdAt.toDate().getTime() : 0;
      return d >= from;
    });
  }

  if (filters.dateTo) {
    const to = new Date(filters.dateTo).getTime() + 86400000; // end of day
    result = result.filter(e => {
      const d = e.createdAt?.toDate ? e.createdAt.toDate().getTime() : 0;
      return d <= to;
    });
  }

  return result;
}
