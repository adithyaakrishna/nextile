import "server-only";
import type { AnalyticsEvent } from "@/analytics/events";
import { db } from "./db";

// No IP addresses, no user agents: just the event, its validated props and the anonymous player id
export function recordEvents(events: readonly AnalyticsEvent[], playerId: string | null, at: number): void {
  const insert = db().prepare("INSERT INTO events (at, name, player_id, props) VALUES (?, ?, ?, ?)");
  db().transaction(() => {
    for (const e of events) insert.run(at, e.name, playerId, JSON.stringify(e.props));
  })();
}
