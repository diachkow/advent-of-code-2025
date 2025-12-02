import assert from "../utils/assert";
import { readEntireFile } from "../utils/files";
import { stringToNumber } from "../utils/numbers";

export async function solve() {
  const testResult = await findInvalidIDsSum(`${import.meta.dir}/test.input.txt`);
  assert(
    testResult === 4174379265,
    `Invalid test result. Expected: 1227775554, Got: ${testResult}`,
  );

  const actualResult = await findInvalidIDsSum(`${import.meta.dir}/actual.input.txt`);
  console.log(`Sum of all invalid IDs is ${actualResult}`);
}

async function findInvalidIDsSum(path: string): Promise<number> {
  const input = await readEntireFile(path);
  const rawRanges = input.split(",");
  let result = 0;

  for (let i = 0; i < rawRanges.length; i++) {
    const numbers = rawRanges[i]!.split("-");
    if (numbers.length !== 2) {
      throw new Error(`Invalid IDs range: ${rawRanges[i]}`);
    }
    const start = stringToNumber(numbers[0]!);
    const end = stringToNumber(numbers[1]!);

    for (let num = start; num <= end; num++) {
      if (isInvalidID(num)) {
        // console.log(`Number ${num} is invalid ID, adding it to the result sum`);
        result += num;
      }
    }
  }

  return result;
}

function isInvalidID(n: number): boolean {
  const numOfDigits = Math.floor(Math.log10(n)) + 1;
  if (numOfDigits === 1) return false;

  const maxPatternLen = Math.floor(numOfDigits / 2);
  for (let patternLen = 1; patternLen <= maxPatternLen; patternLen++) {
    if (numOfDigits % patternLen !== 0) continue;

    const numOfRepeats = numOfDigits / patternLen;
    const div = Math.pow(10, patternLen);
    const pattern = Math.floor(n / Math.pow(10, numOfDigits - patternLen));

    let reconstructured = 0;
    for (let i = 0; i < numOfRepeats; i++) {
      reconstructured = reconstructured * div + pattern;
    }

    if (reconstructured === n) return true;
  }

  return false;
}
