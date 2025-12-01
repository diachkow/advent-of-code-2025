import { existsSync } from "fs";

const day = process.argv[2];
if (!day) {
  console.error("Usage: bun solve day01");
  process.exit(1);
}

async function execute(path: string): void {
  try {
    const { solve } = await import(path);

    if (typeof solve !== "function") {
      console.error(`No 'solve' function found in ${path}`);
      process.exit(1);
    }

    await solve();
  } catch (error) {
    console.error(`Failed to run ${day}:`, error);
    process.exit(1);
  }
}

const partOnePath = `./puzzles/${day}/part01.ts`;
if (!existsSync(partOnePath)) {
  console.error(`Solution not found: ${partOnePath}`);
  process.exit(1);
}

console.log("Running solution for part one");
await execute(partOnePath);

const partTwoPath = `./puzzles/${day}/part02.ts`;
if (!existsSync(partTwoPath)) {
  console.log(`Solution for part two not found at ${partTwoPath}`);
  process.exit(0);
}

console.log("Running solution for part two");
await execute(partTwoPath);
