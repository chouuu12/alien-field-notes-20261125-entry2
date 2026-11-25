/**
 * Alien Field Notes: The Two Day Earth Review — entry 2 (repair).
 *
 * Reads the one-line alien review of Earth from line.txt (resolved
 * relative to THIS script file, never relative to the working
 * directory), validates it against the competition gate, and writes
 * the exact bytes to $MAKEFUN_OUTPUT_DIR/entry.txt, or to
 * /output/entry.txt when that variable is unset.
 *
 * Run:  node main.ts
 * The grader runs it as `node /bot/main.ts` from an arbitrary
 * working directory, so every path here is anchored to the script
 * file itself.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// Gate constants (from the competition rules, RULES.txt "The gate").
// ---------------------------------------------------------------------------

/** Minimum length of the entry text, in characters (code points). */
const MIN_CHARS = 1;

/** Maximum length of the entry text, in characters (code points). */
const MAX_CHARS = 200;

/** Name of the file holding the review line, next to this script. */
const LINE_FILE_NAME = "line.txt";

/** Name of the file the grader reads. */
const OUTPUT_FILE_NAME = "entry.txt";

/** Default output directory when MAKEFUN_OUTPUT_DIR is not set. */
const DEFAULT_OUTPUT_DIR = "/output";

/** Environment variable the harness sets to choose the output dir. */
const OUTPUT_DIR_ENV = "MAKEFUN_OUTPUT_DIR";

// ---------------------------------------------------------------------------
// Review-voice vocabulary.
// ---------------------------------------------------------------------------

/** Words that mark a line as carrying a rating or review wording. */
const RATING_WORDS = [
  "3/5",
  "4/5",
  "5/5",
  "1/5",
  "2/5",
  "stars",
  "star",
  "rating",
  "rated",
  "review",
  "would",
  "recommend",
  "visit again",
  "come back",
  "return",
];

/** Words that mark a closing sentence as carrying a verdict. */
const VERDICT_WORDS = [
  "haunt",
  "again",
  "return",
  "recommend",
  "avoid",
  "never",
  "always",
  "worth",
  "skip",
  "stay",
  "leave",
  "regret",
  "love",
  "hate",
];

/** Alien / visitor angle markers that keep the line on premise. */
const VISITOR_WORDS = [
  "planet",
  "earth",
  "breathing",
  "food",
  "checkout",
  "onboarding",
  "tourist",
  "visitor",
  "alien",
  "human",
  "gravity",
  "weather",
];

// ---------------------------------------------------------------------------
// Small single-purpose helpers.
// ---------------------------------------------------------------------------

/** Count characters as Unicode code points, not UTF-16 units. */
function countChars(text: string): number {
  return [...text].length;
}

/** True when the text is empty or only whitespace. */
function isBlank(text: string): boolean {
  return text.trim().length === 0;
}

/** True when the text contains a line break of any kind. */
function hasLineBreak(text: string): boolean {
  return text.includes("\n") || text.includes("\r");
}

/** Split a line into its sentences on sentence-ending punctuation. */
function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

/** Lower-cased haystack lookup for a list of marker words. */
function containsAny(text: string, words: readonly string[]): boolean {
  const lower = text.toLowerCase();
  return words.some((word) => lower.includes(word));
}

/** True when the line carries a rating or review wording. */
function carriesRatingOrReviewWording(text: string): boolean {
  return containsAny(text, RATING_WORDS);
}

/** True when the closing sentence carries a verdict word. */
function closingCarriesVerdict(text: string): boolean {
  const sentences = splitSentences(text);
  if (sentences.length === 0) return false;
  const closing = sentences[sentences.length - 1];
  return containsAny(closing, VERDICT_WORDS);
}

/** True when the line keeps an alien-visitor angle on Earth. */
function keepsVisitorAngle(text: string): boolean {
  return containsAny(text, VISITOR_WORDS);
}

/**
 * Resolve the directory that holds this script, from its own URL.
 * This is the whole fix for entry 1: the grader runs
 * `node /bot/main.ts` from a working directory that is not /bot, so a
 * bare relative path like "line.txt" resolves against the wrong
 * directory and the read fails. Anchoring to import.meta.url makes
 * the read independent of the caller's cwd.
 */
function scriptDir(): string {
  return dirname(fileURLToPath(import.meta.url));
}

/** Resolve the output directory from the environment or the default. */
function outputDir(): string {
  const fromEnv = process.env[OUTPUT_DIR_ENV];
  if (fromEnv !== undefined && fromEnv.trim().length > 0) {
    return resolve(fromEnv);
  }
  return DEFAULT_OUTPUT_DIR;
}

// ---------------------------------------------------------------------------
// Validation: returns the list of named gate problems, empty when valid.
// ---------------------------------------------------------------------------

type GateProblem =
  | "blank"
  | "too_short"
  | "too_long"
  | "multi_line"
  | "no_rating_or_review_wording"
  | "closing_has_no_verdict"
  | "no_visitor_angle";

function validateLine(text: string): GateProblem[] {
  const problems: GateProblem[] = [];
  const length = countChars(text);

  if (isBlank(text)) problems.push("blank");
  if (length < MIN_CHARS) problems.push("too_short");
  if (length > MAX_CHARS) problems.push("too_long");
  if (hasLineBreak(text)) problems.push("multi_line");
  if (!carriesRatingOrReviewWording(text)) {
    problems.push("no_rating_or_review_wording");
  }
  if (!closingCarriesVerdict(text)) {
    problems.push("closing_has_no_verdict");
  }
  if (!keepsVisitorAngle(text)) {
    problems.push("no_visitor_angle");
  }

  return problems;
}

// ---------------------------------------------------------------------------
// Diagnostics.
// ---------------------------------------------------------------------------

interface LineReport {
  chars: number;
  bytes: number;
  sentences: number;
  rating: boolean;
  verdict: boolean;
  visitorAngle: boolean;
}

function describeLine(text: string): LineReport {
  return {
    chars: countChars(text),
    bytes: Buffer.byteLength(text, "utf8"),
    sentences: splitSentences(text).length,
    rating: carriesRatingOrReviewWording(text),
    verdict: closingCarriesVerdict(text),
    visitorAngle: keepsVisitorAngle(text),
  };
}

function printReport(
  linePath: string,
  outputPath: string,
  report: LineReport,
): void {
  console.log("alien-field-notes entry 2: ok");
  console.log(`  line:    ${linePath}`);
  console.log(`  output:  ${outputPath}`);
  console.log(`  chars:   ${report.chars} (gate ${MIN_CHARS}-${MAX_CHARS})`);
  console.log(`  bytes:   ${report.bytes}`);
  console.log(`  sentences: ${report.sentences}`);
  console.log(`  rating/review wording: ${report.rating}`);
  console.log(`  closing verdict:       ${report.verdict}`);
  console.log(`  visitor angle:         ${report.visitorAngle}`);
}

// ---------------------------------------------------------------------------
// Main.
// ---------------------------------------------------------------------------

function main(): number {
  const dir = scriptDir();
  const linePath = join(dir, LINE_FILE_NAME);
  const outDir = outputDir();
  const outputPath = join(outDir, OUTPUT_FILE_NAME);

  let raw: string;
  try {
    raw = readFileSync(linePath, "utf8");
  } catch (error) {
    console.error(
      `gate failure: cannot_read_line_file (${linePath}): ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return 1;
  }

  // The file is stored without a trailing newline; strip a UTF-8 BOM
  // and any trailing line breaks defensively, so a stray BOM or
  // newline can never leak into the entry or turn a valid line into a
  // multi-line one — but keep every other byte exactly as written.
  const line = raw
    .replace(/^\uFEFF/, "")
    .replace(/(?:\r?\n)+$/, "");

  const problems = validateLine(line);
  if (problems.length > 0) {
    for (const problem of problems) {
      console.error(`gate failure: ${problem}`);
    }
    return 1;
  }

  try {
    mkdirSync(outDir, { recursive: true });
    writeFileSync(outputPath, line, "utf8");
  } catch (error) {
    console.error(
      `gate failure: cannot_write_output (${outputPath}): ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return 1;
  }

  printReport(linePath, outputPath, describeLine(line));
  return 0;
}

process.exitCode = main();
