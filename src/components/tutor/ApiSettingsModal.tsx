import React, { useState } from 'react';
import { 
  Key, 
  Settings, 
  X, 
  CheckCircle2, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Loader2,
  AlertCircle,
  Info
} from 'lucide-react';
import { 
  loadApiKey, 
  saveApiKey, 
  loadModel, 
  saveModel, 
  DEFAULT_GEMINI_MODEL,
  listAvailableGeminiModels
} from '../../utils/tutorEngine';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated?: (newKey: string, newModel: string) => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  onKeyUpdated,
}) => {
  const [apiKey, setApiKey] = useState<string>(loadApiKey);
  const [model, setModel] = useState<string>(loadModel);
  const [showKey, setShowKey] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestStatus('error');
      setTestMessage('Please enter an API key first.');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Discovering authorized models on your Google AI Studio account...');

    try {
      // 1. Query available models authorized for this key
      const availableModels = await listAvailableGeminiModels(apiKey.trim());
      
      let candidateToTest = model.trim() || DEFAULT_GEMINI_MODEL;
      let switchedModelNotice = '';

      // If user selected a model that is not in their authorized list, or if testing gemini-1.5-pro which returned 404
      if (availableModels.length > 0 && !availableModels.includes(candidateToTest)) {
        // Pick best available: prefer gemini-2.0-flash or gemini-1.5-flash
        const preferred = availableModels.find(m => m.includes('2.0-flash')) || 
                          availableModels.find(m => m.includes('1.5-flash')) || 
                          availableModels[0];
        if (preferred) {
          switchedModelNotice = ` (Model "${candidateToTest}" was unavailable; auto-switched to verified model "${preferred}")`;
          candidateToTest = preferred;
          setModel(preferred);
          saveModel(preferred);
          onKeyUpdated?.(apiKey.trim(), preferred);
        }
      }

      // 2. Test ping with candidate model
      setTestMessage(`Connecting to Google Gemini (${candidateToTest})...`);
      
      let res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(candidateToTest)}:generateContent?key=${encodeURIComponent(apiKey.trim())}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Respond with the single word: OK' }] }]
          })
        }
      );

      // Try v1 if v1beta returned 404
      if (res.status === 404) {
        res = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(candidateToTest)}:generateContent?key=${encodeURIComponent(apiKey.trim())}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: 'Respond with the single word: OK' }] }]
            })
          }
        );
      }

      if (!res.ok) {
        let errMsg = `Google API returned HTTP ${res.status}`;
        try {
          const data = await res.json();
          if (data?.error?.message) {
            errMsg = data.error.message;
          }
        } catch { /* ignore */ }
        throw new Error(errMsg);
      }

      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply) {
        setTestStatus('success');
        const modelListDisplay = availableModels.length > 0 
          ? ` Available on your key: ${availableModels.slice(0, 3).join(', ')}.` 
          : '';
        setTestMessage(`Connection verified! Google Gemini (${candidateToTest}) is active and responding.${switchedModelNotice}${modelListDisplay}`);
      } else {
        throw new Error('API returned an empty response.');
      }
    } catch (err: any) {
      setTestStatus('error');
      const msg = err.message || 'Failed to connect to Google Gemini.';
      if (msg.includes('403') || msg.includes('PERMISSION_DENIED') || msg.includes('API_KEY_INVALID')) {
        setTestMessage(`Invalid API Key or permission denied (HTTP 403). Make sure your key is copied correctly from https://aistudio.google.com/app/apikey.`);
      } else if (msg.includes('404') || msg.includes('not found')) {
        setTestMessage(`Model "${model}" was not found (HTTP 404). Switch to "2.0 Flash" above — it is 100% active on all free Google AI Studio keys.`);
      } else {
        setTestMessage(msg);
      }
    }
  };

  if (!isOpen) return null;

  const handleSave = () => {
    saveApiKey(apiKey.trim());
    saveModel(model.trim() || DEFAULT_GEMINI_MODEL);
    onKeyUpdated?.(apiKey.trim(), model.trim() || DEFAULT_GEMINI_MODEL);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleClear = () => {
    setApiKey('');
    saveApiKey('');
    onKeyUpdated?.('', model);
  };

  const handleSelectModel = (m: string) => {
    setModel(m);
    saveModel(m);
    onKeyUpdated?.(apiKey, m);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-0 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                AI & Gemini API Settings
              </h2>
              <span className="text-[11px] text-slate-500">
                Official Google Gemini Integration
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-xs text-slate-700 max-h-[80vh] overflow-y-auto">
          {/* Status Indicator */}
          <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
            apiKey.trim()
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              : 'bg-indigo-50/60 border-indigo-200 text-indigo-950'
          }`}>
            <div className="flex items-center gap-2">
              {apiKey.trim() ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              )}
              <span className="font-bold">
                {apiKey.trim() ? 'Gemini AI Configured' : 'Using Local Cambridge Engine'}
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 font-bold">
              {apiKey.trim() ? model : 'Offline Mode'}
            </span>
          </div>

          {/* API Key Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 block text-xs">
                Google Gemini API Key
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
              >
                <span>Get Free Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setTestStatus('idle');
                  setTestMessage('');
                }}
                placeholder="AIzaSy..."
                className="w-full text-xs font-mono p-3 pr-10 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              />
              <button
                type="button"
                onClick={() => setShowKey(prev => !prev)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Test Connection Button & Result */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testStatus === 'testing' || !apiKey.trim()}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  !apiKey.trim()
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                    : testStatus === 'testing'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-white hover:bg-indigo-50 text-indigo-700 border-indigo-200 shadow-2xs'
                }`}
              >
                {testStatus === 'testing' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Test Connection</span>
                  </>
                )}
              </button>
              <span className="text-[11px] text-slate-400">
                Pings Google Gemini API to verify your key
              </span>
            </div>

            {/* Test Connection Banner */}
            {testStatus === 'success' && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-xs text-emerald-900 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{testMessage}</span>
              </div>
            )}
            {testStatus === 'error' && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-900 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold">Connection Failed:</span>
                  <p className="text-[11px] leading-relaxed font-mono">{testMessage}</p>
                </div>
              </div>
            )}

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Saved strictly in your local browser storage (<code className="font-mono text-indigo-600">localStorage</code>). Never sent to any third-party server.
            </p>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <label className="font-bold text-slate-900 block text-xs">
              Gemini Model
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'gemini-2.0-flash', label: '2.0 Flash', badge: 'Recommended' },
                { id: 'gemini-1.5-flash', label: '1.5 Flash', badge: 'Stable' },
                { id: 'gemini-1.5-pro', label: '1.5 Pro', badge: 'Deep Reasoning' }
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSelectModel(m.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    model === m.id
                      ? 'bg-indigo-50/80 border-indigo-500 text-indigo-950 font-bold ring-2 ring-indigo-200'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-xs">{m.label}</span>
                    <span className="text-[9px] font-sans px-1.5 py-0.2 rounded bg-white/70 border border-slate-200 text-slate-500 w-fit">
                      {m.badge}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Note for Gemini Advanced / Gemini Pro Subscribers */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Subscribed to Gemini Pro / Advanced ($20/mo)?</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Google treats the consumer <strong>Gemini Advanced ($20/mo)</strong> subscription (for gemini.google.com web chat) separately from the developer API. Consumer subscriptions do not provide an API key.
            </p>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              <strong>Good news:</strong> Google provides <strong>100% FREE Gemini API keys</strong> to everyone on <strong>Google AI Studio</strong> (up to 1,500 requests/day at zero cost, no payment needed!).
            </p>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-white px-2.5 py-1 rounded-lg border border-amber-300 shadow-2xs mt-1 transition-colors"
            >
              <span>Create Free Key on Google AI Studio (Instant)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Privacy Note */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Privacy & Free Tier</span>
            </div>
            <p className="leading-relaxed">
              Google provides 15 free evaluations per minute for Gemini Flash. Storing your key locally ensures 100% private, free access.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          {apiKey.trim() ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-rose-600 hover:text-rose-800 font-bold transition-colors cursor-pointer"
            >
              Clear Key
            </button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Settings</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

