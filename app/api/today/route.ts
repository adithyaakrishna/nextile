import { getToday } from "@/server/attempts";
import { serverNow } from "@/server/clock";
import { json } from "@/server/http";
import { readPlayerId } from "@/server/player";

export async function GET() {
  return json(getToday(await readPlayerId(), serverNow()));
}
