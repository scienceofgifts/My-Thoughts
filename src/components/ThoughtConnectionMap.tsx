import React, { useState } from 'react';
import { Thought, TopicFilter } from '../types/thought';
import { BranchMark, SparkMark } from './EditorialMotifs';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';

interface Props {
  thoughts: Thought[];
  topics: string[];
  onSelectThought: (thought: Thought) => void;
  onBackToList: () => void;
}

export function ThoughtConnectionMap({
  thoughts,
  topics,
  onSelectThought,
  onBackToList,
}: Props) {
  const [selectedTopic, setSelectedTopic] = useState<TopicFilter>('all');

  const filteredThoughts = thoughts.filter((t) => {
    if (selectedTopic === 'all') return true;
    return t.topic?.toLowerCase() === selectedTopic.toLowerCase();
  });

  // Calculate connection links
  const connections = thoughts.flatMap((thought) =>
    thought.relatedThoughtIds.map((targetId) => ({
      from: thought,
      to: thoughts.find((t) => t.id === targetId),
    }))
  ).filter((c) => c.to !== undefined);

  return (
    <div className="flex-1 min-h-screen overflow-y-auto px-6 sm:px-12 md:px-16 py-10 max-w-5xl mx-auto text-[#252525]">
      {/* Header */}
      <header className="mb-10 pb-6 border-b border-[#E8E5DF]">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBackToList}
            className="inline-flex items-center gap-1.5 text-xs text-[#6B6A67] hover:text-[#252525] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Return to Thought List</span>
          </button>
        </div>

        <h1 className="text-3xl font-editorial font-medium mb-2">
          Thought Connections
        </h1>
        <p className="text-sm text-[#6B6A67] font-serif italic">
          “Thoughts rarely live in isolation. Explore connected threads of thinking.”
        </p>

        {/* Filter by Topic */}
        <div className="flex flex-wrap items-center gap-2 mt-6">
          <span className="text-xs text-[#A39F97] mr-1">Filter view:</span>
          <button
            onClick={() => setSelectedTopic('all')}
            className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
              selectedTopic === 'all'
                ? 'bg-[#252525] text-white'
                : 'bg-white border border-[#E8E5DF] text-[#6B6A67] hover:border-[#6B6A67]'
            }`}
          >
            All ({thoughts.length})
          </button>
          {topics.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTopic(t)}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                selectedTopic.toLowerCase() === t.toLowerCase()
                  ? 'bg-[#252525] text-white'
                  : 'bg-white border border-[#E8E5DF] text-[#6B6A67] hover:border-[#6B6A67]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      {/* Visual Nodal Matrix of Connected Thoughts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
        {filteredThoughts.map((thought) => {
          const linkedThoughts = thoughts.filter((t) =>
            thought.relatedThoughtIds.includes(t.id)
          );

          return (
            <div
              key={thought.id}
              onClick={() => onSelectThought(thought)}
              className="p-6 bg-white border border-[#E8E5DF] hover:border-[#6B6A67] rounded-xl transition-all cursor-pointer group shadow-[0_1px_2px_rgba(0,0,0,0.01)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2 text-xs text-[#A39F97]">
                  <span className="font-medium text-[#6B6A67]">
                    {thought.topic || 'Uncategorized'}
                  </span>
                  <span
                    className={
                      thought.status === 'resolved'
                        ? 'text-[#3E5C50]'
                        : thought.status === 'in_progress'
                        ? 'text-[#3D5F7A]'
                        : 'text-[#6B6A67]'
                    }
                  >
                    {thought.status === 'in_progress'
                      ? 'In Progress'
                      : thought.status === 'resolved'
                      ? 'Resolved'
                      : 'Unsorted'}
                  </span>
                </div>

                <h2 className="text-lg font-editorial font-medium text-[#252525] group-hover:text-black mb-2 leading-snug">
                  {thought.title}
                </h2>

                <p className="text-xs text-[#6B6A67] font-serif line-clamp-2 mb-4 leading-relaxed">
                  {thought.botheringMe || thought.rawThought}
                </p>
              </div>

              {/* Linked indicators */}
              <div className="pt-3 border-t border-[#E8E5DF]/60">
                {linkedThoughts.length > 0 ? (
                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase tracking-widest text-[#A39F97] flex items-center gap-1 font-sans">
                      <BranchMark size={11} className="text-[#6B6A67]" />
                      <span>Connected threads ({linkedThoughts.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {linkedThoughts.map((lt) => (
                        <span
                          key={lt.id}
                          className="text-[11px] text-[#252525] font-serif bg-[#FAF9F6] border border-[#E8E5DF] px-2 py-0.5 rounded truncate max-w-[200px]"
                        >
                          {lt.title}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-[11px] text-[#A39F97] font-serif italic">
                    <span>Standalone thought</span>
                    <span className="flex items-center gap-1 group-hover:text-[#252525]">
                      Explore <ArrowUpRight size={12} />
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
