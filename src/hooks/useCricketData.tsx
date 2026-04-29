import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from "react";
import {
  subscribeMatches,
  subscribePlayers,
  seedPredefinedPlayersIfEmpty,
  type Match,
  type Player,
} from "@/services/firestore";
import { useAuth } from "./useAuth";
import type { TeamId } from "@/lib/constants";

interface TeamStats {
  wins: number;
  losses: number;
  draws: number;
  total: number;
}

interface CricketDataValue {
  players: Player[];
  matches: Match[];
  loading: boolean;
  statsByTeam: Record<TeamId, TeamStats>;
  totalMatches: number;
  totalDraws: number;
  leadingTeam: TeamId | "tie" | null;
}

const CricketDataContext = createContext<CricketDataValue | undefined>(undefined);

function computeStats(matches: Match[]): Record<TeamId, TeamStats> {
  const base: TeamStats = { wins: 0, losses: 0, draws: 0, total: 0 };
  const stats: Record<TeamId, TeamStats> = {
    yeakub: { ...base },
    akash: { ...base },
  };
  matches.forEach((m) => {
    stats.yeakub.total++;
    stats.akash.total++;
    if (m.winnerTeamId === "draw") {
      stats.yeakub.draws++;
      stats.akash.draws++;
    } else if (m.winnerTeamId === "yeakub") {
      stats.yeakub.wins++;
      stats.akash.losses++;
    } else if (m.winnerTeamId === "akash") {
      stats.akash.wins++;
      stats.yeakub.losses++;
    }
  });
  return stats;
}

export function CricketDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(true);

  useEffect(() => {
    if (!user) {
      setPlayers([]);
      setMatches([]);
      setLoadingPlayers(false);
      setLoadingMatches(false);
      return;
    }
    setLoadingPlayers(true);
    setLoadingMatches(true);
    // Seed predefined players the first time anyone signs in
    seedPredefinedPlayersIfEmpty().catch(console.error);

    const unsubP = subscribePlayers((p) => {
      setPlayers(p);
      setLoadingPlayers(false);
    });
    const unsubM = subscribeMatches((m) => {
      setMatches(m);
      setLoadingMatches(false);
    });
    return () => {
      unsubP();
      unsubM();
    };
  }, [user]);

  const value = useMemo<CricketDataValue>(() => {
    const statsByTeam = computeStats(matches);
    const totalDraws = matches.filter((m) => m.winnerTeamId === "draw").length;
    let leadingTeam: TeamId | "tie" | null = null;
    if (matches.length > 0) {
      if (statsByTeam.yeakub.wins > statsByTeam.akash.wins) leadingTeam = "yeakub";
      else if (statsByTeam.akash.wins > statsByTeam.yeakub.wins) leadingTeam = "akash";
      else leadingTeam = "tie";
    }
    return {
      players,
      matches,
      loading: loadingPlayers || loadingMatches,
      statsByTeam,
      totalMatches: matches.length,
      totalDraws,
      leadingTeam,
    };
  }, [players, matches, loadingPlayers, loadingMatches]);

  return <CricketDataContext.Provider value={value}>{children}</CricketDataContext.Provider>;
}

export function useCricketData() {
  const ctx = useContext(CricketDataContext);
  if (!ctx) throw new Error("useCricketData must be used within CricketDataProvider");
  return ctx;
}
