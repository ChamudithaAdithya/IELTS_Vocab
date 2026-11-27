import React from 'react';
import {
  AlertTriangle,
  Keyboard,
  Mic,
  MicOff,
  Square,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';
import type {
  BuddyMemoryState,
  BuddyMessage,
  BuddyModeConfig,
  BuddyOrbState,
  BuddyPersonalityConfig,
  BuddySpeechEngine
} from '../../types/speakingBuddy';
import type { OrbStateDescriptor } from '../../utils/buddyQaSuite';
import {
  FREE_NEURAL_VOICES,
  KOKORO_NATURAL_VOICES,
  type BuddyVoiceConfig
} from '../../utils/speech';
import { BuddyEnergyOrb } from './BuddyEnergyOrb';

export interface BuddyOrbSanctuaryColumnProps {
  currentPersonalityCfg: BuddyPersonalityConfig;
  currentModeCfg: BuddyModeConfig;
  apiKey: string;
  onOpenApiModal: () => void;
  buddyVoiceConfig: BuddyVoiceConfig;
  onToggleAudioSettings: () => void;
  speechEngine: BuddySpeechEngine;
  engineLabel: string;
  buddyMemory: BuddyMemoryState;
  onOpenHubTab: () => void;
  orbState: BuddyOrbState;
  currentOrbDesc: OrbStateDescriptor;
  audioLevelRef: React.MutableRefObject<number>;
  isFullscreen: boolean;
  onOrbOrMicClick: () => void;
  onOpenSystemModal: () => void;
  isListening: boolean;
  isBuddySpeaking: boolean;
  liveFinalText: string;
  liveInterimText: string;
  latestBuddyMessage?: BuddyMessage;
  hasUserMessages: boolean;
  orbStatusSubtitle: string;
  showSinhala: boolean;
  statusNotice: string | null;
  onClearStatusNotice: () => void;
  voiceOutputEnabled: boolean;
  onToggleVoiceOutput: () => void;
  onPauseSession: () => void;
  onFocusKeyboardInput: () => void;
}

export const BuddyOrbSanctuaryColumn: React.FC<BuddyOrbSanctuaryColumnProps> = ({
  currentPersonalityCfg,
  currentModeCfg,
  apiKey,
  onOpenApiModal,
  buddyVoiceConfig,
  onToggleAudioSettings,
  speechEngine,
  engineLabel,
  buddyMemory,
  onOpenHubTab,
  orbState,
  currentOrbDesc,
  audioLevelRef,
  isFullscreen,
  onOrbOrMicClick,
  onOpenSystemModal,
  isListening,
  isBuddySpeaking,
  liveFinalText,
  liveInterimText,
  latestBuddyMessage,
  hasUserMessages,
  orbStatusSubtitle,
  showSinhala,
  statusNotice,
  onClearStatusNotice,
  voiceOutputEnabled,
  onToggleVoiceOutput,
  onPauseSession,
  onFocusKeyboardInput
}) => {
  const voiceBadgeText =
    buddyVoiceConfig.provider === 'kokoro'
      ? `Kokoro AI · ${
          KOKORO_NATURAL_VOICES.find(v => v.id === buddyVoiceConfig.kokoroVoice)?.label ||
          'Heart (US)'
        }`
      : buddyVoiceConfig.provider === 'standard'
      ? 'OS Standard Voice'
      : `Neural HD · ${
          FREE_NEURAL_VOICES.find(v => v.id === buddyVoiceConfig.freeNeuralVoice)?.label ||
          'Ava (US)'
        }`;

  return (
    <section className="lg:col-span-4 xl:col-span-3 bg-gradient-to-b from-white/82 via-[#f4f7ff]/82 to-[#f4efff]/82 backdrop-blur-xl rounded-3xl border border-white/85 ring-1 ring-indigo-200/45 shadow-[0_10px_32px_rgba(59,130,246,0.08)] p-4 flex flex-col justify-between gap-2.5 lg:h-full lg:min-h-0 lg:overflow-hidden">
      {/* Friendly AI Presence Header & Voice Pills */}
      <div className="shrink-0 flex flex-col items-center gap-1.5 text-center">
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          <span className="px-2.5 py-0.5 rounded-full bg-white/85 border border-indigo-200/70 text-[11px] font-bold text-indigo-800 shadow-2xs">
            {currentPersonalityCfg.emoji} {currentPersonalityCfg.label} · {currentModeCfg.label}
          </span>
          {apiKey ? (
            <span className="px-2 py-0.5 rounded-full bg-emerald-50/90 border border-emerald-200 text-emerald-700 text-[10px] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>AI Live</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={onOpenApiModal}
              className="px-2.5 py-0.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
              title="Connect a Gemini API key for deep AI chat"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Connect AI</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          <button
            type="button"
            onClick={onToggleAudioSettings}
            className="px-2.5 py-0.5 rounded-full bg-white/80 hover:bg-blue-50 border border-blue-200/70 text-blue-700 text-[10px] font-semibold transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
            title="Change Buddy Voice & AI Studio Style"
          >
            <Volume2 className="w-3 h-3" />
            <span>{voiceBadgeText}</span>
          </button>

          <button
            type="button"
            onClick={onToggleAudioSettings}
            className={`px-2.5 py-0.5 rounded-full border text-[10px] font-semibold transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs ${
              speechEngine === 'live-solo'
                ? 'bg-amber-50/90 hover:bg-amber-100 border-amber-200 text-amber-800'
                : 'bg-emerald-50/90 hover:bg-emerald-100 border-emerald-200 text-emerald-700'
            }`}
            title="Active Speech-to-Text Engine (0% Auto-Correction) — click to switch"
          >
            <Mic className="w-3 h-3" />
            <span>Mic: {engineLabel}</span>
          </button>

          {buddyMemory.enabled && buddyMemory.items.length > 0 && (
            <button
              type="button"
              onClick={onOpenHubTab}
              className="px-2.5 py-0.5 rounded-full bg-purple-50/90 hover:bg-purple-100 border border-purple-200/80 text-purple-700 text-[10px] font-semibold transition-colors cursor-pointer"
            >
              Remembers {buddyMemory.items.length}{' '}
              {buddyMemory.items.length === 1 ? 'interest' : 'interests'}
            </button>
          )}
        </div>
      </div>

      {/* Living Crystal Orb Centerpiece */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center space-y-2">
        <div className="relative flex items-center justify-center shrink-0">
          <BuddyEnergyOrb
            state={orbState}
            audioLevelRef={audioLevelRef}
            onClick={onOrbOrMicClick}
            size={isFullscreen ? 264 : 240}
          />
        </div>

        {/* Interactive State Pill + Animated Voice Sound Waves */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onOpenSystemModal}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold transition-all cursor-pointer shadow-2xs ${
              isListening
                ? 'bg-sky-50 border-sky-300 text-sky-800'
                : isBuddySpeaking
                ? 'bg-purple-50 border-purple-300 text-purple-800'
                : orbState === 'thinking' || orbState === 'understanding'
                ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
                : 'bg-white/85 hover:bg-blue-50 border-slate-200/90 text-slate-700'
            }`}
            title="Open 14-State Living Orb Lab & QA Suite"
          >
            <span
              className={`w-2 h-2 rounded-full ${currentOrbDesc.dotColor} ${
                isListening || isBuddySpeaking ? 'animate-pulse' : ''
              }`}
            />
            <span>{currentOrbDesc.label}</span>
            {(isListening || isBuddySpeaking) && (
              <span className="inline-flex items-end gap-[2px] h-3 ml-0.5" aria-hidden="true">
                {[0, 1, 2, 3].map(bar => (
                  <span
                    key={bar}
                    className={`w-[2.5px] rounded-full animate-pulse ${
                      isListening ? 'bg-sky-500' : 'bg-purple-500'
                    }`}
                    style={{
                      height: `${[55, 100, 70, 90][bar]}%`,
                      animationDelay: `${bar * 120}ms`,
                      animationDuration: '650ms'
                    }}
                  />
                ))}
              </span>
            )}
          </button>
        </div>

        {/* Live Caption */}
        <div className="min-h-[54px] w-full flex flex-col items-center justify-center space-y-1 px-1">
          {isListening && (liveFinalText || liveInterimText) ? (
            <div className="space-y-0.5 animate-in fade-in duration-150">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-[9px] font-bold uppercase tracking-wider text-sky-700">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                <span>Live Transcription · Provisional</span>
              </span>
              <p className="text-xs font-semibold text-slate-800 leading-relaxed line-clamp-2">
                “{liveFinalText}
                {liveFinalText && liveInterimText ? ' ' : ''}
                {liveInterimText && (
                  <span className="text-blue-600 italic font-medium">{liveInterimText}</span>
                )}
                <span className="inline-block w-0.5 h-3.5 bg-sky-500 ml-1 align-middle animate-pulse" />”
              </p>
            </div>
          ) : isBuddySpeaking && latestBuddyMessage ? (
            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
              “{latestBuddyMessage.text}”
            </p>
          ) : (
            <p className="text-xs font-semibold text-slate-700">
              {hasUserMessages
                ? 'I’m listening whenever you’re ready.'
                : 'Tap the crystal orb or microphone to talk.'}
            </p>
          )}

          <p className="text-[11px] font-medium text-slate-500">{orbStatusSubtitle}</p>

          {showSinhala && !isListening && !hasUserMessages && (
            <p className="text-[11px] text-indigo-600/90 font-sinhala">
              මිතුරෙකු සමඟ මෙන් නිදහසේ කතා කරන්න.
            </p>
          )}

          {statusNotice && (
            <div className="mt-1 px-3 py-1.5 rounded-xl bg-amber-50/95 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2 text-left">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="flex-1">{statusNotice}</span>
              <button
                type="button"
                onClick={onClearStatusNotice}
                className="text-amber-600 hover:text-amber-900 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Primary Hero Voice Microphone Action Dock */}
      <div className="shrink-0 pt-2.5 border-t border-indigo-100/80">
        <div className="flex items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={onToggleVoiceOutput}
            className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all cursor-pointer shadow-2xs ${
              voiceOutputEnabled
                ? 'bg-white/90 hover:bg-blue-50 border-indigo-100 text-slate-700'
                : 'bg-red-50 border-red-200 text-red-600'
            }`}
            title={voiceOutputEnabled ? 'Mute voice reply' : 'Unmute voice reply'}
          >
            {voiceOutputEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={onOrbOrMicClick}
            className={`relative h-12 px-7 rounded-full text-sm font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              isListening
                ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-[0_8px_24px_rgba(239,68,68,0.32)] ring-4 ring-red-500/20'
                : isBuddySpeaking
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-[0_8px_24px_rgba(147,51,234,0.28)] ring-4 ring-purple-500/15'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-[0_8px_24px_rgba(59,130,246,0.3)] hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4" />
                <span>{speechEngine === 'live-solo' ? 'Listening · Done' : 'Stop & Send'}</span>
              </>
            ) : isBuddySpeaking ? (
              <>
                <Mic className="w-4 h-4" />
                <span>Speaking · Interrupt</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>Speak to Buddy</span>
              </>
            )}
          </button>

          {isListening || isBuddySpeaking ? (
            <button
              type="button"
              onClick={onPauseSession}
              className="w-10 h-10 rounded-full bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 flex items-center justify-center transition-all cursor-pointer"
              title="Pause voice session"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onFocusKeyboardInput}
              className="w-10 h-10 rounded-full bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-600 hover:text-blue-600 flex items-center justify-center transition-all cursor-pointer"
              title="Focus chat input"
            >
              <Keyboard className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
