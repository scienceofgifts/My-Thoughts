import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Thought } from '../types/thought';
import { SparkMark } from './EditorialMotifs';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (thought: Thought, openImmediately: boolean) => void;
  topics: string[];
  defaultTopic?: string;
}

export function CaptureModal({
  isOpen,
  onClose,
  onSave,
  topics,
  defaultTopic,
}: Props) {
  const [content, setContent] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setContent('');
      setSelectedTopic(defaultTopic && defaultTopic !== 'all' ? defaultTopic : '');
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  }, [isOpen, defaultTopic]);

  if (!isOpen) return null;

  const handleSave = (openImmediately = false) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    // Derive a clean title from the first sentence or first 60 chars
    const lines = trimmed.split('\n');
    const firstLine = lines[0].trim();
    const title = firstLine.length > 70 ? firstLine.slice(0, 70) + '…' : firstLine;

    const newThought: Thought = {
      id: `thought_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title,
      rawThought: trimmed,
      status: 'unsorted',
      topic: selectedTopic || undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      relatedThoughtIds: [],
    };

    onSave(newThought, openImmediately);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave(false);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#252525]/35 backdrop-blur-[3px]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#FAF9F6] border border-[#E8E5DF] rounded-2xl p-6 sm:p-10 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-[#6B6A67] hover:text-[#252525] hover:bg-[#F3F1ED] rounded-lg transition-colors"
          aria-label="Close capture"
        >
          <X size={18} />
        </button>

        {/* Minimal header */}
        <div className="flex items-center gap-2 text-[#6B6A67] mb-2">
          <SparkMark size={16} />
          <span className="text-[11px] uppercase tracking-widest font-sans">
            Capture a thought
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-editorial font-normal text-[#252525] mb-6">
          What’s on your mind?
        </h2>

        {/* Big quiet text field */}
        <div className="mb-6">
          <textarea
            ref={textareaRef}
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write it exactly as it is. It doesn't have to make sense yet."
            className="w-full bg-transparent text-base sm:text-lg text-[#252525] placeholder:text-[#A39F97] placeholder:font-editorial placeholder:italic focus:outline-none border-b border-[#E8E5DF] focus:border-[#252525] pb-4 transition-colors font-serif leading-relaxed"
          />
        </div>

        {/* Subtle Optional Topic Selector */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="text-xs text-[#A39F97] mr-1">Optional Topic:</span>
          {topics.map((t) => {
            const isSelected = selectedTopic === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedTopic(isSelected ? '' : t)}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                  isSelected
                    ? 'bg-[#252525] text-[#FAF9F6] font-medium'
                    : 'bg-[#FFFFFF] border border-[#E8E5DF] text-[#6B6A67] hover:border-[#6B6A67]'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Actions bar */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
          <span className="text-[11px] text-[#A39F97]">
            Press <kbd className="font-mono bg-[#E8E5DF]/60 px-1.5 py-0.5 rounded text-[10px]">⌘ Enter</kbd> to save
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleSave(false)}
              disabled={!content.trim()}
              className="flex-1 sm:flex-initial px-5 py-2 text-xs font-medium text-[#FAF9F6] bg-[#252525] hover:bg-[#3D3C3A] disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm"
            >
              Save thought
            </button>

            <button
              onClick={() => handleSave(true)}
              disabled={!content.trim()}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-medium text-[#252525] bg-[#FFFFFF] border border-[#E8E5DF] hover:bg-[#F3F1ED] disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Save & Start unpacking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
