/**
 * Multi-API Key Manager & Intelligent Rotator for Gemini AI
 * 
 * Manages pool of Gemini API keys:
 * - Shuffles / round-robins requests across multiple keys
 * - Dynamically discovers all VITE_GEMINI_API_KEY* and GEMINI_API_KEY* entries in .env
 * - Prioritizes proven, fast models (gemini-3.5-flash) with failover to gemini-flash-latest
 * - Automatically cools down exhausted keys (60s) and retries with the next healthy key seamlessly
 * - Records continuous real-time diagnostic telemetry via LiveLogger
 */

import { liveLogger } from './liveLogger';

export interface KeyStatus {
  key: string;
  name: string;
  maskedKey: string;
  failCount: number;
  successCount: number;
  lastCooldownUntil: number;
}

export const VALID_GEMINI_MODELS = [
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-3.6-flash'
];

class ApiKeyManager {
  private keyPool: KeyStatus[] = [];
  private currentIndex: number = 0;

  constructor() {
    this.initPool();
  }

  private initPool() {
    const env = (import.meta as any).env || {};
    const keys: { name: string; key: string }[] = [];

    // Dynamically scan for all GEMINI_API_KEY variables in Vite env
    for (const [keyName, val] of Object.entries(env)) {
      if (typeof val === 'string' && val.trim() && keyName.includes('GEMINI_API_KEY')) {
        const trimmed = val.trim().replace(/^["']|["']$/g, '');
        if (!keys.some(k => k.key === trimmed)) {
          keys.push({ name: keyName, key: trimmed });
        }
      }
    }

    // Direct fallback if dynamic iteration misses prefixed keys
    const directKeys: [string, string | undefined][] = [
      ['VITE_GEMINI_API_KEY', env.VITE_GEMINI_API_KEY],
      ['VITE_GEMINI_API_KEY1', env.VITE_GEMINI_API_KEY1],
      ['VITE_GEMINI_API_KEY2', env.VITE_GEMINI_API_KEY2],
      ['VITE_GEMINI_API_KEY3', env.VITE_GEMINI_API_KEY3],
      ['GEMINI_API_KEY_0', env.GEMINI_API_KEY_0],
      ['GEMINI_API_KEY_1', env.GEMINI_API_KEY_1],
      ['GEMINI_API_KEY_2', env.GEMINI_API_KEY_2],
      ['GEMINI_API_KEY_3', env.GEMINI_API_KEY_3],
    ];

    for (const [kName, kVal] of directKeys) {
      if (kVal && typeof kVal === 'string' && kVal.trim()) {
        const clean = kVal.trim().replace(/^["']|["']$/g, '');
        if (!keys.some(k => k.key === clean)) {
          keys.push({ name: kName, key: clean });
        }
      }
    }

    this.keyPool = keys.map(k => ({
      key: k.key,
      name: k.name,
      maskedKey: k.key.length > 16 ? `${k.key.slice(0, 10)}...${k.key.slice(-4)}` : '****',
      failCount: 0,
      successCount: 0,
      lastCooldownUntil: 0
    }));

    if (this.keyPool.length > 0) {
      this.currentIndex = Math.floor(Math.random() * this.keyPool.length);
      liveLogger.success('API', `Initialized API key pool with ${this.keyPool.length} keys`, {
        keys: this.keyPool.map(k => `${k.name} (${k.maskedKey})`)
      });
    } else {
      liveLogger.error('API', 'No Gemini API keys found in environment variables!');
    }
  }

  /**
   * Returns pool status for real-time live diagnostics UI
   */
  public getKeyPoolStatus(): KeyStatus[] {
    return [...this.keyPool];
  }

  /**
   * Returns the next healthy key from the pool
   */
  public getActiveKeyEntry(): KeyStatus | null {
    if (this.keyPool.length === 0) return null;

    const now = Date.now();
    for (let i = 0; i < this.keyPool.length; i++) {
      const idx = (this.currentIndex + i) % this.keyPool.length;
      const entry = this.keyPool[idx];
      if (now >= entry.lastCooldownUntil) {
        this.currentIndex = (idx + 1) % this.keyPool.length;
        return entry;
      }
    }

    // If all are cooling down, return the one with earliest cooldown expiry
    let earliest = this.keyPool[0];
    for (const item of this.keyPool) {
      if (item.lastCooldownUntil < earliest.lastCooldownUntil) {
        earliest = item;
      }
    }
    return earliest;
  }

  public getActiveKey(): string {
    const entry = this.getActiveKeyEntry();
    return entry ? entry.key : '';
  }

  /**
   * Marks a key as rate-limited or failed with a 60s cooldown
   */
  public markKeyCooldown(key: string, reason: string = 'RateLimit') {
    const entry = this.keyPool.find(k => k.key === key);
    if (entry) {
      entry.failCount++;
      entry.lastCooldownUntil = Date.now() + 60000;
      liveLogger.warn('API', `Key ${entry.name} cooldown for 60s (${reason})`, {
        maskedKey: entry.maskedKey,
        failCount: entry.failCount
      });
    }
  }

  public recordSuccess(key: string) {
    const entry = this.keyPool.find(k => k.key === key);
    if (entry) {
      entry.successCount++;
    }
  }

  /**
   * Executes a Gemini API request function with automatic failover and key rotation across the pool
   */
  public async executeWithRotation<T>(
    requestFn: (apiKey: string, model: string, keyName: string) => Promise<T>,
    preferredModels: string[] = VALID_GEMINI_MODELS
  ): Promise<T> {
    if (this.keyPool.length === 0) {
      throw new Error("No Gemini API keys configured");
    }

    let lastError: any = null;
    const maxAttempts = Math.min(6, this.keyPool.length * preferredModels.length);
    let attempts = 0;

    for (const model of preferredModels) {
      for (let k = 0; k < this.keyPool.length; k++) {
        if (attempts >= maxAttempts) break;
        attempts++;

        const entry = this.getActiveKeyEntry();
        if (!entry) continue;

        const startTime = Date.now();
        liveLogger.info('API', `Attempting Gemini call via ${model}`, {
          key: entry.name,
          maskedKey: entry.maskedKey,
          attempt: attempts
        });

        try {
          const result = await requestFn(entry.key, model, entry.name);
          const elapsed = Date.now() - startTime;
          this.recordSuccess(entry.key);
          liveLogger.success('API', `Gemini call succeeded in ${elapsed}ms (${model})`, {
            key: entry.name,
            maskedKey: entry.maskedKey
          });
          return result;
        } catch (err: any) {
          lastError = err;
          const elapsed = Date.now() - startTime;
          const errMsg = String(err?.message || err);
          const isAuthOrQuota = errMsg.includes('401') || errMsg.includes('403') || errMsg.includes('429') || errMsg.includes('Quota') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('Abort');

          liveLogger.warn('API', `Gemini attempt failed (${elapsed}ms): ${errMsg.slice(0, 100)}`, {
            key: entry.name,
            model,
            error: errMsg
          });

          if (isAuthOrQuota) {
            this.markKeyCooldown(entry.key, errMsg.slice(0, 60));
          }
        }
      }
    }

    liveLogger.error('API', 'All pooled Gemini API keys and models exhausted', {
      lastError: String(lastError?.message || lastError)
    });
    throw lastError || new Error("All Gemini API keys and models failed");
  }
}

export const apiKeyManager = new ApiKeyManager();
