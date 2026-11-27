import React from 'react';
import { Radio, RefreshCw, Sparkles, Volume2, X } from 'lucide-react';
import type { BuddySpeechEngine } from '../../types/speakingBuddy';
import {
  FREE_NEURAL_VOICES,
  KOKORO_NATURAL_VOICES,
  type AppVoiceOption,
  type BuddyVoiceConfig,
  type FreeNeuralVoiceName,
  type KokoroEngineStatus,
  type KokoroVoiceId
} from '../../utils/speech';

export interface BuddyAudioSettingsDrawerProps {
  speechEngine: BuddySpeechEngine;
  isListening: boolean;
  onSelectEngine: (eng: BuddySpeechEngine) => void;
  recognitionLang: string;
  onSelectAccent: (lang: string) => void;
  continuousMode: boolean;
  onToggleContinuousMode: () => void;
  onOpenMicDiagnostic: () => void;
  apiKey: string;
  onOpenApiModal: () => void;
  buddyVoiceConfig: BuddyVoiceConfig;
  onUpdateBuddyVoiceConfig: (patch: Partial<BuddyVoiceConfig>) => void;
  kokoroStatus: KokoroEngineStatus;
  osVoiceOptions: AppVoiceOption[];
  onTestSelectedVoice: () => void;
  voiceTestFeedback: { tone: 'loading' | 'ok' | 'error'; message: string } | null;
  onClearVoiceTestFeedback: () => void;
}

export const BuddyAudioSettingsDrawer: React.FC<BuddyAudioSettingsDrawerProps> = ({
  speechEngine,
  isListening,
  onSelectEngine,
  recognitionLang,
  onSelectAccent,
  continuousMode,
  onToggleContinuousMode,
  onOpenMicDiagnostic,
  apiKey,
  onOpenApiModal,
  buddyVoiceConfig,
  onUpdateBuddyVoiceConfig,
  kokoroStatus,
  osVoiceOptions,
  onTestSelectedVoice,
  voiceTestFeedback,
  onClearVoiceTestFeedback
}) => {
  return (
    <div className="shrink-0 relative z-20 border-b border-slate-200 bg-white/95 backdrop-blur-xl px-5 py-4 shadow-sm animate-in fade-in duration-150 space-y-3.5">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="space-y-1.5 md:col-span-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Speech Input Engine (Your Mic · 0% Auto-Correction)
          </span>
          <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              type="button"
              disabled={isListening}
              onClick={() => onSelectEngine('live-solo')}
              className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5 ${
                speechEngine === 'live-solo'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Real-time streaming STT (< 300ms live words, 0ms post-speech wait) + recorded audio"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Live Streaming (Fastest)</span>
            </button>
            <button
              type="button"
              disabled={isListening}
              onClick={() => onSelectEngine('gemini-cloud')}
              className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5 ${
                speechEngine === 'gemini-cloud'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Live interim word preview + conditioned 16kHz WAV verified by Gemini SSE Audio (0% auto-correction)"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini Verbatim + Live</span>
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Accent Profile
          </span>
          <select
            value={recognitionLang}
            onChange={(e) => onSelectAccent(e.target.value)}
            disabled={isListening}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="en-LK">Sri Lankan English (en-LK)</option>
            <option value="en-IN">South Asian English (en-IN)</option>
            <option value="en-GB">British English (en-GB)</option>
            <option value="en-US">American English (en-US)</option>
            <option value="en-AU">Australian English (en-AU)</option>
          </select>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onToggleContinuousMode}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              continuousMode
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            <RefreshCw className="w-3 h-3" />
            <span>Hands-Free {continuousMode ? 'On' : 'Off'}</span>
          </button>
          <button
            type="button"
            onClick={onOpenMicDiagnostic}
            className="py-2 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 cursor-pointer"
          >
            Test Mic
          </button>
          <button
            type="button"
            onClick={onOpenApiModal}
            className="py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-amber-800 text-xs font-semibold border border-amber-200 cursor-pointer"
          >
            {apiKey ? 'API Ready' : 'API Key'}
          </button>
        </div>
      </div>

      {/* Row 2: 3-Engine Voice Picker (Kokoro-82M Natural AI · Edge Neural HD · OS Voice) + Live Tester */}
      <div className="max-w-6xl mx-auto pt-3 border-t border-slate-100 space-y-2.5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-4 space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Buddy Voice Engine (Choose What Works Best)
            </span>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => onUpdateBuddyVoiceConfig({ provider: 'kokoro' })}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  buddyVoiceConfig.provider === 'kokoro'
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Kokoro-82M Local Natural Neural Voices (12 US & UK voices via WebGPU / WASM)"
              >
                Kokoro AI
              </button>
              <button
                type="button"
                onClick={() => onUpdateBuddyVoiceConfig({ provider: 'neural-free' })}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  buddyVoiceConfig.provider === 'neural-free'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Microsoft Edge Neural HD Voices (Ava, Emma, Sonia, Ryan)"
              >
                Edge Neural
              </button>
              <button
                type="button"
                onClick={() => onUpdateBuddyVoiceConfig({ provider: 'standard' })}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  buddyVoiceConfig.provider === 'standard'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Offline built-in Windows / Mac / Browser voices"
              >
                OS Voice
              </button>
            </div>
          </div>

          <div className="md:col-span-5 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  buddyVoiceConfig.provider === 'kokoro'
                    ? 'text-violet-700'
                    : buddyVoiceConfig.provider === 'neural-free'
                    ? 'text-emerald-700'
                    : 'text-slate-600'
                }`}
              >
                {buddyVoiceConfig.provider === 'kokoro'
                  ? 'Kokoro-82M Natural Voice (12 US & UK Voices)'
                  : buddyVoiceConfig.provider === 'neural-free'
                  ? 'Edge Neural HD Voice (6 Voices)'
                  : 'Installed Browser / OS Voice'}
              </span>
              {buddyVoiceConfig.provider === 'kokoro' && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    kokoroStatus.state === 'ready'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : kokoroStatus.state === 'loading'
                      ? 'bg-violet-50 text-violet-700 border-violet-200 animate-pulse'
                      : kokoroStatus.state === 'error'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {kokoroStatus.state === 'ready'
                    ? `✓ Ready (${kokoroStatus.backend === 'webgpu' ? 'WebGPU' : 'WASM'})`
                    : kokoroStatus.state === 'loading'
                    ? `Loading ${kokoroStatus.progress}%`
                    : kokoroStatus.state === 'error'
                    ? 'Load Error'
                    : 'On-Demand'}
                </span>
              )}
            </div>

            {buddyVoiceConfig.provider === 'kokoro' ? (
              <select
                value={buddyVoiceConfig.kokoroVoice}
                onChange={(e) =>
                  onUpdateBuddyVoiceConfig({
                    kokoroVoice: e.target.value as KokoroVoiceId
                  })
                }
                aria-label="Kokoro Natural Voice"
                className="w-full bg-violet-50/70 border border-violet-200 rounded-xl px-3 py-2 text-xs font-semibold text-violet-950 focus:outline-none focus:border-violet-500 cursor-pointer"
              >
                {KOKORO_NATURAL_VOICES.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.label} · {v.gender} · {v.trait}
                  </option>
                ))}
              </select>
            ) : buddyVoiceConfig.provider === 'neural-free' ? (
              <select
                value={buddyVoiceConfig.freeNeuralVoice}
                onChange={(e) =>
                  onUpdateBuddyVoiceConfig({
                    freeNeuralVoice: e.target.value as FreeNeuralVoiceName
                  })
                }
                aria-label="Edge Neural HD Voice"
                className="w-full bg-emerald-50/70 border border-emerald-200 rounded-xl px-3 py-2 text-xs font-semibold text-emerald-900 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {FREE_NEURAL_VOICES.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.label} · {v.trait}
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={buddyVoiceConfig.osVoiceURI || ''}
                onChange={(e) =>
                  onUpdateBuddyVoiceConfig({
                    osVoiceURI: e.target.value
                  })
                }
                aria-label="OS Standard Voice"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-500 cursor-pointer"
              >
                <option value="">Auto Best Installed English Voice</option>
                {osVoiceOptions.map(v => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.flag} {v.name} ({v.badge})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="md:col-span-3 flex items-center gap-2">
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                <span>Speed</span>
                <span className="font-mono text-blue-600">{buddyVoiceConfig.rate.toFixed(2)}×</span>
              </div>
              <input
                type="range"
                min={0.85}
                max={1.2}
                step={0.05}
                value={buddyVoiceConfig.rate}
                onChange={(e) => onUpdateBuddyVoiceConfig({ rate: parseFloat(e.target.value) })}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
            <button
              type="button"
              onClick={onTestSelectedVoice}
              className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
              title="Test this exact voice engine & speaker right now"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Test Voice</span>
            </button>
          </div>
        </div>

        {/* Live Kokoro Download Progress Bar or Voice Test Verification Banner */}
        {buddyVoiceConfig.provider === 'kokoro' && kokoroStatus.state === 'loading' && (
          <div className="space-y-1 bg-violet-50/80 border border-violet-200 rounded-xl px-3 py-2 text-[11px] text-violet-900">
            <div className="flex items-center justify-between font-semibold">
              <span>{kokoroStatus.detail}</span>
              <span>{kokoroStatus.progress}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-violet-200/70 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-all duration-300"
                style={{ width: `${Math.max(4, kokoroStatus.progress)}%` }}
              />
            </div>
          </div>
        )}

        {voiceTestFeedback && (
          <div
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold flex items-center justify-between gap-2 ${
              voiceTestFeedback.tone === 'ok'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : voiceTestFeedback.tone === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            <span>{voiceTestFeedback.message}</span>
            <button
              type="button"
              onClick={onClearVoiceTestFeedback}
              className="opacity-70 hover:opacity-100 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
