/**
 * Gemini Multimodal Live API Service
 * 
 * Manages low-latency real-time bidirectional audio streaming over WebSockets:
 * - Audio Input: 16kHz 16-bit Linear PCM from patient mic
 * - Audio Output: 24kHz Linear PCM synthesized speech with barge-in interruption
 * - Protocol: Google Generative Language BidiGenerateContent
 * - Model: gemini-2.0-flash-realtime
 * - Clinical Safety: In-turn tool calling for chief complaint & red-flags, never diagnoses/prescribes.
 * - Dual-Mode: If no API key is provided, gracefully falls back to browser speech synthesis.
 */

import { nativeAudioService } from './nativeAudioService';

export interface LiveSessionCallbacks {
  onAudioOutputChunk?: (pcmBuffer: ArrayBuffer) => void;
  onTranscription?: (speaker: 'kiosk' | 'patient', text: string) => void;
  onToolCall?: (functionName: string, args: Record<string, any>) => void;
  onError?: (error: Error | string) => void;
  onStateChange?: (state: 'idle' | 'connecting' | 'connected' | 'listening' | 'speaking' | 'error') => void;
}

export class GeminiLiveService {
  private apiKey: string;
  private ws: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private isConnected: boolean = false;
  private isSimulated: boolean = false;
  private callbacks: LiveSessionCallbacks = {};

  constructor(apiKey?: string) {
    this.apiKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY || '';
  }

  public setCallbacks(callbacks: LiveSessionCallbacks) {
    this.callbacks = callbacks;
  }

  /**
   * Connects to the Gemini Multimodal Live WebSocket or starts simulated speech engine
   */
  public async connect(): Promise<boolean> {
    if (!this.apiKey) {
      console.info("[GeminiLive] No GEMINI_API_KEY provided. Operating in high-fidelity interactive simulation mode.");
      this.isSimulated = true;
      this.callbacks.onStateChange?.('connected');
      return true;
    }

    try {
      this.callbacks.onStateChange?.('connecting');
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${this.apiKey}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("[GeminiLive] WebSocket connection established.");
        this.isConnected = true;
        this.callbacks.onStateChange?.('connected');
        this.sendSetupMessage();
      };

      this.ws.onmessage = async (event) => {
        try {
          let data: any;
          if (event.data instanceof Blob) {
            const text = await event.data.text();
            data = JSON.parse(text);
          } else {
            data = JSON.parse(event.data);
          }
          this.handleServerMessage(data);
        } catch (e) {
          console.warn("[GeminiLive] Failed to parse message:", e);
        }
      };

      this.ws.onerror = (err) => {
        console.warn("[GeminiLive] WebSocket error, falling back to simulated voice:", err);
        this.isSimulated = true;
        this.callbacks.onStateChange?.('connected');
      };

      this.ws.onclose = () => {
        console.log("[GeminiLive] WebSocket connection closed.");
        this.isConnected = false;
        this.callbacks.onStateChange?.('idle');
      };

      return true;
    } catch (err: any) {
      console.warn("[GeminiLive] Connection error, activating simulation mode:", err);
      this.isSimulated = true;
      this.callbacks.onStateChange?.('connected');
      return true;
    }
  }

  /**
   * Sends the initial clinical setup configuration & tool definitions
   */
  private sendSetupMessage() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const setupMsg = {
      setup: {
        model: "models/gemini-2.0-flash-realtime-exp",
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: "Aoede" // Warm, clear clinical assistant voice
              }
            }
          }
        },
        systemInstruction: {
          parts: [
            {
              text: `You are MediKiosk, an empathetic, polite AI hospital pre-consultation kiosk at the primary health center.
You speak clearly and warmly in English, Hindi, and Hinglish based on the patient's language.
Strict Clinical Rules:
1. You NEVER diagnose, recommend treatment, or prescribe medications.
2. Your purpose is solely to elicit the patient's chief complaint, duration, severity, and prior medical history.
3. If the patient mentions red flags (severe chest pain, breathing difficulty, sudden weakness, severe bleeding), immediately invoke 'flag_red_flag'.
4. In-turn invoke tool calls to structure the patient's health details for Dr. Anjali Verma.`
            }
          ]
        },
        tools: [
          {
            functionDeclarations: [
              {
                name: "record_chief_complaint",
                description: "Records the patient's primary complaint, duration, and severity.",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    complaint: { type: "STRING" },
                    duration: { type: "STRING" },
                    severity: { type: "STRING" }
                  },
                  required: ["complaint"]
                }
              },
              {
                name: "flag_red_flag",
                description: "Escalates serious or acute clinical symptoms to the triage nurse.",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    symptom: { type: "STRING" },
                    severity: { type: "STRING" }
                  },
                  required: ["symptom"]
                }
              },
              {
                name: "record_ayush_assessment",
                description: "Records Ayurvedic/AYUSH physical constitution indicators.",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    prakriti: { type: "STRING" },
                    agni: { type: "STRING" },
                    koshtha: { type: "STRING" }
                  }
                }
              }
            ]
          }
        ]
      }
    };

    this.ws.send(JSON.stringify(setupMsg));
  }

  /**
   * Dispatches incoming audio and tool responses from Gemini Live
   */
  private handleServerMessage(data: any) {
    if (data.serverContent) {
      const parts = data.serverContent.modelTurn?.parts || [];
      for (const part of parts) {
        if (part.inlineData && part.inlineData.mimeType?.startsWith('audio/pcm')) {
          const base64Audio = part.inlineData.data;
          const binaryStr = window.atob(base64Audio);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          this.playPCMChunk(bytes.buffer);
          this.callbacks.onAudioOutputChunk?.(bytes.buffer);
          this.callbacks.onStateChange?.('speaking');
        }
        if (part.text) {
          this.callbacks.onTranscription?.('kiosk', part.text);
        }
      }
    }

    if (data.toolCall) {
      for (const call of data.toolCall.functionCalls || []) {
        console.log(`[GeminiLive] Tool call invoked: ${call.name}`, call.args);
        this.callbacks.onToolCall?.(call.name, call.args);

        // Acknowledge tool response
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({
            toolResponse: {
              functionResponses: [
                {
                  response: { output: { success: true } },
                  id: call.id
                }
              ]
            }
          }));
        }
      }
    }
  }

  private outputAudioContext: AudioContext | null = null;
  private nextPlayTime: number = 0;
  private processorNode: ScriptProcessorNode | null = null;
  private recognition: any = null;

  /**
   * Plays incoming 24kHz Linear PCM speech buffer from Gemini Live
   */
  private playPCMChunk(pcmBuffer: ArrayBuffer) {
    try {
      if (!this.outputAudioContext) {
        this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000
        });
      }
      if (this.outputAudioContext.state === 'suspended') {
        this.outputAudioContext.resume();
      }

      const int16 = new Int16Array(pcmBuffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
      }

      const audioBuffer = this.outputAudioContext.createBuffer(1, float32.length, 24000);
      audioBuffer.getChannelData(0).set(float32);

      const source = this.outputAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outputAudioContext.destination);

      const now = this.outputAudioContext.currentTime;
      if (this.nextPlayTime < now) {
        this.nextPlayTime = now;
      }
      source.start(this.nextPlayTime);
      this.nextPlayTime += audioBuffer.duration;
    } catch (e) {
      console.warn("[GeminiLive] Audio PCM playback error:", e);
    }
  }

  /**
   * Captures patient mic audio at 16kHz PCM and streams to Gemini Live WebSocket
   */
  public async startAudioCapture(): Promise<void> {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000
      });

      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.processorNode = this.audioContext.createScriptProcessor(4096, 1, 1);

      this.processorNode.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        let binary = '';
        const bytes = new Uint8Array(pcm16.buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Audio = window.btoa(binary);

        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({
            realtimeInput: {
              mediaChunks: [
                {
                  mimeType: "audio/pcm",
                  data: base64Audio
                }
              ]
            }
          }));
        }
      };

      source.connect(this.processorNode);
      this.processorNode.connect(this.audioContext.destination);

      // Browser Speech Recognition for live caption transcript
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-IN';
        this.recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript.trim()) {
            this.callbacks.onTranscription?.('patient', transcript);
          }
        };
        try {
          this.recognition.start();
        } catch {}
      }

      this.callbacks.onStateChange?.('listening');
    } catch (err) {
      console.warn("[GeminiLive] Mic capture initialization error:", err);
    }
  }

  public stopAudioCapture() {
    if (this.processorNode) {
      this.processorNode.disconnect();
      this.processorNode = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }
    if (this.recognition) {
      try { this.recognition.stop(); } catch {}
      this.recognition = null;
    }
    this.callbacks.onStateChange?.('connected');
  }

  /**
   * Speaks a prompt verbally. If in simulated mode or Web Speech available, plays audio aloud.
   */
  public speakText(text: string, lang: string = 'en-IN') {
    this.callbacks.onTranscription?.('kiosk', text);
    const audioLang = lang.toLowerCase().startsWith('hi') ? 'hi' : 'en';
    nativeAudioService.speak(text, audioLang, () => {
      this.callbacks.onStateChange?.('listening');
    });
    this.callbacks.onStateChange?.('speaking');
  }

  /**
   * Simulates patient voice input
   */
  public simulatePatientSpeech(text: string) {
    this.callbacks.onTranscription?.('patient', text);
    this.callbacks.onStateChange?.('listening');
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isConnected = false;
    this.callbacks.onStateChange?.('idle');
  }
}
