import React, { useState, useRef } from 'react';
import { X, Download, Upload, RefreshCw, Volume2, VolumeX, Check, AlertTriangle } from 'lucide-react';
import { AppSettings, Thought } from '../types/thought';
import { exportDataAsJson, importDataFromJson, resetToSeedData } from '../lib/db';
import { toggleAmbientNoise } from '../lib/ambientSound';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onDataReset: (thoughts: Thought[]) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onDataReset,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      const json = await exportDataAsJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `thought-workspace-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Export error', e);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const updatedThoughts = await importDataFromJson(text);
      onDataReset(updatedThoughts);
      setImportStatus('Backup restored successfully.');
      setTimeout(() => {
        setImportStatus(null);
        onClose();
      }, 1500);
    } catch {
      setImportStatus('Failed to import backup file. Please check file format.');
    }
  };

  const handleResetData = async () => {
    try {
      const freshThoughts = await resetToSeedData();
      onDataReset(freshThoughts);
      setResetConfirm(false);
      onClose();
    } catch (e) {
      console.error('Reset error', e);
    }
  };

  const toggleSound = () => {
    const next = !settings.ambientSound;
    toggleAmbientNoise(next);
    onUpdateSettings({ ...settings, ambientSound: next });
  };

  const changeFontSize = (fontSize: AppSettings['fontSize']) => {
    onUpdateSettings({ ...settings, fontSize });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#252525]/30 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#FAF9F6] border border-[#E8E5DF] rounded-xl p-7 sm:p-9 shadow-xl text-[#252525]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-[#6B6A67] hover:text-[#252525] hover:bg-[#F3F1ED] rounded-md transition-colors"
          aria-label="Close settings"
        >
          <X size={18} />
        </button>

        <h2 className="text-xl sm:text-2xl font-editorial font-medium mb-1">
          Workspace Settings
        </h2>
        <p className="text-xs text-[#6B6A67] mb-6">
          Preferences are stored locally in your browser. All thoughts remain completely private.
        </p>

        <div className="space-y-6 text-sm">
          {/* Typography scale */}
          <div className="pb-5 border-b border-[#E8E5DF]">
            <label className="block text-xs uppercase tracking-widest text-[#6B6A67] mb-2 font-sans">
              Editorial Typography Scale
            </label>
            <div className="flex gap-2">
              {(['compact', 'standard', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => changeFontSize(size)}
                  className={`flex-1 py-2 px-3 text-xs capitalize rounded-md border transition-colors ${
                    settings.fontSize === size
                      ? 'border-[#252525] bg-[#252525] text-[#FAF9F6]'
                      : 'border-[#E8E5DF] bg-[#FFFFFF] text-[#6B6A67] hover:border-[#6B6A67]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Ambient Sound */}
          <div className="pb-5 border-b border-[#E8E5DF] flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Quiet Brown Noise / Rainfall</div>
              <div className="text-xs text-[#6B6A67]">
                Synthesized pure local sound to create a calm mental chamber
              </div>
            </div>
            <button
              onClick={toggleSound}
              className={`p-2 rounded-lg border transition-colors flex items-center gap-1.5 text-xs ${
                settings.ambientSound
                  ? 'bg-[#EEF4F8] border-[#8FAFC8] text-[#3D5F7A]'
                  : 'bg-[#FFFFFF] border-[#E8E5DF] text-[#6B6A67] hover:border-[#6B6A67]'
              }`}
            >
              {settings.ambientSound ? (
                <>
                  <Volume2 size={15} /> Active
                </>
              ) : (
                <>
                  <VolumeX size={15} /> Off
                </>
              )}
            </button>
          </div>

          {/* Backup & Export */}
          <div className="pb-5 border-b border-[#E8E5DF]">
            <label className="block text-xs uppercase tracking-widest text-[#6B6A67] mb-2 font-sans">
              Data Backup & Portability
            </label>
            <p className="text-xs text-[#6B6A67] mb-3">
              Download your entire collection of thoughts as standard JSON anytime.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-1.5 flex-1 py-2 px-3 text-xs bg-[#FFFFFF] border border-[#E8E5DF] rounded-md text-[#252525] hover:bg-[#F3F1ED] transition-colors"
              >
                {copied ? <Check size={14} className="text-[#3E5C50]" /> : <Download size={14} />}
                {copied ? 'Exported' : 'Export JSON'}
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 flex-1 py-2 px-3 text-xs bg-[#FFFFFF] border border-[#E8E5DF] rounded-md text-[#252525] hover:bg-[#F3F1ED] transition-colors"
              >
                <Upload size={14} />
                Import JSON
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </div>
            {importStatus && (
              <p className="mt-2 text-xs text-[#3E5C50]">{importStatus}</p>
            )}
          </div>

          {/* Reset to Seed Thoughts */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#6B6A67] mb-2 font-sans">
              Sample Dataset
            </label>
            {!resetConfirm ? (
              <button
                onClick={() => setResetConfirm(true)}
                className="flex items-center gap-1.5 text-xs text-[#6B6A67] hover:text-[#252525] transition-colors"
              >
                <RefreshCw size={13} />
                Reset workspace to initial sample thoughts
              </button>
            ) : (
              <div className="p-3 bg-[#FAF3F0] border border-[#E8D4CE] rounded-lg">
                <div className="flex items-center gap-2 text-xs text-[#9A3412] mb-2 font-medium">
                  <AlertTriangle size={14} />
                  Replace current thoughts with sample dataset?
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleResetData}
                    className="py-1 px-3 bg-[#9A3412] text-white text-xs rounded hover:bg-[#7E2A0E] transition-colors"
                  >
                    Confirm Reset
                  </button>
                  <button
                    onClick={() => setResetConfirm(false)}
                    className="py-1 px-3 bg-white border border-[#E8D4CE] text-[#6B6A67] text-xs rounded hover:bg-[#F3F1ED] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
