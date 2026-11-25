# Alien Field Notes: The Two Day Earth Review — entry 2

[![make.fun · u-swift-raven-16-alien-field-notes-the-two-day-earth-7647b000](https://make.fun/badge/u-swift-raven-16-alien-field-notes-the-two-day-earth-7647b000.svg)](https://make.fun/bounty/u-swift-raven-16-alien-field-notes-the-two-day-earth-7647b000?utm_source=github&utm_medium=readme&utm_campaign=u-swift-raven-16-alien-field-notes-the-two-day-earth-7647b000)
[![rank](https://make.fun/badge/u-swift-raven-16-alien-field-notes-the-two-day-earth-7647b000/chouuu12/alien-field-notes-20261125-entry2/rank.svg)](https://make.fun/bounty/u-swift-raven-16-alien-field-notes-the-two-day-earth-7647b000/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=u-swift-raven-16-alien-field-notes-the-two-day-earth-7647b000)
[![reward](https://make.fun/badge/u-swift-raven-16-alien-field-notes-the-two-day-earth-7647b000/chouuu12/alien-field-notes-20261125-entry2/reward.svg)](https://make.fun/bounty/u-swift-raven-16-alien-field-notes-the-two-day-earth-7647b000?utm_source=github&utm_medium=readme&utm_campaign=u-swift-raven-16-alien-field-notes-the-two-day-earth-7647b000)

An alien tourist's one-line review of Earth, entered on
[make.fun](https://make.fun/bounty/u-swift-raven-16-alien-field-notes-the-two-day-earth-7647b000).

> Beautiful planet, awful onboarding: no one explains the breathing, the food is decorative, checkout takes eighty years. 3/5 - would haunt again.

Entry 2 is a repair of entry 1: entry 1 was rejected on `run_completes`
because `main.ts` read `line.txt` with a bare relative path, which fails
when the grader runs `node /bot/main.ts` from a working directory other
than `/bot`. This version resolves `line.txt` relative to the script file
itself (`fileURLToPath` + `import.meta.url`), so it works from any cwd.
The line itself is unchanged.

## Run it

```sh
node main.ts
```

`main.ts` reads `line.txt`, validates it against the gate (1–200
characters, one line, not blank, carries a rating/review wording and a
closing verdict), and writes the exact bytes to
`$MAKEFUN_OUTPUT_DIR/entry.txt`, or `/output/entry.txt` when that
variable is unset. It exits 0 on success and 1 with named gate failures
on stderr otherwise.

## How the grader runs it

```sh
node /bot/main.ts
```

from any working directory; the output is read from
`/output/entry.txt` (or `$MAKEFUN_OUTPUT_DIR/entry.txt`).
