import React, { useState, useMemo } from 'react';
import { Search, Pin, Plus, CheckCircle2, Circle, ArrowUpRight, ArrowUpDown, Trash2 } from 'lucide-react';
import { Thought, StatusFilter, TopicFilter } from '../types/thought';
import { EmptyAbstractArt, BranchMark, SparkMark, ResolveMark } from './EditorialMotifs';

interface Props {
  thoughts: Thought[];
  currentStatus: StatusFilter;
  currentTopic: TopicFilter;
  onSelectThought: (thought: Thought) => void;
  onOpenCapture: () => void;
  onTogglePin: (thought: Thought, e: React.MouseEvent) => void;
  onToggleResolve: (thought: Thought, e: React.MouseEvent) => void;
  onDeleteThought: (id: string, e: React.MouseEvent) => void;
  onSelectStatusFilter: (status: StatusFilter) => void;
  onSelectTopicFilter: (topic: TopicFilter) => void;
}

type SortOption = 'updated' | 'created' | 'unpacked';

export function ThoughtList({
  thoughts,
  currentStatus,
  currentTopic,
  onSelectThought,
  onOpenCapture,
  onTogglePin,
  onToggleResolve,
  onDeleteThought,
  onSelectStatusFilter,
  onSelectTopicFilter,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('updated');

  // Count unpacked layers helper
  const countUnpackedLayers = (t: Thought) => {
    let count = 0;
    if (t.botheringMe?.trim()) count++;
    if (t.whatMightBeTrue?.trim()) count++;
    if (t.whatMightNotBeTrue?.trim()) count++;
    if (t.whatICanControl?.trim()) count++;
    if (t.whatICanDo?.trim()) count++;
    if (t.nextAction?.trim()) count++;
    if (t.resolution?.trim()) count++;
    return count;
  };

  // Filter thoughts
  const filteredThoughts = useMemo(() => {
    return thoughts
      .filter((t) => {
        // Status filter
        if (currentStatus !== 'all' && t.status !== currentStatus) {
          return false;
        }
        // Topic filter
        if (currentTopic !== 'all' && t.topic?.toLowerCase() !== currentTopic.toLowerCase()) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchRaw = t.rawThought.toLowerCase().includes(q);
          const matchBother = t.botheringMe?.toLowerCase().includes(q);
          const matchTrue = t.whatMightBeTrue?.toLowerCase().includes(q);
          const matchUntrue = t.whatMightNotBeTrue?.toLowerCase().includes(q);
          const matchControl = t.whatICanControl?.toLowerCase().includes(q);
          const matchDo = t.whatICanDo?.toLowerCase().includes(q);
          const matchAction = t.nextAction?.toLowerCase().includes(q);
          const matchResolution = t.resolution?.toLowerCase().includes(q);

          return (
            matchTitle ||
            matchRaw ||
            matchBother ||
            matchTrue ||
            matchUntrue ||
            matchControl ||
            matchDo ||
            matchAction ||
            matchResolution
          );
        }
        return true;
      })
      .sort((a, b) => {
        // Pinned first
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;

        if (sortBy === 'updated') {
          return b.updatedAt - a.updatedAt;
        }
        if (sortBy === 'created') {
          return b.createdAt - a.createdAt;
        }
        if (sortBy === 'unpacked') {
          return countUnpackedLayers(b) - countUnpackedLayers(a);
        }
        return 0;
      });
  }, [thoughts, currentStatus, currentTopic, searchQuery, sortBy]);

  // Format date readable
  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const statusLabel = {
    all: 'All Thoughts',
    unsorted: 'Unsorted',
    in_progress: 'In Progress',
    resolved: 'Resolved',
  }[currentStatus];

  return (
    <div className="flex-1 min-h-screen overflow-y-auto px-6 sm:px-12 md:px-16 py-10 max-w-5xl mx-auto">
      {/* Top Header */}
      <header className="mb-10 pb-8 border-b border-[#E8E5DF]">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-editorial font-medium text-[#252525] tracking-tight mb-2">
              My thoughts
            </h1>
            <p className="text-sm text-[#6B6A67] italic font-editorial">
              “Things I've been carrying around.”
            </p>
          </div>

          <button
            onClick={onOpenCapture}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 bg-[#252525] hover:bg-[#3D3C3A] text-[#FAF9F6] rounded-lg text-xs font-medium transition-colors shadow-sm cursor-pointer"
          >
            <SparkMark size={14} className="text-[#FAF9F6]" />
            <span>+ Capture a thought</span>
          </button>
        </div>

        {/* Filter bar and Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          {/* Active Context indicator */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B6A67]">
            <span>Showing:</span>
            <span className="font-medium text-[#252525]">{statusLabel}</span>
            {currentTopic !== 'all' && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-[#252525]">{currentTopic}</span>
                <button
                  onClick={() => onSelectTopicFilter('all')}
                  className="text-[11px] text-[#6B6A67] underline hover:text-[#252525] ml-1"
                >
                  Clear topic
                </button>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span className="text-[#A39F97] tabular-nums">
              {filteredThoughts.length} {filteredThoughts.length === 1 ? 'thought' : 'thoughts'}
            </span>
          </div>

          {/* Search and Sort */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-56">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#A39F97]"
              />
              <input
                type="text"
                placeholder="Search thoughts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#E8E5DF] rounded-md focus:outline-none focus:border-[#6B6A67] placeholder:text-[#A39F97] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#A39F97] hover:text-[#252525]"
                >
                  ×
                </button>
              )}
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-xs py-1.5 px-2.5 bg-white border border-[#E8E5DF] rounded-md text-[#6B6A67] focus:outline-none focus:border-[#6B6A67] cursor-pointer"
              >
                <option value="updated">Recently active</option>
                <option value="created">Date added</option>
                <option value="unpacked">Most unpacked</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Thought Editorial List */}
      {filteredThoughts.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center">
          <EmptyAbstractArt className="text-[#D6CEBE] mb-6" />
          <h2 className="text-xl font-editorial text-[#252525] mb-2 font-medium">
            {searchQuery ? 'No matching thoughts found.' : 'Nothing here yet.'}
          </h2>
          <p className="text-xs text-[#6B6A67] max-w-sm mb-6 font-serif italic">
            {searchQuery
              ? 'Try searching for different keywords or clear filters.'
              : 'Put the thought somewhere other than your head.'}
          </p>
          <button
            onClick={onOpenCapture}
            className="px-4 py-2 bg-white border border-[#E8E5DF] hover:border-[#6B6A67] text-[#252525] text-xs font-medium rounded-lg transition-colors"
          >
            + Capture a thought
          </button>
        </div>
      ) : (
        <div className="divide-y divide-[#E8E5DF]/70">
          {filteredThoughts.map((thought) => {
            const unpackedCount = countUnpackedLayers(thought);
            const isResolved = thought.status === 'resolved';

            return (
              <article
                key={thought.id}
                onClick={() => onSelectThought(thought)}
                className="group py-6 px-3 -mx-3 rounded-xl hover:bg-[#F3F1ED]/40 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      {thought.pinned && (
                        <span className="text-[#6B6A67] text-[11px] flex items-center gap-1">
                          <Pin size={11} className="fill-current text-[#6B6A67]" />
                          <span className="sr-only">Pinned</span>
                        </span>
                      )}
                      <h2
                        className={`text-lg sm:text-xl font-editorial text-[#252525] font-medium leading-snug group-hover:text-[#000000] transition-colors ${
                          isResolved ? 'text-[#6B6A67]' : ''
                        }`}
                      >
                        {thought.title}
                      </h2>
                    </div>

                    {/* Excerpt */}
                    <p className="text-xs sm:text-sm text-[#6B6A67] font-serif line-clamp-2 leading-relaxed mb-3">
                      {thought.botheringMe
                        ? `Bother: ${thought.botheringMe}`
                        : thought.rawThought}
                    </p>

                    {/* Clean unboxed metadata */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#A39F97]">
                      {thought.topic && (
                        <>
                          <span className="text-[#6B6A67] font-medium">{thought.topic}</span>
                          <span aria-hidden="true">·</span>
                        </>
                      )}

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

                      <span aria-hidden="true">·</span>
                      <span>{formatDate(thought.updatedAt)}</span>

                      <span aria-hidden="true">·</span>
                      <span className="text-[#6B6A67]">
                        {unpackedCount === 0
                          ? 'Raw'
                          : `${unpackedCount} ${unpackedCount === 1 ? 'layer' : 'layers'} unpacked`}
                      </span>

                      {thought.relatedThoughtIds.length > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1 text-[#6B6A67]">
                            <BranchMark size={12} className="text-[#6B6A67]" />
                            <span>{thought.relatedThoughtIds.length} connected</span>
                          </span>
                        </>
                      )}

                      {thought.nextAction && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#252525] italic font-serif truncate max-w-[200px]">
                            Next: {thought.nextAction}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Quick Row Actions */}
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => onTogglePin(thought, e)}
                      title={thought.pinned ? 'Unpin' : 'Pin to top'}
                      className="p-1.5 text-[#A39F97] hover:text-[#252525] hover:bg-[#E8E5DF]/50 rounded-md transition-colors"
                    >
                      <Pin
                        size={14}
                        className={thought.pinned ? 'fill-current text-[#252525]' : ''}
                      />
                    </button>

                    <button
                      onClick={(e) => onToggleResolve(thought, e)}
                      title={isResolved ? 'Mark in progress' : 'Mark resolved'}
                      className="p-1.5 text-[#A39F97] hover:text-[#252525] hover:bg-[#E8E5DF]/50 rounded-md transition-colors"
                    >
                      <ResolveMark size={15} resolved={isResolved} />
                    </button>

                    <button
                      onClick={(e) => onDeleteThought(thought.id, e)}
                      title="Delete thought"
                      className="p-1.5 text-[#A39F97] hover:text-[#9A3412] hover:bg-[#FAF3F0] rounded-md transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>

                    <span className="p-1 text-[#A39F97] group-hover:text-[#252525]">
                      <ArrowUpRight size={15} />
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
