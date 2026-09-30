import React, { useState } from 'react';
import { Plus, Settings, BookOpen, Network, X } from 'lucide-react';
import { Thought, StatusFilter, TopicFilter } from '../types/thought';
import { BrandMark } from './EditorialMotifs';

interface Props {
  thoughts: Thought[];
  topics: string[];
  currentStatus: StatusFilter;
  currentTopic: TopicFilter;
  currentView: 'list' | 'map';
  onSelectStatus: (status: StatusFilter) => void;
  onSelectTopic: (topic: TopicFilter) => void;
  onSelectView: (view: 'list' | 'map') => void;
  onOpenCapture: () => void;
  onOpenPrinciples: () => void;
  onOpenSettings: () => void;
  onAddTopic: (newTopic: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  thoughts,
  topics,
  currentStatus,
  currentTopic,
  currentView,
  onSelectStatus,
  onSelectTopic,
  onSelectView,
  onOpenCapture,
  onOpenPrinciples,
  onOpenSettings,
  onAddTopic,
  isMobileOpen,
  onCloseMobile,
}: Props) {
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');

  // Counts
  const allCount = thoughts.length;
  const unsortedCount = thoughts.filter((t) => t.status === 'unsorted').length;
  const inProgressCount = thoughts.filter((t) => t.status === 'in_progress').length;
  const resolvedCount = thoughts.filter((t) => t.status === 'resolved').length;

  const getTopicCount = (topic: string) => {
    return thoughts.filter((t) => t.topic?.toLowerCase() === topic.toLowerCase()).length;
  };

  const handleAddTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTopicName.trim();
    if (trimmed && !topics.includes(trimmed)) {
      onAddTopic(trimmed);
      setNewTopicName('');
      setIsAddingTopic(false);
    }
  };

  const handleSelectStatus = (status: StatusFilter) => {
    onSelectStatus(status);
    onSelectView('list');
    onCloseMobile();
  };

  const handleSelectTopic = (topic: TopicFilter) => {
    onSelectTopic(topic);
    onSelectView('list');
    onCloseMobile();
  };

  const handleSelectView = (view: 'list' | 'map') => {
    onSelectView(view);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#252525]/20 backdrop-blur-[2px] md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#FAF9F6] border-r border-[#E8E5DF] flex flex-col justify-between transition-transform duration-200 ease-out select-none ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header */}
        <div className="p-6 pb-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <BrandMark size={20} className="text-[#252525]" />
              <div>
                <h1 className="text-base font-editorial font-medium tracking-tight text-[#252525]">
                  Thought Workspace
                </h1>
                <p className="text-[11px] text-[#A39F97] tracking-normal font-sans">
                  Private · Local
                </p>
              </div>
            </div>
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1 text-[#6B6A67] hover:text-[#252525]"
            >
              <X size={18} />
            </button>
          </div>

          {/* Capture quick trigger in sidebar */}
          <button
            onClick={() => {
              onOpenCapture();
              onCloseMobile();
            }}
            className="w-full py-2 px-3 mb-6 bg-[#FFFFFF] hover:bg-[#F3F1ED] border border-[#E8E5DF] hover:border-[#D4D0C7] text-[#252525] rounded-lg text-xs font-medium flex items-center justify-between transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)] group"
          >
            <span className="font-editorial text-sm">Capture a thought</span>
            <span className="text-[#6B6A67] text-xs font-sans group-hover:text-[#252525]">+</span>
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-6 text-xs">
          {/* THOUGHT STATUS */}
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#A39F97] font-sans mb-2 px-2">
              Thoughts
            </div>
            <nav className="space-y-0.5">
              <button
                onClick={() => handleSelectStatus('all')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors ${
                  currentView === 'list' && currentStatus === 'all' && currentTopic === 'all'
                    ? 'bg-[#F3F1ED] text-[#252525] font-medium'
                    : 'text-[#6B6A67] hover:text-[#252525] hover:bg-[#F3F1ED]/50'
                }`}
              >
                <span>All Thoughts</span>
                <span className="text-[11px] text-[#A39F97] tabular-nums">{allCount}</span>
              </button>

              <button
                onClick={() => handleSelectStatus('unsorted')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors ${
                  currentView === 'list' && currentStatus === 'unsorted'
                    ? 'bg-[#F3F1ED] text-[#252525] font-medium'
                    : 'text-[#6B6A67] hover:text-[#252525] hover:bg-[#F3F1ED]/50'
                }`}
              >
                <span>Unsorted</span>
                <span className="text-[11px] text-[#A39F97] tabular-nums">{unsortedCount}</span>
              </button>

              <button
                onClick={() => handleSelectStatus('in_progress')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors ${
                  currentView === 'list' && currentStatus === 'in_progress'
                    ? 'bg-[#F3F1ED] text-[#252525] font-medium'
                    : 'text-[#6B6A67] hover:text-[#252525] hover:bg-[#F3F1ED]/50'
                }`}
              >
                <span>In Progress</span>
                <span className="text-[11px] text-[#A39F97] tabular-nums">{inProgressCount}</span>
              </button>

              <button
                onClick={() => handleSelectStatus('resolved')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors ${
                  currentView === 'list' && currentStatus === 'resolved'
                    ? 'bg-[#F3F1ED] text-[#252525] font-medium'
                    : 'text-[#6B6A67] hover:text-[#252525] hover:bg-[#F3F1ED]/50'
                }`}
              >
                <span>Resolved</span>
                <span className="text-[11px] text-[#A39F97] tabular-nums">{resolvedCount}</span>
              </button>
            </nav>
          </div>

          {/* TOPICS */}
          <div>
            <div className="flex items-center justify-between mb-2 px-2">
              <span className="text-[10px] uppercase tracking-widest text-[#A39F97] font-sans">
                Topics
              </span>
              <button
                onClick={() => setIsAddingTopic(true)}
                className="text-[#A39F97] hover:text-[#252525] transition-colors"
                title="Add Topic"
              >
                <Plus size={12} />
              </button>
            </div>

            <nav className="space-y-0.5">
              {topics.map((topic) => {
                const count = getTopicCount(topic);
                const isActive = currentView === 'list' && currentTopic.toLowerCase() === topic.toLowerCase();
                return (
                  <button
                    key={topic}
                    onClick={() => handleSelectTopic(topic)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors ${
                      isActive
                        ? 'bg-[#F3F1ED] text-[#252525] font-medium'
                        : 'text-[#6B6A67] hover:text-[#252525] hover:bg-[#F3F1ED]/50'
                    }`}
                  >
                    <span>{topic}</span>
                    <span className="text-[11px] text-[#A39F97] tabular-nums">{count}</span>
                  </button>
                );
              })}

              {isAddingTopic && (
                <form onSubmit={handleAddTopicSubmit} className="pt-1 px-1">
                  <input
                    type="text"
                    autoFocus
                    placeholder="New topic name..."
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    onBlur={() => {
                      if (!newTopicName.trim()) setIsAddingTopic(false);
                    }}
                    className="w-full text-xs px-2 py-1 bg-white border border-[#E8E5DF] rounded focus:outline-none focus:border-[#6B6A67]"
                  />
                </form>
              )}
            </nav>
          </div>

          {/* PERSPECTIVES / VIEWS */}
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#A39F97] font-sans mb-2 px-2">
              Perspectives
            </div>
            <nav className="space-y-0.5">
              <button
                onClick={() => handleSelectView('map')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left transition-colors ${
                  currentView === 'map'
                    ? 'bg-[#F3F1ED] text-[#252525] font-medium'
                    : 'text-[#6B6A67] hover:text-[#252525] hover:bg-[#F3F1ED]/50'
                }`}
              >
                <Network size={13} className="text-[#A39F97]" />
                <span>Thought Connections</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Bottom Footer Actions */}
        <div className="p-4 border-t border-[#E8E5DF] space-y-1">
          <button
            onClick={onOpenPrinciples}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs text-[#6B6A67] hover:text-[#252525] hover:bg-[#F3F1ED]/70 transition-colors text-left"
          >
            <BookOpen size={14} className="text-[#A39F97]" />
            <span>Thinking Principles</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs text-[#6B6A67] hover:text-[#252525] hover:bg-[#F3F1ED]/70 transition-colors text-left"
          >
            <Settings size={14} className="text-[#A39F97]" />
            <span>Settings & Backup</span>
          </button>
        </div>
      </aside>
    </>
  );
}
