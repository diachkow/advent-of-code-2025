export default function assert(checkResult: boolean, errmsg: string): void {
  if (!checkResult) {
    console.error(errmsg);
    process.exit(1);
  }
}
