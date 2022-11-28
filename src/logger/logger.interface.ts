export interface ILogger {
    info(...args: any): void;
    warn(...args: any): void;
    error(...args: any): void;
}
