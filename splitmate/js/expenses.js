// ============================================
// SplitMate — Expense Logic
// ============================================

import {
  db, doc, setDoc, getDoc, collection, query, where, getDocs,
  updateDoc, deleteDoc, increment, serverTimestamp, orderBy, addDoc
} from './firebase-config.js';
import { formatCurrency } from './utils.js';

// --- Add Expense ---
export async function addExpense(groupId, data, user) {
  const expenseRef = doc(collection(db, 'expenses'));

  const expenseDoc = {
    groupId,
    description: data.description.trim(),
    amount: data.amount,
    paidById: data.paidById,
    paidByName: data.paidByName,
    splitType: data.splitType,
    splits: data.splits,
    category: data.category,
    createdAt: serverTimestamp(),
    addedById: user.uid
  };
  if (data.contributions) expenseDoc.contributions = data.contributions;

  await setDoc(expenseRef, expenseDoc);

  // Update group totals
  await updateDoc(doc(db, 'groups', groupId), {
    totalExpenses: increment(data.amount),
    expenseCount: increment(1)
  });

  // Auto system chat message
  try {
    await addDoc(collection(db, 'groups', groupId, 'messages'), {
      senderId: 'system',
      senderName: 'System',
      text: `${user.displayName || user.email} added ${formatCurrency(data.amount)} expense: ${data.description}`,
      type: 'system',
      createdAt: serverTimestamp()
    });
  } catch (_) {}

  return expenseRef.id;
}

// --- Equal Split ---
export function calculateEqualSplit(amount, members) {
  const share = Math.round((amount / members.length) * 100) / 100;
  // Fix rounding: give remainder to first person
  const remainder = Math.round((amount - share * members.length) * 100) / 100;

  return members.map((m, i) => ({
    userId: m.id,
    name: m.name,
    share: i === 0 ? Math.round((share + remainder) * 100) / 100 : share
  }));
}

// --- Validate Custom Split ---
export function validateCustomSplit(amount, splits) {
  const total = splits.reduce((sum, s) => sum + (parseFloat(s.share) || 0), 0);
  const rounded = Math.round(total * 100) / 100;
  
  for (const s of splits) {
    if ((parseFloat(s.share) || 0) < 0) {
      return { valid: false, message: "Shares cannot be negative" };
    }
  }

  if (Math.abs(rounded - amount) > 0.01) {
    return { valid: false, message: `Shares total ${formatCurrency(rounded)}, but expense is ${formatCurrency(amount)}` };
  }
  return { valid: true };
}

// --- Get Group Expenses ---
export async function getGroupExpenses(groupId) {
  try {
    const q = query(
      collection(db, 'expenses'),
      where('groupId', '==', groupId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    // Fallback if composite index not yet created
    console.warn('Index not ready, falling back:', e.message);
    const q = query(collection(db, 'expenses'), where('groupId', '==', groupId));
    const snap = await getDocs(q);
    const results = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return results.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }
}

// --- Delete Expense ---
export async function deleteExpense(expenseId, groupId, amount) {
  await deleteDoc(doc(db, 'expenses', expenseId));
  await updateDoc(doc(db, 'groups', groupId), {
    totalExpenses: increment(-amount),
    expenseCount: increment(-1)
  });
}
