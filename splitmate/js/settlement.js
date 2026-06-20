// ============================================
// SplitMate — Settlement / Balance Logic
// ============================================

import { formatCurrency } from './utils.js';

// --- Calculate Net Balances ---
export function calculateNetBalances(expenses, settlements = []) {
  const balances = {}; // userId -> net amount

  for (const exp of expenses) {
    // Multi-payer: use contributions array if present
    if (exp.contributions && exp.contributions.length > 0) {
      for (const c of exp.contributions) {
        if (!balances[c.userId]) balances[c.userId] = { name: c.name, amount: 0 };
        balances[c.userId].amount += c.amount;
      }
    } else {
      // Single payer (backward compatible)
      const payerId = exp.paidById;
      if (!balances[payerId]) balances[payerId] = { name: exp.paidByName, amount: 0 };
      balances[payerId].amount += exp.amount;
    }

    for (const s of exp.splits) {
      if (!balances[s.userId]) balances[s.userId] = { name: s.name, amount: 0 };
      balances[s.userId].amount -= s.share;
    }
  }

  for (const stl of settlements) {
    if (!balances[stl.fromUserId]) balances[stl.fromUserId] = { name: stl.fromUserName, amount: 0 };
    if (!balances[stl.toUserId]) balances[stl.toUserId] = { name: stl.toUserName, amount: 0 };
    balances[stl.fromUserId].amount += stl.amount;
    balances[stl.toUserId].amount -= stl.amount;
  }

  // Round to avoid floating point issues
  for (const uid in balances) {
    balances[uid].amount = Math.round(balances[uid].amount * 100) / 100;
  }

  return balances;
}

// --- Simplify Debts (Greedy Algorithm) ---
export function simplifyDebts(balances) {
  const creditors = []; // positive balance (owed money)
  const debtors = [];   // negative balance (owes money)

  for (const uid in balances) {
    const { name, amount } = balances[uid];
    if (amount > 0.01) creditors.push({ userId: uid, name, amount });
    else if (amount < -0.01) debtors.push({ userId: uid, name, amount: Math.abs(amount) });
  }

  // Sort descending
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transactions = [];
  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const transfer = Math.min(debtors[i].amount, creditors[j].amount);
    const rounded = Math.round(transfer * 100) / 100;

    if (rounded > 0) {
      transactions.push({
        fromUserId: debtors[i].userId,
        fromName: debtors[i].name,
        toUserId: creditors[j].userId,
        toName: creditors[j].name,
        amount: rounded
      });
    }

    debtors[i].amount -= transfer;
    creditors[j].amount -= transfer;

    if (debtors[i].amount < 0.01) i++;
    if (creditors[j].amount < 0.01) j++;
  }

  return transactions;
}

// --- Get Balance Summary for Members ---
export function getBalanceSummary(balances) {
  return Object.entries(balances).map(([uid, { name, amount }]) => ({
    userId: uid,
    name,
    amount,
    status: amount > 0.01 ? 'credit' : amount < -0.01 ? 'debt' : 'settled'
  })).sort((a, b) => b.amount - a.amount);
}
