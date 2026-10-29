# Game rules

The rules in plain words. The How to play page says the same thing to players.

## The day

- A new puzzle goes live for everyone at 00:00 UTC. The server decides which puzzle is today's, so a wrong device clock or an unusual time zone can't show a different one.
- Each date has its own puzzle in an explicit schedule. If a date has no puzzle, the game says so ("No puzzle today. We skip a day rather than repeat one.") and never repeats an old one.
- An attempt belongs to the day it was started. Start at 23:59:30 UTC and answer at 00:00:10 UTC, and it counts for the earlier day.

## One try, sixty seconds

- The tiles are sent to the browser only when you press **Start the clock**, and the server records that moment.
- You get one pick. The first answer locks the game; later key presses, clicks and taps change nothing.
- An answer must arrive before the sixty seconds are up. An answer at exactly 60.000 s is a timeout.
- Refreshing, closing the tab or opening a second tab never resets the clock. If time remains when you come back, play resumes with the time that is left. If not, the result is "Time's up."
- Each browser gets one attempt per day. Clearing cookies and site data allows another attempt; that is the trade-off of having no accounts, and it is why there is no leaderboard.

## The official time

The browser measures your time precisely, but the server can't take its word for it. The official time is the browser's time, kept within a window: never more than the server measured, and never more than 2 seconds less (the most network delay credited back). A finish that reaches the server more than 2.5 seconds after the deadline is a timeout. An honest player is never affected.

If your connection drops after you answer, the answer is saved on your device and resent until the server scores it. It is scored against when you answered only if it reaches the server within that 2.5-second grace; after that it counts as a timeout, so holding an answer back can never help.

## Scoring

- **Correct:** 70 points, plus up to 30 for speed: `70 + round(30 × (60 − seconds) ÷ 60)`, using the official milliseconds.
- **Wrong answer or out of time:** 0.

| Official time | Score |
|---|---|
| 0.0 s | 100 |
| 5.0 s | 98 |
| 10.0 s | 95 |
| 18.4 s | 91 |
| 30.0 s | 85 |
| 45.0 s | 78 |
| 59.9 s | 70 |

Times are shown truncated to tenths, so 59.96 s shows as 59.9 s and never as a misleading 60.0 s.

## Streaks

- A day counts toward your streak only if you solved that day's puzzle.
- Your current streak is the run of consecutive solved days ending today, or ending yesterday if you haven't played today yet. It stays alive until today's puzzle is missed.
- A wrong answer, running out of time, or skipping a day resets your current streak to zero.
- Your best streak is the longest run you've ever had on this device.

Streaks are worked out from your history every time they are shown, never stored as counters. Stats are labeled "On this device" because, without accounts, they belong to this browser.

## Difficulty

Each puzzle's difficulty (Easy, Medium, Hard) is computed from its rule, not chosen by hand: one changing property is easy; two properties changing on different rhythms, bounces and "each one twice" patterns are medium; interleaved sequences and patterns where one property moves on only when another starts over are hard. The weekly rhythm is easy on Monday and Tuesday, medium Wednesday to Friday and Sunday, and hard on Saturday.
