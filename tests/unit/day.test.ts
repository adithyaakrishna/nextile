import { describe, expect, it } from "vitest";
import { LAUNCH_DAY, challengeNumber } from "@/config";
import { content, resolveToday, runwayDays } from "@/content/catalog";
import { SCHEDULE } from "@/content/schedule";
import { addDays, daysBetween, formatDayLabel, isDayKey, nextPublicationMs, toDayKey, weekdayOf } from "@/time/day";

describe("UTC day arithmetic", () => {
  it("changes day at 00:00 UTC, not at local midnight", () => {
    expect(toDayKey(Date.parse("2026-11-16T23:59:59.999Z"))).toBe("2026-11-16");
    expect(toDayKey(Date.parse("2026-11-17T00:00:00.000Z"))).toBe("2026-11-17");
  });

  it("schedules the next puzzle for the next UTC midnight, across month and year ends", () => {
    expect(nextPublicationMs(Date.parse("2026-11-30T15:00:00Z"))).toBe(Date.parse("2026-12-01T00:00:00Z"));
    expect(nextPublicationMs(Date.parse("2026-12-31T23:59:59Z"))).toBe(Date.parse("2027-01-01T00:00:00Z"));
  });

  it("gives the same day to the same instant whatever the browser's time zone", () => {
    // 10:30 UTC is 00:30 the next day in UTC+14 (Kiritimati) and 23:30 the day before in UTC−11 (Pago Pago)
    const instant = Date.parse("2026-11-18T10:30:00Z");
    expect(toDayKey(instant)).toBe("2026-11-18");
    expect(challengeNumber(toDayKey(instant))).toBe(3);
  });

  it("adds days and validates keys", () => {
    expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
    expect(daysBetween("2026-11-16", "2027-01-14")).toBe(59);
    expect(isDayKey("2026-02-30")).toBe(false);
    expect(isDayKey("2026-11-16")).toBe(true);
    expect(weekdayOf(LAUNCH_DAY)).toBe(1);
    expect(formatDayLabel("2026-12-27")).toBe("Sunday 27 December");
  });
});

describe("date-to-puzzle mapping", () => {
  it("is not launched before launch day", () => {
    expect(resolveToday(Date.parse("2026-11-15T23:59:59.999Z"))).toEqual({ status: "not-launched", launchDay: LAUNCH_DAY });
  });

  it("serves challenge #1 at the first instant of launch day", () => {
    const today = resolveToday(Date.parse("2026-11-16T00:00:00.000Z"));
    expect(today).toMatchObject({ status: "available", day: "2026-11-16", number: 1 });
    expect(today.status === "available" && today.puzzle.id).toBe(SCHEDULE[0].id);
  });

  it("follows the explicit schedule mid-way", () => {
    const entry = SCHEDULE[30];
    const today = resolveToday(Date.parse(`${entry.day}T12:00:00Z`));
    expect(today.status === "available" && today.puzzle.id).toBe(entry.id);
  });

  it("shows no puzzle after the schedule ends rather than repeating one", () => {
    const after = addDays(SCHEDULE[SCHEDULE.length - 1].day, 1);
    expect(resolveToday(Date.parse(`${after}T08:00:00Z`))).toMatchObject({ status: "no-puzzle", day: after });
    expect(runwayDays(Date.parse(`${after}T08:00:00Z`))).toBe(0);
  });

  it("counts runway from launch day before launch", () => {
    expect(runwayDays(Date.parse("2026-10-29T12:00:00Z"), content())).toBe(SCHEDULE.length);
  });
});
