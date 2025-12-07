import { existsSync } from "fs";
import path from "path";
import type { Puzzle } from "./puzzles/utils/puzzle";

const day = process.argv[2];
if (!day) {
  console.error("Usage: bun solve day01");
  process.exit(1);
}

async function executePart(partPath: string, partName: string): Promise<void> {
  try {
    const module = await import(partPath);
    const PuzzleClass = module.default;

    if (!PuzzleClass || typeof PuzzleClass !== "function") {
      console.error(
        `Invalid puzzle structure in ${partPath}. Must export a Puzzle class as default.`,
      );
      process.exit(1);
    }

    const puzzle: Puzzle = new PuzzleClass();
    const dir = path.dirname(partPath);

    console.log(`\n${partName}:`);
    await puzzle.execute(dir);
  } catch (error) {
    console.error(`Failed to run ${partName}:`, error);
    process.exit(1);
  }
}

const partOnePath = `./puzzles/${day}/part01.ts`;
if (!existsSync(partOnePath)) {
  console.error(`Solution not found: ${partOnePath}`);
  process.exit(1);
}

await executePart(partOnePath, "Part 1");

const partTwoPath = `./puzzles/${day}/part02.ts`;
if (existsSync(partTwoPath)) {
  await executePart(partTwoPath, "Part 2");
}
