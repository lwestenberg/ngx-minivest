import { Injectable, signal } from '@angular/core';

export interface LogEntry {
  timestamp: Date;
  message: string;
  data?: any;
}

@Injectable()
export class LoggingService {
  readonly #logs = signal<LogEntry[]>([]);

  // Public readonly signal for consuming components
  public readonly logs = this.#logs.asReadonly();

  log(message: string, data?: any) {
    const newLog: LogEntry = {
      timestamp: new Date(),
      message,
      data,
    };

    // Keep only the last 50 logs to prevent memory issues
    const currentLogs = this.#logs();
    const updatedLogs = [...currentLogs, newLog].slice(-50);
    this.#logs.set(updatedLogs);
  }

  clear() {
    this.#logs.set([]);
  }
}
