// ============================================
// SplitMate — Groups Logic
// ============================================

import {
  db, auth, doc, setDoc, getDoc, collection, query, where,
  getDocs, updateDoc, arrayUnion, serverTimestamp, deleteDoc
} from './firebase-config.js';
import { generateGroupCode, showToast, formatCurrency, formatRelativeTime, getInitials, escapeHTML } from './utils.js';

// --- Create Group ---
export async function createGroup(name, description, user) {
  const code = generateGroupCode();
  const groupRef = doc(collection(db, 'groups'));
  const memberDetail = {
    id: user.uid,
    name: user.displayName || user.email,
    email: user.email,
    avatar: user.photoURL || ''
  };

  await setDoc(groupRef, {
    name: name.trim(),
    description: description.trim(),
    code,
    creatorId: user.uid,
    members: [user.uid],
    memberDetails: [memberDetail],
    totalExpenses: 0,
    expenseCount: 0,
    createdAt: serverTimestamp()
  });

  return { id: groupRef.id, code };
}

// --- Join Group by Code ---
export async function joinGroupByCode(code, user) {
  const q = query(collection(db, 'groups'), where('code', '==', code.toUpperCase().trim()));
  const snap = await getDocs(q);

  if (snap.empty) throw new Error('No group found with this code');

  const groupDoc = snap.docs[0];
  const data = groupDoc.data();

  if (data.members.includes(user.uid)) throw new Error('You are already in this group');

  const memberDetail = {
    id: user.uid,
    name: user.displayName || user.email,
    email: user.email,
    avatar: user.photoURL || ''
  };

  await updateDoc(groupDoc.ref, {
    members: arrayUnion(user.uid),
    memberDetails: arrayUnion(memberDetail)
  });

  return { id: groupDoc.id, name: data.name };
}

// --- Load User's Groups ---
export async function loadUserGroups(userId) {
  const q = query(collection(db, 'groups'), where('members', 'array-contains', userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// --- Render Group Card ---
export function renderGroupCard(group) {
  const memberCount = group.members?.length || 0;
  const total = formatCurrency(group.totalExpenses || 0);
  const initial = group.name?.charAt(0).toUpperCase() || '?';

  return `
    <a href="group.html?id=${group.id}" class="card group-card" id="group-${group.id}">
      <div class="group-card-header">
        <div class="avatar" style="background:var(--accent-gradient);font-size:var(--text-lg);">${initial}</div>
        <div class="group-card-info">
          <h3 class="group-card-name">${escapeHTML(group.name)}</h3>
          <span class="text-sm text-muted">${escapeHTML(group.description || '')}</span>
        </div>
      </div>
      <div class="group-card-stats">
        <div class="group-stat">
          <i class="fa-solid fa-users"></i>
          <span>${memberCount} member${memberCount !== 1 ? 's' : ''}</span>
        </div>
        <div class="group-stat">
          <i class="fa-solid fa-indian-rupee-sign"></i>
          <span>${total}</span>
        </div>
      </div>
      <div class="group-card-code">
        <span class="badge badge-primary"><i class="fa-solid fa-key"></i> ${group.code}</span>
      </div>
    </a>`;
}
