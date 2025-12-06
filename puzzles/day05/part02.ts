import assert from "../utils/assert";
import { readFileInLines } from "../utils/files";
import { stringToNumber } from "../utils/numbers";

export async function solve(): Promise<void> {
  const testResult = await countFreshProducts(`${import.meta.dir}/test.input.txt`);
  assert(testResult === 14, `Test result is not matched. Expected: 14, Got: ${testResult}`);
  console.log(`Test result matched`);

  const actualResult = await countFreshProducts(`${import.meta.dir}/actual.input.txt`);
  console.log(`Actual result is ${actualResult}`);
}

async function countFreshProducts(inputPath: string): Promise<number> {
  const ranges = await processInput(inputPath);
  const sorted = ranges.toSorted((a, b) => a.start - b.start);

  const merged: IDRange[] = [sorted[0]!];
  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i]!;
    const lastMerged = merged[merged.length - 1]!;
    if (current.start <= lastMerged.end) {
      lastMerged.end = Math.max(current.end, lastMerged.end);
    } else {
      merged.push(current);
    }
  }

  // console.log(`Sorted: [ ${sorted.join(", ")} ]`);
  // console.log(`Merged: [ ${merged.join(", ")} ]`);

  return merged.reduce((acc, val) => acc + (val.end - val.start) + 1, 0);
}

function mergeRanges(ranges: IDRange[]): IDRange[] {
  let iterations = 0;
  while (true) {
    if (ranges.length <= 1) return ranges;

    const merged: IDRange[] = [];
    merged.push(ranges[0]!);

    let hasChanged = false;

    for (const range of ranges) {
      // console.log(`Processing range ${range}`);
      let isUnique = true;
      for (const otherRange of merged) {
        if (range === otherRange) {
          isUnique = false;
          continue;
        }

        // console.log(`Full includes check ${range} && ${otherRange}`);
        if (otherRange.includes(range.start) && otherRange.includes(range.end)) {
          // console.log(`Skipping range ${range} as it is included in ${otherRange}`);
          isUnique = false;
          hasChanged = true;
          break;
        }

        // console.log(`Start includes check ${range} && ${otherRange}`);
        if (otherRange.includes(range.start)) {
          // console.log(`Extending ${otherRange} end to ${range} end`);
          otherRange.end = range.end;
          isUnique = false;
          hasChanged = true;
          break;
        }

        // console.log(`Start includes check ${range} && ${otherRange}`);
        if (otherRange.includes(range.end)) {
          // console.log(`Extending ${otherRange} start to ${range} start`);
          otherRange.start = range.start;
          isUnique = false;
          hasChanged = true;
          break;
        }
      }

      if (isUnique) {
        // console.log(`${range} is unique`);
        merged.push(range);
      }
    }

    if (!hasChanged) {
      return merged;
    }

    console.log(`Merged after iteration ${iterations}: [ ${merged.join(", ")} ]`);
    ranges = merged.slice();
    iterations++;
  }
}

async function processInput(inputPath: string): Promise<IDRange[]> {
  const ranges: IDRange[] = [];

  for await (const line of readFileInLines(inputPath)) {
    if (line === "") break;

    const range = IDRange.fromString(line);
    ranges.push(range);
  }

  return ranges;
}

class IDRange {
  start: number;
  end: number;

  constructor(start: number, end: number) {
    this.start = start;
    this.end = end;
  }

  static fromString(s: string): IDRange {
    const parts = s.split("-");
    if (parts.length !== 2) throw new Error(`Invalid ID range format, expected x-y, got: ${s}`);

    const start = stringToNumber(parts[0]!);
    const end = stringToNumber(parts[1]!);

    return new IDRange(start, end);
  }

  includes(n: number): boolean {
    return n >= this.start && n <= this.end;
  }

  toString(): string {
    return `[${this.start}-${this.end}]`;
  }
}
