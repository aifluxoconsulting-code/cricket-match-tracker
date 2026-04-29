import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useCricketData } from "@/hooks/useCricketData";
import { TEAMS, type TeamId } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Trophy, UserCircle2 } from "lucide-react";

export const Route = createFileRoute("/teams")({
  head: () => ({
    meta: [
      { title: "Teams — Cricket Match Tracker" },
      { name: "description", content: "Yeakub Mollah and Akash team rosters and stats." },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <TeamsPage />
    </ProtectedRoute>
  ),
});

function TeamsPage() {
  const { players, statsByTeam, leadingTeam } = useCricketData();
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <header className="animate-float-in">
        <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
        <p className="mt-1 text-muted-foreground">Squad rosters and team-by-team performance.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {(["yeakub", "akash"] as TeamId[]).map((id) => {
          const roster = players.filter((p) => p.teamId === id);
          const s = statsByTeam[id];
          const isLeading = leadingTeam === id;
          const gradient = id === "yeakub" ? "bg-gradient-yeakub" : "bg-gradient-akash";
          return (
            <Card
              key={id}
              className="animate-float-in overflow-hidden border-0 shadow-elegant"
            >
              <div className={`relative p-6 text-white ${gradient}`}>
                {isLeading && (
                  <Badge className="absolute right-4 top-4 border-0 bg-white/25 text-white backdrop-blur">
                    <Crown className="mr-1 h-3 w-3" /> Leading
                  </Badge>
                )}
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{TEAMS[id].name}</h2>
                    <p className="text-sm opacity-90">{roster.length} players</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-4 gap-3 text-center">
                  <Stat label="Played" value={s.total} />
                  <Stat label="Wins" value={s.wins} />
                  <Stat label="Losses" value={s.losses} />
                  <Stat label="Draws" value={s.draws} />
                </div>
              </div>

              <div className="bg-card p-5">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Roster
                </h3>
                {roster.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No players assigned yet.
                  </p>
                ) : (
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {roster.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm"
                      >
                        <UserCircle2 className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{p.name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/15 p-3 backdrop-blur">
      <div className="text-xl font-bold tabular-nums">{value}</div>
      <div className="text-[10px] font-medium uppercase tracking-wider opacity-90">{label}</div>
    </div>
  );
}
