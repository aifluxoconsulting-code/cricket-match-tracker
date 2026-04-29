import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useCricketData } from "@/hooks/useCricketData";
import { TEAMS, type TeamId } from "@/lib/constants";
import { useMemo, useState } from "react";
import { addMatch, deleteMatch, resetAllMatches, type MatchResult } from "@/services/firestore";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, RotateCcw, Calendar } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/matches")({
  head: () => ({
    meta: [
      { title: "Matches — Cricket Match Tracker" },
      { name: "description", content: "Add new matches and view full match history." },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <MatchesPage />
    </ProtectedRoute>
  ),
});

function MatchesPage() {
  const { matches } = useCricketData();
  const { user } = useAuth();
  const [winner, setWinner] = useState<MatchResult>("yeakub");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [submitting, setSubmitting] = useState(false);
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  const filtered = useMemo(() => {
    return matches.filter((m) => {
      if (filterFrom && m.date < filterFrom) return false;
      if (filterTo && m.date > filterTo) return false;
      return true;
    });
  }, [matches, filterFrom, filterTo]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await addMatch(winner, date, user?.uid);
      toast.success("Match added", {
        description:
          winner === "draw" ? "Recorded as a draw" : `${TEAMS[winner].short} marked as winner`,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add match");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMatch(id);
      toast.success("Match deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  const handleReset = async () => {
    try {
      await resetAllMatches();
      toast.success("All match history cleared");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to reset");
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <header className="animate-float-in">
        <h1 className="text-3xl font-bold tracking-tight">Matches</h1>
        <p className="mt-1 text-muted-foreground">Record results and review the full history.</p>
      </header>

      {/* Add match form */}
      <Card className="animate-float-in p-6 shadow-soft">
        <h2 className="mb-4 text-lg font-semibold">Add new match</h2>
        <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="winner">Result</Label>
            <Select value={winner} onValueChange={(v) => setWinner(v as MatchResult)}>
              <SelectTrigger id="winner">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yeakub">{TEAMS.yeakub.short} won</SelectItem>
                <SelectItem value="akash">{TEAMS.akash.short} won</SelectItem>
                <SelectItem value="draw">Draw</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={submitting} className="w-full" size="lg">
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" /> Add match
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Filters + reset */}
      <Card className="p-5 shadow-soft">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="from" className="text-xs">
              From
            </Label>
            <Input
              id="from"
              type="date"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="to" className="text-xs">
              To
            </Label>
            <Input
              id="to"
              type="date"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
              className="w-40"
            />
          </div>
          {(filterFrom || filterTo) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterFrom("");
                setFilterTo("");
              }}
            >
              Clear
            </Button>
          )}
          <div className="ml-auto">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset all stats
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete all match history?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently removes every recorded match. Players are not affected. This
                    action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleReset}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, reset
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </Card>

      {/* History */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            History <span className="text-sm font-normal text-muted-foreground">({filtered.length})</span>
          </h2>
        </div>
        {filtered.length === 0 ? (
          <Card className="flex flex-col items-center gap-2 p-10 text-center">
            <Calendar className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No matches in this range.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((m) => (
              <Card
                key={m.id}
                className="flex items-center justify-between p-4 transition-smooth hover:shadow-soft"
              >
                <div className="flex items-center gap-4">
                  <div className="text-sm font-medium tabular-nums">{m.date}</div>
                  <ResultBadge winner={m.winnerTeamId} />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(m.id)}
                  aria-label="Delete match"
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ResultBadge({ winner }: { winner: MatchResult }) {
  if (winner === "draw") return <Badge className="bg-draw/20 text-foreground">Draw</Badge>;
  const teamId = winner as TeamId;
  return (
    <Badge
      className={
        teamId === "yeakub"
          ? "bg-team-yeakub text-team-yeakub-foreground"
          : "bg-team-akash text-team-akash-foreground"
      }
    >
      {TEAMS[teamId].short} won
    </Badge>
  );
}
