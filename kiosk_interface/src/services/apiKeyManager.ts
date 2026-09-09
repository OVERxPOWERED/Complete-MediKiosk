/**
 * Multi-API Key Manager & Intelligent Rotator for Gemini AI
 * 
 * Manages pool of Gemini API keys:
 * - Shuffles / round-robins requests across multiple keys
 * - Automatically detects rate limits (429), quota limits (403/ResourceExhausted), or server spikes (503)
 * - Automatically cools down exhausted keys (60s) and retries with the next healthy key seamlessly
 */

export interface KeyStatus {
  key: string;
  name: string;
  failCount: number;
  lastCooldownUntil: number;
}

export const VALID_GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-2.0-flash'
];

class ApiKeyManager {
  private keyPool: KeyStatus[] = [];
  private currentIndex: number = 0;

  constructor() {
    this.initPool();
  }

  private initPool() {
    const keys: { name: string; key: string }[] = [];

    const k0 = import.meta.env.VITE_GEMINI_API_KEY;
    const k1 = import.meta.env.VITE_GEMINI_API_KEY1;
    const k2 = import.meta.env.VITE_GEMINI_API_KEY2;

    if (k0) keys.push({ name: 'VITE_GEMINI_API_KEY', key: k0 });
    if (k1) keys.push({ name: 'VITE_GEMINI_API_KEY1', key: k1 });
    if (k2) keys.push({ name: 'VITE_GEMINI_API_KEY2', key: k2 });

    this.keyPool = keys.map(k => ({
      key: k.key,
      name: k.name,
      failCount: 0,
      lastCooldownUntil: 0
    }));

    // Randomize initial starting point for true shuffled load balancing
    if (this.keyPool.length > 0) {
      this.currentIndex = Math.floor(Math.random() * this.keyPool.length);
      console.log(`[ApiKeyManager] Initialized with ${this.keyPool.length} keys in shuffled pool.`);
    } else {
      console.warn("[ApiKeyManager] No Gemini API keys found in environment variables!");
    }
  }

  /**
   * Returns the next healthy key from the pool
   */
  public getActiveKey(): string {
    if (this.keyPool.length === 0) return '';

    const now = Date.now();
    // Search for a healthy key not in cooldown
    for (let i = 0; i < this.keyPool.length; i++) {
      const idx = (this.currentIndex + i) % this.keyPool.length;
      const entry = this.keyPool[idx];
      if (now >= entry.lastCooldownUntil) {
        this.currentIndex = (idx + 1) % this.keyPool.length;
        return entry.key;
      }
    }

    // If all are cooling down, use the one whose cooldown expires earliest
    let earliest = this.keyPool[0];
    for (const item of this.keyPool) {
      if (item.lastCooldownUntil < earliest.lastCooldownUntil) {
        earliest = item;
      }
    }
    return earliest.key;
  }

  /**
   * Marks a key as rate-limited or failed with a 60s cooldown
   */
  public markKeyCooldown(key: string, reason: string = 'RateLimit') {
    const entry = this.keyPool.find(k => k.key === key);
    if (entry) {
      entry.failCount++;
      entry.lastCooldownUntil = Date.now() + 60000; // 60s cooldown
      console.warn(`[ApiKeyManager] Cooldown applied to ${entry.name} for 60s (Reason: ${reason}). Switching to next key.`);
    }
  }

  /**
   * Executes a Gemini API request function with automatic failover and key rotation across the pool
   */
  public async executeWithRotation<T>(
    requestFn: (apiKey: string, model: string) => Promise<T>,
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

        const currentKey = this.getActiveKey();
        try {
          const result = await requestFn(currentKey, model);
          return result;
        } catch (err: any) {
          lastError = err;
          const errMsg = String(err?.message || err);
          const isRateLimit = errMsg.includes('429') || errMsg.includes('Quota') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('503');

          if (isRateLimit) {
            this.markKeyCooldown(currentKey, errMsg.slice(0, 50));
          } else {
            console.warn(`[ApiKeyManager] API call failed with model ${model}:`, err);
          }
        }
      }
    }

    throw lastError || new Error("All Gemini API keys and models failed");
  }
}

export const apiKeyManager = new ApiKeyManager();
