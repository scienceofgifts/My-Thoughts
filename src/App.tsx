/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Menu, Plus } from 'lucide-react';
import { Thought, StatusFilter, TopicFilter, AppSettings } from './types/thought';
import {
  initDatabase,
  getAllThoughts,
  saveThought,
  deleteThought as deleteThoughtFromDb,
  getStoredSettings,
  saveStoredSettings,
  getCustomTopics,
  saveCustomTopics,
} from './lib/db';
import { toggleAmbientNoise } from './lib/ambientSound';
import { BrandMark, SparkMark } from './components/EditorialMotifs';
import { Sidebar } from './components/Sidebar';
import { ThoughtList } from './components/ThoughtList';
import { ThoughtWorkspace } from './components/ThoughtWorkspace';
import { ThoughtConnectionMap } from './components/ThoughtConnectionMap';
import { CaptureModal } from './components/CaptureModal';
import { ThinkingPrinciplesModal } from './components/ThinkingPrinciplesModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [topics, setTopics] = useState<string[]>(getCustomTopics());
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings());
  const [currentStatus, setCurrentStatus] = useState<StatusFilter>('all');
  const [currentTopic, setCurrentTopic] = useState<TopicFilter>('all');
  const [selectedThoughtId, setSelectedThoughtId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'map'>('list');

  // Modals & Drawers
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const [isPrinciplesOpen, setIsPrinciplesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize DB on mount
  useEffect(() => {
    async function loadData() {
      try {
        const loadedThoughts = await initDatabase();
        setThoughts(loadedThoughts);
      } catch (err) {
        console.error('Failed to init DB', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === 'c' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setIsCaptureOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers
  const handleSaveNewThought = async (newThought: Thought, openImmediately: boolean) => {
    await saveThought(newThought);
    const updated = await getAllThoughts();
    setThoughts(updated);

    if (openImmediately) {
      setSelectedThoughtId(newThought.id);
    }
  };

  const handleUpdateThought = async (updated: Thought) => {
    await saveThought(updated);
    setThoughts((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t))
    );
  };

  const handleDeleteThought = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await deleteThoughtFromDb(id);
    setThoughts((prev) => prev.filter((t) => t.id !== id));
    if (selectedThoughtId === id) {
      setSelectedThoughtId(null);
    }
  };

  const handleTogglePin = async (thought: Thought, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated: Thought = {
      ...thought,
      pinned: !thought.pinned,
      updatedAt: Date.now(),
    };
    await handleUpdateThought(updated);
  };

  const handleToggleResolve = async (thought: Thought, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = thought.status === 'resolved' ? 'in_progress' : 'resolved';
    const updated: Thought = {
      ...thought,
      status: nextStatus,
      updatedAt: Date.now(),
    };
    await handleUpdateThought(updated);
  };

  const handleCreateBranchThought = async (parentId: string, rawText: string) => {
    const lines = rawText.split('\n');
    const firstLine = lines[0].trim();
    const title = firstLine.length > 70 ? firstLine.slice(0, 70) + '…' : firstLine;

    const newThought: Thought = {
      id: `thought_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title,
      rawThought: rawText,
      status: 'unsorted',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      relatedThoughtIds: [parentId],
    };

    await saveThought(newThought);

    // Also link back from parent
    const parent = thoughts.find((t) => t.id === parentId);
    if (parent && !parent.relatedThoughtIds.includes(newThought.id)) {
      const updatedParent = {
        ...parent,
        relatedThoughtIds: [...parent.relatedThoughtIds, newThought.id],
        updatedAt: Date.now(),
      };
      await saveThought(updatedParent);
    }

    const reloaded = await getAllThoughts();
    setThoughts(reloaded);
  };

  const handleAddTopic = (newTopic: string) => {
    if (!topics.includes(newTopic)) {
      const updated = [...topics, newTopic];
      setTopics(updated);
      saveCustomTopics(updated);
    }
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  const handleDataReset = (freshThoughts: Thought[]) => {
    setThoughts(freshThoughts);
    setSelectedThoughtId(null);
  };

  const activeThought = thoughts.find((t) => t.id === selectedThoughtId);

  // Font size modifier classes
  const fontScaleClass =
    settings.fontSize === 'large'
      ? 'text-base'
      : settings.fontSize === 'compact'
      ? 'text-xs'
      : 'text-sm';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center text-[#6B6A67]">
        <div className="flex items-center gap-3">
          <BrandMark size={20} className="animate-pulse text-[#252525]" />
          <span className="font-editorial text-lg text-[#252525]">Opening Thought Workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#FAF9F6] text-[#252525] flex flex-col md:flex-row ${fontScaleClass}`}>
      {/* Mobile Top Navigation */}
      <header className="md:hidden flex items-center justify-between px-5 py-3.5 bg-[#FAF9F6] border-b border-[#E8E5DF] sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-1.5 text-[#6B6A67] hover:text-[#252525]"
            aria-label="Open navigation menu"
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2">
            <BrandMark size={16} />
            <span className="font-editorial font-medium text-sm">Thought Workspace</span>
          </div>
        </div>

        <button
          onClick={() => setIsCaptureOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#252525] text-[#FAF9F6] rounded-md text-xs font-medium"
        >
          <Plus size={13} />
          <span>Capture</span>
        </button>
      </header>

      {/* Persistent Left Sidebar */}
      <Sidebar
        thoughts={thoughts}
        topics={topics}
        currentStatus={currentStatus}
        currentTopic={currentTopic}
        currentView={currentView}
        onSelectStatus={(s) => {
          setCurrentStatus(s);
          setSelectedThoughtId(null);
        }}
        onSelectTopic={(t) => {
          setCurrentTopic(t);
          setSelectedThoughtId(null);
        }}
        onSelectView={(v) => {
          setCurrentView(v);
          setSelectedThoughtId(null);
        }}
        onOpenCapture={() => setIsCaptureOpen(true)}
        onOpenPrinciples={() => setIsPrinciplesOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onAddTopic={handleAddTopic}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#FAF9F6]">
        {activeThought ? (
          <ThoughtWorkspace
            thought={activeThought}
            allThoughts={thoughts}
            topics={topics}
            onUpdateThought={handleUpdateThought}
            onDeleteThought={handleDeleteThought}
            onBack={() => setSelectedThoughtId(null)}
            onSelectRelatedThought={(rel) => setSelectedThoughtId(rel.id)}
            onCreateBranchThought={handleCreateBranchThought}
          />
        ) : currentView === 'map' ? (
          <ThoughtConnectionMap
            thoughts={thoughts}
            topics={topics}
            onSelectThought={(t) => setSelectedThoughtId(t.id)}
            onBackToList={() => setCurrentView('list')}
          />
        ) : (
          <ThoughtList
            thoughts={thoughts}
            currentStatus={currentStatus}
            currentTopic={currentTopic}
            onSelectThought={(t) => setSelectedThoughtId(t.id)}
            onOpenCapture={() => setIsCaptureOpen(true)}
            onTogglePin={handleTogglePin}
            onToggleResolve={handleToggleResolve}
            onDeleteThought={handleDeleteThought}
            onSelectStatusFilter={setCurrentStatus}
            onSelectTopicFilter={setCurrentTopic}
          />
        )}
      </main>

      {/* Modals */}
      <CaptureModal
        isOpen={isCaptureOpen}
        onClose={() => setIsCaptureOpen(false)}
        onSave={handleSaveNewThought}
        topics={topics}
        defaultTopic={currentTopic !== 'all' ? currentTopic : undefined}
      />

      <ThinkingPrinciplesModal
        isOpen={isPrinciplesOpen}
        onClose={() => setIsPrinciplesOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onDataReset={handleDataReset}
      />
    </div>
  );
}
