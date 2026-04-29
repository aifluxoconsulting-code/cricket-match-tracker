import { createFileRoute, Link } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useCricketData } from "@/hooks/useCricketData";
import { TEAMS, type TeamId } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp, Activity, Plus, Crown } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/")({
  component: () => (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  ),
});

function Dashboard() {
  const { matches, statsByTeam, totalMatches, totalDraws, leadingTeam, loading } = useCricketData();

  const barData = (["yeakub", "akash"] as TeamId[]).map((id) => ({
    name: TEAMS[id].short,
    Wins: statsByTeam[id].wins,
    Losses: statsByTeam[id].losses,
    Draws: statsByTeam[id].draws,
  }));

  const pieData = [
    { name: "Yeakub Wins", value: statsByTeam.yeakub.wins, color: "var(--team-yeakub)" },
    { name: "Akash Wins", value: statsByTeam.akash.wins, color: "var(--team-akash)" },
    { name: "Draws", value: totalDraws, color: "var(--draw)" },
  ].filter((d) => d.value > 0);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      {/* Hero */}
      <section className="animate-float-in overflow-hidden rounded-3xl bg-gradient-hero p-8 text-primary-foreground shadow-elegant md:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <Badge className="mb-3 border-0 bg-white/20 text-white backdrop-blur-sm">
              Live cloud sync
            </Badge>
            <h1 className="text-3xl font-bold md:text-4xl">Match Dashboard</h1>
            <p className="mt-2 max-w-md text-primary-foreground/80">
              Track every result between Yeakub Mollah and Akash. No more arguments.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary" className="shadow-soft">
              <Link to="/matches">
                <Plus className="mr-2 h-4 w-4" /> Add match
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stat cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Activity} label="Total Matches" value={totalMatches} />
        <StatCard icon={TrendingUp} label="Draws" value={totalDraws} accent="draw" />
        <TeamStatCard teamId="yeakub" leading={leadingTeam === "yeakub"} />
        <TeamStatCard teamId="akash" leading={leadingTeam === "akash"} />
      </section>

      {/* Leading banner */}
      {leadingTeam && leadingTeam !== "tie" && totalMatches > 0 && (
        <Card
          className={`flex items-center gap-4 border-0 p-5 text-white shadow-elegant ${
            leadingTeam === "yeakub" ? "bg-gradient-yeakub" : "bg-gradient-akash"
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur">
            <Crown className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-medium uppercase tracking-wider opacity-90">
              Currently leading
            </div>
            <div className="text-xl font-bold">{TEAMS[leadingTeam].name}</div>
          </div>
        </Card>
      )}

      {/* Charts */}
      {!loading && totalMatches > 0 ? (
        <section className="grid gap-6 lg:grid-cols-5">
          <Card className="p-6 lg:col-span-3">
            <h2 className="mb-4 font-semibold">Wins · Losses · Draws</h2>
            <div className="h-72 w-full">
              <ResponsiveContainer>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.75rem",
                      color: "var(--popover-foreground)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Wins" fill="var(--win)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Losses" fill="var(--loss)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Draws" fill="var(--draw)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6 lg:col-span-2">
            <h2 className="mb-4 font-semibold">Win share</h2>
            <div className="h-72 w-full">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={4}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.75rem",
                      color: "var(--popover-foreground)",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </section>
      ) : (
        <Card className="flex flex-col items-center gap-3 p-12 text-center">
          <Trophy className="h-10 w-10 text-muted-foreground" />
          <h2 className="text-lg font-semibold">No matches yet</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Add your first match result to start tracking stats and charts.
          </p>
          <Button asChild className="mt-2">
            <Link to="/matches">
              <Plus className="mr-2 h-4 w-4" /> Add first match
            </Link>
          </Button>
        </Card>
      )}

      {/* Recent matches preview */}
      {matches.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent matches</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/matches">View all</Link>
            </Button>
          </div>
          <div className="space-y-2">
            {matches.slice(0, 5).map((m) => (
              <Card key={m.id} className="flex items-center justify-between p-4">
                <div className="text-sm font-medium">{m.date}</div>
                <Badge
                  variant="secondary"
                  className={
                    m.winnerTeamId === "yeakub"
                      ? "bg-team-yeakub text-team-yeakub-foreground"
                      : m.winnerTeamId === "akash"
                        ? "bg-team-akash text-team-akash-foreground"
                        : ""
                  }
                >
                  {m.winnerTeamId === "draw" ? "Draw" : `${TEAMS[m.winnerTeamId].short} won`}
                </Badge>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  accent?: "draw";
}) {
  return (
    <Card className="animate-float-in p-5 transition-smooth hover:-translate-y-0.5 hover:shadow-elegant">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            accent === "draw" ? "bg-draw/15 text-draw" : "bg-primary/15 text-primary"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 text-3xl font-bold tracking-tight">{value}</div>
    </Card>
  );
}

function TeamStatCard({ teamId, leading }: { teamId: TeamId; leading: boolean }) {
  const { statsByTeam } = useCricketData();
  const s = statsByTeam[teamId];
  const gradient = teamId === "yeakub" ? "bg-gradient-yeakub" : "bg-gradient-akash";
  return (
    <Card
      className={`relative animate-float-in overflow-hidden border-0 p-5 text-white shadow-soft transition-smooth hover:-translate-y-0.5 hover:shadow-elegant ${gradient}`}
    >
      {leading && (
        <Crown className="absolute right-3 top-3 h-5 w-5 text-white drop-shadow" />
      )}
      <div className="text-xs font-medium uppercase tracking-wider opacity-90">
        {TEAMS[teamId].short}
      </div>
      <div className="mt-2 text-3xl font-bold">{s.wins}</div>
      <div className="mt-1 text-xs opacity-90">
        Wins · {s.losses} losses · {s.draws} draws
      </div>
    </Card>
  );
}
