export default class Logger {
  private static print = !!process.env.IODOME_DEBUG;

  static log(...args: any[]) {
    if (this.print) console.log("[iodome][LOG]", ...args);
  }

  static warn(...args: any[]) {
    if (this.print) console.warn("[iodome][WARN]", ...args);
  }

  static error(...args: any[]) {
    if (this.print) console.error("[iodome][ERROR]", ...args);
  }
}
