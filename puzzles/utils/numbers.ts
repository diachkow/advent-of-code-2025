export function stringToNumber(s: string): number {
  const converted = Number(s);
  if (isNaN(converted)) {
    throw new Error(`Invalid number to convert: ${s}`);
  }
  return converted;
}
