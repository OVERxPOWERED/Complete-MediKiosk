/**
 * NativeAudioService: Authentic Native Indian Voice Engine
 * 
 * Solves the issue where Linux/browser SpeechSynthesis uses an English voice to read Hindi,
 * resulting in a dense, unnatural foreign accent.
 * 
 * Streams authentic native Indian Hindi and Indian English audio directly from Google TTS,
 * providing natural, warm, and human-sounding speech for Hindi, English, and Hinglish.
 */

export type SupportedLanguage = 'hi' | 'en' | 'hinglish';

class NativeAudioService {
  private currentAudio: HTMLAudioElement | null = null;
  private isAudioPlaying: boolean = false;
  private activeText: string = '';

  /**
   * Speak aloud using native Indian pronunciation.
   * Handles Hindi, Hinglish, and Indian English.
   */
  public speak(
    text: string,
    lang: SupportedLanguage = 'hi',
    onEnd?: () => void
  ): void {
    this.stop();

    if (!text || text.trim() === '') {
      onEnd?.();
      return;
    }

    this.activeText = text;
    this.isAudioPlaying = true;

    // Clean text of markdown or special symbols
    const cleanText = text
      .replace(/[*#_`~[\]()<>]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Map language code:
    // 'hi' and 'hinglish' use 'hi' (Google's native Indian Hindi/Hinglish female voice)
    // 'en' uses 'en-IN' (Indian English accent)
    const ttsLang = lang === 'en' ? 'en-IN' : 'hi';
    const ttsUrl = `/api/tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=${ttsLang}&client=tw-ob`;

    try {
      const audio = new Audio(ttsUrl);
      this.currentAudio = audio;

      audio.onplay = () => {
        this.isAudioPlaying = true;
      };

      audio.onended = () => {
        this.isAudioPlaying = false;
        this.currentAudio = null;
        if (onEnd) onEnd();
      };

      audio.onerror = (err) => {
        console.warn('[NativeAudioService] Cloud audio failed, falling back to Web Speech:', err);
        this.fallbackSpeechSynthesis(cleanText, lang, onEnd);
      };

      // Play with user interaction watchdog
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('[NativeAudioService] Autoplay blocked or interrupted:', err);
          this.fallbackSpeechSynthesis(cleanText, lang, onEnd);
        });
      }
    } catch (err) {
      console.warn('[NativeAudioService] Error initializing Audio:', err);
      this.fallbackSpeechSynthesis(cleanText, lang, onEnd);
    }
  }

  /**
   * Fallback Web Speech Synthesis if audio streaming is unavailable
   */
  private fallbackSpeechSynthesis(
    text: string,
    lang: SupportedLanguage,
    onEnd?: () => void
  ): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.isAudioPlaying = false;
      onEnd?.();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;

      const voices = window.speechSynthesis.getVoices?.() || [];

      if (lang === 'hi' || lang === 'hinglish') {
        utterance.lang = 'hi-IN';
        // ONLY select a voice if it's an actual Hindi voice, never use an English voice for Hindi!
        const hiVoice = voices.find(v => v.lang.toLowerCase().startsWith('hi'));
        if (hiVoice) {
          utterance.voice = hiVoice;
        }
      } else {
        utterance.lang = 'en-IN';
        const enInVoice = voices.find(v => v.lang.toLowerCase().includes('en-in') || v.lang.toLowerCase().includes('en_in'));
        if (enInVoice) {
          utterance.voice = enInVoice;
        }
      }

      utterance.onend = () => {
        this.isAudioPlaying = false;
        onEnd?.();
      };

      utterance.onerror = () => {
        this.isAudioPlaying = false;
        onEnd?.();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      this.isAudioPlaying = false;
      onEnd?.();
    }
  }

  /**
   * Stop any actively playing audio immediately
   */
  public stop(): void {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {
        // ignore
      }
      this.currentAudio = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }
    }

    this.isAudioPlaying = false;
  }

  public isPlaying(): boolean {
    return this.isAudioPlaying;
  }

  public getActiveText(): string {
    return this.activeText;
  }
}

export const nativeAudioService = new NativeAudioService();
