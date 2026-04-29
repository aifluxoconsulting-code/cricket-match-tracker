import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useCricketData } from "@/hooks/useCricketData";
import { TEAMS, type TeamId } from "@/lib/constants";
import { addPlayer, assignPlayerToTeam, deletePlayer } from "@/services/firestore";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, UserCircle2 } from "lucide-react";

export const Route = createFileRoute("/players")({
  head: () => ({
    meta: [
      { title: "Players — Cricket Match Tracker" },
      { name: "description", content: "Manage players and assign them to teams." },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <PlayersPage />
    </ProtectedRoute>
  ),
});

function PlayersPage() {
  const { players } = useCricketData();
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    if (trimmed.length > 50) {
      toast.error("Name must be under 50 characters");
      return;
    }
    if (players.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("A player with that name already exists");
      return;
    }
    try {
      setAdding(true);
      await addPlayer(trimmed);
      setName("");
      toast.success(`Added ${trimmed}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add player");
    } finally {
      setAdding(false);
    }
  };

  const handleAssign = async (id: string, teamId: string) => {
    try {
      await assignPlayerToTeam(id, teamId === "none" ? null : (teamId as TeamId));
      toast.success("Team updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await deletePlayer(id);
      toast.success(`Removed ${name}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove");
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <header className="animate-float-in">
        <h1 className="text-3xl font-bold tracking-tight">Players</h1>
        <p className="mt-1 text-muted-foreground">
          Assign players to a team. A player can only belong to one team at a time.
        </p>
      </header>

      <Card className="animate-float-in p-6 shadow-soft">
        <h2 className="mb-4 text-lg font-semibold">Add new player</h2>
        <form onSubmit={handleAdd} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="name">Player name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rakib Bhai"
              maxLength={50}
            />
          </div>
          <Button type="submit" disabled={adding} size="lg">
            {adding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Add
              </>
            )}
          </Button>
        </form>
      </Card>

      <section>
        <h2 className="mb-3 text-lg font-semibold">
          All players{" "}
          <span className="text-sm font-normal text-muted-foreground">({players.length})</span>
        </h2>
        {players.length === 0 ? (
          <Card className="p-10 text-center text-sm text-muted-foreground">
            No players yet — predefined squad will be added on first sign-in.
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {players.map((p) => (
              <Card
                key={p.id}
                className="flex items-center justify-between gap-3 p-4 transition-smooth hover:shadow-soft"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      p.teamId === "yeakub"
                        ? "bg-team-yeakub text-team-yeakub-foreground"
                        : p.teamId === "akash"
                          ? "bg-team-akash text-team-akash-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <UserCircle2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-medium">{p.name}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {p.teamId ? TEAMS[p.teamId].short : "Unassigned"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Select
                    value={p.teamId ?? "none"}
                    onValueChange={(v) => handleAssign(p.id, v)}
                  >
                    <SelectTrigger className="h-9 w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Unassigned</SelectItem>
                      <SelectItem value="yeakub">{TEAMS.yeakub.short}</SelectItem>
                      <SelectItem value="akash">{TEAMS.akash.short}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(p.id, p.name)}
                    aria-label="Delete player"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
