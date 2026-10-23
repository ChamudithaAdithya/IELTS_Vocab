import React, { useState, useEffect } from 'react';
import { 
  X, 
  Volume2, 
  RotateCw, 
  Check, 
  Smartphone, 
  HelpCircle, 
  Download, 
  Sparkles,
  Sliders
} from 'lucide-react';
import { 
  getEnglishVoices, 
  loadVoiceSettings, 
  saveVoiceSettings, 
  playSpeech, 
  stopAllSpeech, 
  VoiceSettings 
} from '../utils/speech';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  showSinhala: boolean;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  showSinhala,
}) => {
  const [settings, setSettings] = useState<VoiceSettings>(loadVoiceSettings);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [activeTab, setActiveTab] = useState<'settings' | 'iphone' | 'android'>('settings');
  const [isTesting, setIsTesting] = useState(false);

  const refreshVoices = () => {
    const list = getEnglishVoices();
    setVoices(list);
  };

  useEffect(() => {
    if (!isOpen) return;
    refreshVoices();
    setSettings(loadVoiceSettings());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVoiceChange = (uri: string) => {
    const selected = voices.find(v => v.voiceURI === uri);
    const updated: VoiceSettings = {
      ...settings,
      voiceURI: uri,
      voiceName: selected?.name || '',
      lang: selected?.lang || 'en-GB',
    };
    setSettings(updated);
    saveVoiceSettings(updated);
  };

  const handleRateChange = (rate: number) => {
    const updated: VoiceSettings = { ...settings, rate };
    setSettings(updated);
    saveVoiceSettings(updated);
  };

  const handleExampleSpeakersChange = (showExampleSpeakers: boolean) => {
    const updated: VoiceSettings = { ...settings, showExampleSpeakers };
    setSettings(updated);
    saveVoiceSettings(updated);
  };

  const handleTestPronounce = () => {
    if (isTesting) {
      stopAllSpeech();
      setIsTesting(false);
      return;
    }

    playSpeech(
      "A child's upbringing can have a profound influence on their personality.",
      {
        voiceURI: settings.voiceURI,
        rate: settings.rate,
        pitch: settings.pitch,
        onStart: () => setIsTesting(true),
        onEnd: () => setIsTesting(false),
        onError: () => setIsTesting(false),
      }
    );
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl w-full max-w-lg border border-slate-300 shadow-xl overflow-hidden my-auto flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-slate-800" />
            <h2 className="font-bold text-slate-900 text-base">
              Pronunciation & Voice Settings
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 text-xs font-semibold bg-slate-50">
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2.5 px-3 text-center border-b-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-slate-900 text-slate-900 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Voice Selector
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('iphone')}
            className={`flex-1 py-2.5 px-3 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'iphone'
                ? 'border-slate-900 text-slate-900 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>iPhone Natural Voice</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2.5 px-3 text-center border-b-2 transition-colors ${
              activeTab === 'android'
                ? 'border-slate-900 text-slate-900 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Android Guide
          </button>
        </div>

        {/* Tab 1: Voice Selector & Test */}
        {activeTab === 'settings' && (
          <div className="p-5 overflow-y-auto space-y-5 text-sm">
            {/* Voice dropdown */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="voice-select" className="font-semibold text-slate-900 text-xs">
                  Selected English Voice:
                </label>
                <button
                  type="button"
                  onClick={refreshVoices}
                  className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  title="Reload browser voices"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Refresh</span>
                </button>
              </div>

              <select
                id="voice-select"
                value={settings.voiceURI}
                onChange={(e) => handleVoiceChange(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 text-xs text-slate-900 bg-white focus:outline-slate-400"
              >
                <option value="">Default Recommended Voice (UK English)</option>
                {voices.map((v) => {
                  const isUK = v.lang.replace('_', '-').toLowerCase().startsWith('en-gb');
                  const isEnhanced = v.name.includes('Natural') || v.name.includes('Enhanced') || v.name.includes('Premium');
                  return (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang}) {isEnhanced ? '★ Enhanced' : ''} {isUK ? '🇬🇧' : ''}
                    </option>
                  );
                })}
              </select>

              <p className="text-[11px] text-slate-500">
                {voices.length} English voice(s) detected on this browser/device.
              </p>
            </div>

            {/* Speaking Rate / Speed Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900">Pronunciation Speed:</span>
                <span className="text-slate-600 font-mono font-bold">{settings.rate}x</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.2"
                step="0.05"
                value={settings.rate}
                onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                className="w-full accent-slate-900 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0.7x (Slow study)</span>
                <span>0.9x (IELTS standard)</span>
                <span>1.2x (Fast)</span>
              </div>
            </div>

            <label className="flex items-center justify-between gap-4 p-3.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
              <span>
                <span className="block text-xs font-semibold text-slate-900">Example sentence speaker icons</span>
                <span className="block text-[11px] text-slate-500 mt-0.5">Show a pronunciation button beside every example.</span>
              </span>
              <input
                type="checkbox"
                checked={settings.showExampleSpeakers}
                onChange={(e) => handleExampleSpeakersChange(e.target.checked)}
                className="h-4 w-4 accent-slate-900"
              />
            </label>

            {/* Test Pronunciation Preview */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
              <span className="text-xs font-semibold text-slate-700 block">
                Test Pronunciation:
              </span>
              <p className="text-xs text-slate-600 italic">
                "A child's upbringing can have a profound influence on their personality."
              </p>
              <button
                type="button"
                onClick={handleTestPronounce}
                className="w-full py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isTesting ? 'Stop Speaking' : 'Test Audio Now'}</span>
              </button>
            </div>

            {/* Tip */}
            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded text-xs text-slate-700">
              <span className="font-semibold text-blue-900">💡 Tip for iPhone / Safari users: </span>
              <span>
                To hear ultra-natural voices (like Siri or Daniel Enhanced), see the iPhone tab to install them for free on your iOS device!
              </span>
            </div>
          </div>
        )}

        {/* Tab 2: iPhone / iOS Natural Voice Installation Guide */}
        {activeTab === 'iphone' && (
          <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                How to install & use Natural Voices on iPhone (iOS)
              </h3>
              <p className="text-slate-500 mt-0.5">
                Apple allows you to download free high-quality "Enhanced" and "Premium" British and American voices.
              </p>
            </div>

            <ol className="space-y-3 list-decimal pl-4">
              <li>
                <strong className="text-slate-900">Open iPhone Settings:</strong>
                <p className="text-slate-600 mt-0.5">Open the <strong>Settings (සැකසුම්)</strong> app on your iPhone.</p>
              </li>
              <li>
                <strong className="text-slate-900">Navigate to Accessibility:</strong>
                <p className="text-slate-600 mt-0.5">
                  Tap <strong>Accessibility</strong> → <strong>Spoken Content (කථන අන්තර්ගතය)</strong>.
                </p>
              </li>
              <li>
                <strong className="text-slate-900">Open Voices:</strong>
                <p className="text-slate-600 mt-0.5">
                  Tap <strong>Voices</strong> → select <strong>English</strong>.
                </p>
              </li>
              <li>
                <strong className="text-slate-900">Select UK or US:</strong>
                <p className="text-slate-600 mt-0.5">
                  Tap <strong>English (United Kingdom)</strong> or <strong>English (United States)</strong>.
                </p>
              </li>
              <li>
                <strong className="text-slate-900">Download Enhanced / Premium Voice:</strong>
                <p className="text-slate-600 mt-0.5">
                  Choose a natural voice like <strong>Daniel (Enhanced)</strong>, <strong>Oliver (Enhanced)</strong>, <strong>Serena</strong>, or <strong>Arthur</strong> and tap the cloud download icon ☁️ (Free download ~80MB).
                </p>
              </li>
              <li>
                <strong className="text-slate-900">Return & Refresh:</strong>
                <p className="text-slate-600 mt-0.5">
                  Once downloaded, come back to this web app and tap the button below. Your iPhone Safari will now speak using that studio-grade voice!
                </p>
              </li>
            </ol>

            {showSinhala && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded font-sinhala text-[11px] text-slate-600 space-y-1">
                <span className="font-bold text-slate-800">සිංහල උපදෙස්:</span>
                <p>iPhone Settings → Accessibility → Spoken Content → Voices → English වෙත ගොස් Enhanced හෝ Premium හඬ නොමිලේ Download කරගන්න. පසුව පහත Refresh බොත්තම ඔබන්න.</p>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                refreshVoices();
                setActiveTab('settings');
              }}
              className="w-full py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Refresh Voices & Select Now</span>
            </button>
          </div>
        )}

        {/* Tab 3: Android Guide */}
        {activeTab === 'android' && (
          <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                How to install High-Quality Google Voices on Android
              </h3>
              <p className="text-slate-500 mt-0.5">
                Install natural British speech data from Google Text-to-Speech engine.
              </p>
            </div>

            <ol className="space-y-2.5 list-decimal pl-4">
              <li>
                Open phone <strong>Settings</strong> → <strong>System</strong> (or <strong>General Management</strong> on Samsung).
              </li>
              <li>
                Tap <strong>Language & Input</strong> → <strong>Text-to-speech output</strong>.
              </li>
              <li>
                Tap the <strong>Settings Gear ⚙️</strong> icon next to <em>Speech Services by Google</em>.
              </li>
              <li>
                Tap <strong>Install voice data</strong> → select <strong>English (United Kingdom)</strong>.
              </li>
              <li>
                Tap to download high-quality natural voice pack.
              </li>
              <li>
                Return to this web app and tap the Refresh button below.
              </li>
            </ol>

            <button
              type="button"
              onClick={() => {
                refreshVoices();
                setActiveTab('settings');
              }}
              className="w-full py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Refresh Voices & Select Now</span>
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end px-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
