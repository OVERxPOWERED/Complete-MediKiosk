import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Terminal, 
  X, 
  Key, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Trash2, 
  Copy, 
  Download,
  Mic,
  Volume2,
  Cpu
} from 'lucide-react';
import { liveLogger, LiveLogEntry } from '../../services/liveLogger';
import { apiKeyManager, KeyStatus } from '../../services/apiKeyManager';

interface LiveDiagnosticsDrawerProps {
  voiceState: string;
  currentLanguage: string;
  activeScreen: string;
}

export const LiveDiagnosticsDrawer: React.FC<LiveDiagnosticsDrawerProps> = ({
  voiceState,
  currentLanguage,
  activeScreen
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LiveLogEntry[]>([]);
  const [keyStatuses, setKeyStatuses] = useState<KeyStatus[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [simText, setSimText] = useState('');
  const logsEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Subscribe to live logs
    const unsubscribe = liveLogger.subscribe((updatedLogs) => {
      setLogs(updatedLogs);
    });

    // Update key pool status periodically
    const interval = setInterval(() => {
      setKeyStatuses(apiKeyManager.getKeyPoolStatus());
    }, 1500);

    setKeyStatuses(apiKeyManager.getKeyPoolStatus());

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const healthyKeyCount = keyStatuses.filter(k => Date.now() >= k.lastCooldownUntil).length;

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(liveLogger.exportAsText());
    alert('Diagnostics log copied to clipboard!');
  };

  const handleDownloadLogs = () => {
    const text = liveLogger.exportAsText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medikiosk-telemetry-${new Date().toISOString().replace(/[:.]/g, '-')}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Floating Diagnostics Trigger Capsule in Bottom-Right Corner */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-3 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium shadow-lg transition-all duration-200 border"
        style={{
          backgroundColor: isOpen ? '#004D40' : '#ffffff',
          color: isOpen ? '#ffffff' : '#004D40',
          borderColor: 'rgba(0, 77, 64, 0.2)'
        }}
        title="Toggle Real-Time API & Communication Diagnostics"
      >
        <div className="flex items-center gap-1.5">
          <span 
            className="w-2 h-2 rounded-full animate-pulse" 
            style={{ backgroundColor: healthyKeyCount > 0 ? '#10b981' : '#ef4444' }} 
          />
          <Activity size={13} />
          <span className="font-semibold">Live Telemetry</span>
          <span 
            className="px-1.5 py-0.5 rounded text-[10px]"
            style={{ 
              backgroundColor: isOpen ? 'rgba(255,255,255,0.2)' : 'rgba(0,77,64,0.08)',
              color: isOpen ? '#ffffff' : '#00796B'
            }}
          >
            {healthyKeyCount}/{keyStatuses.length} Keys
          </span>
        </div>
      </button>

      {/* Slide-Up Diagnostic Drawer */}
      {isOpen && (
        <div 
          className="fixed bottom-12 right-4 z-50 w-[540px] max-w-[95vw] h-[480px] max-h-[75vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border"
          style={{
            backgroundColor: '#0f172a',
            borderColor: 'rgba(255, 255, 255, 0.12)',
            color: '#e2e8f0',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal size={16} className="text-emerald-400" />
              <span className="text-xs font-bold tracking-wider text-slate-100 uppercase">
                Communication & API Diagnostics
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                LIVE
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleCopyLogs}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                title="Copy logs"
              >
                <Copy size={13} />
              </button>
              <button 
                onClick={handleDownloadLogs}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                title="Download telemetry"
              >
                <Download size={13} />
              </button>
              <button 
                onClick={() => liveLogger.clear()}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
                title="Clear logs"
              >
                <Trash2 size={13} />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Quick Telemetry Bar */}
          <div className="grid grid-cols-4 gap-2 px-3 py-2 bg-slate-950/80 border-b border-slate-800/80 text-[11px]">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-slate-500">Screen</span>
              <span className="font-semibold text-emerald-400 truncate">{activeScreen}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-slate-500">Voice State</span>
              <span className="font-semibold text-amber-400 uppercase truncate">{voiceState}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-slate-500">ASR Language</span>
              <span className="font-semibold text-cyan-400">{currentLanguage === 'hi' ? 'hi-IN' : 'en-IN'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-slate-500">Active Keys</span>
              <span className="font-semibold text-emerald-400">{healthyKeyCount} of {keyStatuses.length} OK</span>
            </div>
          </div>

          {/* Key Pool Status Pills */}
          <div className="px-3 py-1.5 bg-slate-900/60 border-b border-slate-800/60 flex flex-wrap gap-1.5 text-[10px]">
            {keyStatuses.map((k, i) => {
              const isCoolingDown = Date.now() < k.lastCooldownUntil;
              return (
                <div 
                  key={i} 
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded border ${
                    isCoolingDown 
                      ? 'bg-rose-950/50 border-rose-800 text-rose-300' 
                      : 'bg-slate-800/80 border-slate-700 text-slate-300'
                  }`}
                  title={`${k.name}: ${k.successCount} OK, ${k.failCount} failed`}
                >
                  <Key size={10} className={isCoolingDown ? 'text-rose-400' : 'text-emerald-400'} />
                  <span>{k.name}</span>
                  <span className="text-[9px] opacity-70">({k.maskedKey})</span>
                  {isCoolingDown ? (
                    <span className="text-[9px] text-rose-400 font-bold">COOLDOWN</span>
                  ) : (
                    <span className="text-[9px] text-emerald-400">✓</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Real-time Scrolling Log Feed */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1 text-[11px] leading-relaxed select-text">
            {logs.length === 0 ? (
              <div className="text-center py-10 text-slate-500 italic text-xs">
                Listening for kiosk communication events...
              </div>
            ) : (
              logs.map((log) => {
                const categoryColors: Record<string, string> = {
                  SPEECH: 'text-emerald-400 border-emerald-800 bg-emerald-950/40',
                  API: 'text-cyan-400 border-cyan-800 bg-cyan-950/40',
                  AUDIO: 'text-purple-400 border-purple-800 bg-purple-950/40',
                  NAV: 'text-blue-400 border-blue-800 bg-blue-950/40',
                  STATE: 'text-amber-400 border-amber-800 bg-amber-950/40',
                  ERROR: 'text-rose-400 border-rose-800 bg-rose-950/50',
                  SYSTEM: 'text-slate-400 border-slate-700 bg-slate-800/40'
                };

                const tagClass = categoryColors[log.category] || categoryColors.SYSTEM;

                return (
                  <div key={log.id} className="flex items-start gap-2 hover:bg-slate-800/40 px-1.5 py-0.5 rounded transition">
                    <span className="text-slate-500 shrink-0 text-[10px] select-none">{log.timestamp}</span>
                    <span className={`px-1 rounded text-[9px] uppercase font-bold border shrink-0 ${tagClass}`}>
                      {log.category}
                    </span>
                    <span className={`break-words flex-1 ${
                      log.level === 'error' ? 'text-rose-300 font-medium' :
                      log.level === 'warn' ? 'text-amber-300' :
                      log.level === 'success' ? 'text-emerald-300' : 'text-slate-200'
                    }`}>
                      {log.message}
                      {log.details && (
                        <span className="block text-[10px] text-slate-400 mt-0.5 opacity-85">
                          {typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details)}
                        </span>
                      )}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={logsEndRef} />
          </div>

          {/* Simulate Patient Voice Input Test Bar */}
          <div className="px-3 py-2 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={simText}
              onChange={(e) => setSimText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && simText.trim()) {
                  (window as any).__medikioskVoice?.handlePatientSpokenInput(simText.trim(), true);
                  setSimText('');
                }
              }}
              placeholder="Simulate speech (e.g. 'केवल आज के लिए', 'सिरदर्द और बुखार')..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => {
                if (simText.trim()) {
                  (window as any).__medikioskVoice?.handlePatientSpokenInput(simText.trim(), true);
                  setSimText('');
                }
              }}
              className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded transition"
            >
              Simulate
            </button>
          </div>

          {/* Footer with Auto-Scroll Toggle */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-t border-slate-800 text-[10px] text-slate-400">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200 select-none">
              <input 
                type="checkbox" 
                checked={autoScroll} 
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0 w-3 h-3"
              />
              <span>Auto-scroll</span>
            </label>
            <span>{logs.length} logs recorded · Accessible in console via <code className="text-emerald-400">__MEDIKIOSK_LOGS__</code></span>
          </div>
        </div>
      )}
    </>
  );
};
