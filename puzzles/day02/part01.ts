import { readEntireFile } from "../utils/files";
import { stringToNumber } from "../utils/numbers";
import { Puzzle } from "../utils/puzzle";

export default class extends Puzzle {
  readonly expectedTestResult = 1227775554;

  async solution(inputPath: string): Promise<number> {
    const input = await readEntireFile(inputPath);
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
}

function isInvalidID(n: number): boolean {
  let numOfDigits = Math.floor(Math.log10(n)) + 1;
  if (numOfDigits % 2 !== 0) return false;

  const halfDigits = numOfDigits / 2;
  const div = Math.pow(10, halfDigits);

  const firstPart = Math.floor(n / div);
  const secondPart = n % div;

  return firstPart === secondPart;
}
