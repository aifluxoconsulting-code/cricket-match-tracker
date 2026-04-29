// Firestore CRUD for shared cricket data.
// Collections used (root-level, shared across all signed-in users):
//   - players: { name, teamId | null, createdAt }
//   - matches: { winnerTeamId | "draw", date (ISO), createdAt, createdBy }
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
  type QuerySnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PREDEFINED_PLAYERS, type TeamId } from "@/lib/constants";

export type MatchResult = TeamId | "draw";

export interface Player {
  id: string;
  name: string;
  teamId: TeamId | null;
}

export interface Match {
  id: string;
  winnerTeamId: MatchResult;
  date: string; // ISO yyyy-MM-dd
  createdBy?: string;
  createdAt?: number;
}

const playersCol = () => collection(db, "players");
const matchesCol = () => collection(db, "matches");

const mapPlayers = (snap: QuerySnapshot<DocumentData>): Player[] =>
  snap.docs.map((d) => ({ id: d.id, name: d.data().name, teamId: d.data().teamId ?? null }));

const mapMatches = (snap: QuerySnapshot<DocumentData>): Match[] =>
  snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      winnerTeamId: data.winnerTeamId,
      date: data.date,
      createdBy: data.createdBy,
      createdAt: data.createdAt?.toMillis?.() ?? 0,
    };
  });

/* -------- Realtime subscriptions -------- */

export function subscribePlayers(cb: (players: Player[]) => void) {
  return onSnapshot(query(playersCol(), orderBy("name")), (snap) => cb(mapPlayers(snap)));
}

export function subscribeMatches(cb: (matches: Match[]) => void) {
  return onSnapshot(query(matchesCol(), orderBy("date", "desc")), (snap) => cb(mapMatches(snap)));
}

/* -------- Players -------- */

export async function seedPredefinedPlayersIfEmpty() {
  const snap = await getDocs(playersCol());
  if (!snap.empty) return;
  const batch = writeBatch(db);
  PREDEFINED_PLAYERS.forEach((name) => {
    const ref = doc(playersCol());
    batch.set(ref, { name, teamId: null, createdAt: serverTimestamp() });
  });
  await batch.commit();
}

export async function addPlayer(name: string) {
  await addDoc(playersCol(), { name: name.trim(), teamId: null, createdAt: serverTimestamp() });
}

export async function assignPlayerToTeam(playerId: string, teamId: TeamId | null) {
  await updateDoc(doc(db, "players", playerId), { teamId });
}

export async function deletePlayer(playerId: string) {
  await deleteDoc(doc(db, "players", playerId));
}

/* -------- Matches -------- */

export async function addMatch(winnerTeamId: MatchResult, date: string, createdBy?: string) {
  await addDoc(matchesCol(), {
    winnerTeamId,
    date,
    createdBy: createdBy ?? null,
    createdAt: serverTimestamp(),
  });
}

export async function deleteMatch(matchId: string) {
  await deleteDoc(doc(db, "matches", matchId));
}

export async function resetAllMatches() {
  const snap = await getDocs(matchesCol());
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}
