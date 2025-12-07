import { readFileInLines } from "../utils/files";
import { stringToNumber } from "../utils/numbers";
import { Puzzle } from "../utils/puzzle";

export default class extends Puzzle {
  readonly expectedTestResult = 14;

  async solution(inputPath: string): Promise<number> {
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
