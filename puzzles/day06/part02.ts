import assert from "../utils/assert";
import { readEntireFile } from "../utils/files";
import { stringToNumber } from "../utils/numbers";

export async function solve(): Promise<void> {
  const testResult = await calculateGrandTotal(`${import.meta.dir}/test.input.txt`);
  assert(testResult === 3263827n, `Unexpected test result. Expected: 3263827, Got: ${testResult}`);
  console.log(`Test result matched!`);

  const actualResult = await calculateGrandTotal(`${import.meta.dir}/actual.input.txt`);
  console.log(`Actual result is ${actualResult}`);
}

async function calculateGrandTotal(inputPath: string): Promise<bigint> {
  const rawInput = await readEntireFile(inputPath);
  const cols = parseInput(rawInput);
  let result = 0n;
  for (const col of cols) {
    switch (col.operator) {
      case "*":
        result += col.args.reduce((acc, val) => acc * val, 1n);
        break;
      case "+":
        result += col.args.reduce((acc, val) => acc + val, 0n);
        break;
    }
    // console.log(`Result after applying '${col.operator}' with ${col.args}: ${result}`);
  }
  return result;
}

type Operator = "+" | "*";
type ParsedInput = Array<{ args: bigint[]; operator: "+" | "*" }>;

function parseInput(s: string): ParsedInput {
  const lines = s.split("\n").filter((line) => line.length > 0);
  const operatorLineIndex = lines.length - 1;
  const lineLength = lines[operatorLineIndex]!.length;

  const result: ParsedInput = [];
  let entryStart = 0;

  for (let i = 0; i <= lineLength; i++) {
    if (i === lineLength || lines.every((l) => l[i] === " ")) {
      if (i > entryStart) {
        const operator = lines[operatorLineIndex]!.slice(entryStart, i).trim() as Operator;
        const numbers: bigint[] = [];

        for (let col = i - 1; col >= entryStart; col--) {
          let numStr = "";
          for (let row = 0; row < operatorLineIndex; row++) {
            const char = lines[row]![col];
            if (char && char !== " ") numStr += char;
          }
          if (numStr) numbers.push(BigInt(numStr));
        }

        result.push({ operator, args: numbers });
      }
      entryStart = i + 1;
    }
  }

  return result;
}
