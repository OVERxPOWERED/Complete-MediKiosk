/**
 * Live Communication & API Diagnostic Logger
 * 
 * Records continuous, timestamped operational telemetry across:
 * - Speech Recognition inputs (interim & final)
 * - Gemini AI API requests, latency, active key, and error codes
 * - VoiceOrb state transitions (idle, listening, processing, speaking)
 * - Audio playback events and watchdog safety timers
 * - Screen navigation events
 * 
 * Persists to localStorage, in-memory ring buffer, and browser console.
 */

export type LogCategory = 'SPEECH' | 'API' | 'AUDIO' | 'NAV' | 'STATE' | 'ERROR' | 'SYSTEM';

export interface LiveLogEntry {
  id: string;
  timestamp: string;
  timeMs: number;
  category: LogCategory;
  message: string;
  details?: any;
  level: 'info' | 'warn' | 'error' | 'success';
}

class LiveLoggerService {
  private logs: LiveLogEntry[] = [];
  private maxLogs: number = 300;
  private listeners: ((logs: LiveLogEntry[]) => void)[] = [];

  constructor() {
    // Load existing logs from localStorage if available
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('medikiosk_live_logs');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            this.logs = parsed.slice(-100);
          }
        }
      } catch (e) {}

      // Expose globally for browser console debugging
      (window as any).__MEDIKIOSK_LOGS__ = this.logs;
      (window as any).__GET_LOGS__ = () => this.getLogs();
      (window as any).__CLEAR_LOGS__ = () => this.clear();
      (window as any).__EXPORT_LOGS__ = () => this.exportAsText();
    }
  }

  public log(
    category: LogCategory,
    message: string,
    details?: any,
    level: 'info' | 'warn' | 'error' | 'success' = 'info'
  ) {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');

    const entry: LiveLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: timeStr,
      timeMs: Date.now(),
      category,
      message,
      details,
      level
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Persist to localStorage (debounced)
    this.persist();

    // Print to browser console with styled tag
    this.printToConsole(entry);

    // Notify active UI listeners
    this.notifyListeners();
  }

  public info(category: LogCategory, message: string, details?: any) {
    this.log(category, message, details, 'info');
  }

  public success(category: LogCategory, message: string, details?: any) {
    this.log(category, message, details, 'success');
  }

  public warn(category: LogCategory, message: string, details?: any) {
    this.log(category, message, details, 'warn');
  }

  public error(category: LogCategory, message: string, details?: any) {
    this.log(category, message, details, 'error');
  }

  public getLogs(): LiveLogEntry[] {
    return [...this.logs];
  }

  public subscribe(listener: (logs: LiveLogEntry[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.getLogs());
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    const copy = this.getLogs();
    for (const listener of this.listeners) {
      try {
        listener(copy);
      } catch (e) {}
    }
  }

  private persist() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('medikiosk_live_logs', JSON.stringify(this.logs.slice(-100)));
    } catch (e) {}
  }

  public clear() {
    this.logs = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('medikiosk_live_logs');
    }
    this.notifyListeners();
  }

  public exportAsText(): string {
    return this.logs
      .map(l => `[${l.timestamp}] [${l.category}] (${l.level.toUpperCase()}): ${l.message} ${l.details ? JSON.stringify(l.details) : ''}`)
      .join('\n');
  }

  private printToConsole(entry: LiveLogEntry) {
    const colors: Record<LogCategory, string> = {
      SPEECH: '#10b981',
      API: '#06b6d4',
      AUDIO: '#8b5cf6',
      NAV: '#3b82f6',
      STATE: '#f59e0b',
      ERROR: '#ef4444',
      SYSTEM: '#6b7280'
    };

    const color = colors[entry.category] || '#6b7280';
    const tag = `%c[${entry.timestamp}] [${entry.category}]`;
    const style = `color: ${color}; font-weight: bold;`;

    if (entry.level === 'error') {
      console.error(tag, style, entry.message, entry.details || '');
    } else if (entry.level === 'warn') {
      console.warn(tag, style, entry.message, entry.details || '');
    } else {
      console.log(tag, style, entry.message, entry.details || '');
    }
  }
}

export const liveLogger = new LiveLoggerService();
