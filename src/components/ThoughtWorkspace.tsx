import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Pin,
  Trash2,
  Share2,
  Check,
  Eye,
  Edit3,
  Plus,
  X,
  Sparkles,
  Link as LinkIcon,
  ExternalLink,
} from 'lucide-react';
import { Thought, ThoughtStatus } from '../types/thought';
import {
  BotheringMark,
  InquiryMark,
  UntrueMark,
  CompassMark,
  ActionMark,
  NextMark,
  BranchMark,
  ResolveMark,
  SparkMark,
} from './EditorialMotifs';

interface Props {
  thought: Thought;
  allThoughts: Thought[];
  topics: string[];
  onUpdateThought: (updated: Thought) => void;
  onDeleteThought: (id: string) => void;
  onBack: () => void;
  onSelectRelatedThought: (thought: Thought) => void;
  onCreateBranchThought: (parentId: string, rawText: string) => void;
}

export function ThoughtWorkspace({
  thought,
  allThoughts,
  topics,
  onUpdateThought,
  onDeleteThought,
  onBack,
  onSelectRelatedThought,
  onCreateBranchThought,
}: Props) {
  const [current, setCurrent] = useState<Thought>(thought);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [isConnectingOpen, setIsConnectingOpen] = useState(false);
  const [isBranchingOpen, setIsBranchingOpen] = useState(false);
  const [newBranchContent, setNewBranchContent] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state if thought prop ID changes
  useEffect(() => {
    setCurrent(thought);
    setIsConnectingOpen(false);
    setIsBranchingOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [thought.id]);

  // Debounced auto-save
  const triggerSave = (updated: Thought) => {
    setCurrent(updated);
    setSaveStatus('saving');

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      onUpdateThought({ ...updated, updatedAt: Date.now() });
      setSaveStatus('saved');
    }, 400);
  };

  const handleFieldChange = (field: keyof Thought, value: any) => {
    const updated = {
      ...current,
      [field]: value,
    };
    triggerSave(updated);
  };

  const handleToggleResolve = () => {
    const newStatus: ThoughtStatus = current.status === 'resolved' ? 'in_progress' : 'resolved';
    const updated = {
      ...current,
      status: newStatus,
    };
    triggerSave(updated);
  };

  const handleAddRelatedId = (id: string) => {
    if (!current.relatedThoughtIds.includes(id)) {
      const updated = {
        ...current,
        relatedThoughtIds: [...current.relatedThoughtIds, id],
      };
      triggerSave(updated);
    }
    setIsConnectingOpen(false);
  };

  const handleRemoveRelatedId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = {
      ...current,
      relatedThoughtIds: current.relatedThoughtIds.filter((tId) => tId !== id),
    };
    triggerSave(updated);
  };

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchContent.trim()) return;
    onCreateBranchThought(current.id, newBranchContent.trim());
    setNewBranchContent('');
    setIsBranchingOpen(false);
  };

  const handleExportMarkdown = () => {
    let md = `# ${current.title}\n\n`;
    if (current.topic) md += `*Topic: ${current.topic}* · *Status: ${current.status}*\n\n`;
    md += `## 01. Raw Thought\n${current.rawThought}\n\n`;
    if (current.botheringMe) md += `## 02. What's Actually Bothering Me?\n${current.botheringMe}\n\n`;
    if (current.whatMightBeTrue) md += `## 03. What Might Be True?\n${current.whatMightBeTrue}\n\n`;
    if (current.whatMightNotBeTrue) md += `## 04. What Might Not Be True?\n${current.whatMightNotBeTrue}\n\n`;
    if (current.whatICanControl) md += `## 05. What Can I Control?\n${current.whatICanControl}\n\n`;
    if (current.whatICanDo) md += `## 06. What Could I Do?\n${current.whatICanDo}\n\n`;
    if (current.nextAction) md += `## 07. Possible Next Action\n${current.nextAction}\n\n`;
    if (current.resolution) md += `## Resolution\n${current.resolution}\n\n`;

    navigator.clipboard.writeText(md);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  // Connected thoughts list
  const relatedThoughts = allThoughts.filter((t) =>
    current.relatedThoughtIds.includes(t.id)
  );

  // Available thoughts to connect
  const candidatesToConnect = allThoughts.filter(
    (t) => t.id !== current.id && !current.relatedThoughtIds.includes(t.id)
  );

  // Formatting dates
  const addedDate = new Date(current.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="flex-1 min-h-screen overflow-y-auto px-6 sm:px-12 md:px-20 py-8 max-w-4xl mx-auto text-[#252525]">
      {/* Navigation & Utilities Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-[#E8E5DF] text-xs">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[#6B6A67] hover:text-[#252525] transition-colors group cursor-pointer"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>All thoughts</span>
        </button>

        {/* Right action utilities */}
        <div className="flex items-center gap-3">
          {/* Save status badge */}
          <span className="text-[11px] text-[#A39F97] flex items-center gap-1">
            {saveStatus === 'saving' ? (
              'Saving...'
            ) : (
              <>
                <Check size={12} className="text-[#8EAA9D]" />
                Saved
              </>
            )}
          </span>

          {/* Reading / Edit Mode toggle */}
          <button
            onClick={() => setIsReadingMode(!isReadingMode)}
            className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition-colors ${
              isReadingMode
                ? 'bg-[#252525] text-[#FAF9F6] border-[#252525]'
                : 'bg-white text-[#6B6A67] border-[#E8E5DF] hover:border-[#6B6A67]'
            }`}
            title="Toggle reflective reading mode"
          >
            {isReadingMode ? <Edit3 size={12} /> : <Eye size={12} />}
            <span>{isReadingMode ? 'Edit Layers' : 'Reflective Read'}</span>
          </button>

          {/* Copy / Export */}
          <button
            onClick={handleExportMarkdown}
            className="p-1.5 bg-white border border-[#E8E5DF] hover:border-[#6B6A67] text-[#6B6A67] hover:text-[#252525] rounded-md transition-colors"
            title="Copy thought as Markdown"
          >
            {copyFeedback ? <Check size={14} className="text-[#3E5C50]" /> : <Share2 size={14} />}
          </button>

          {/* Pin */}
          <button
            onClick={() => handleFieldChange('pinned', !current.pinned)}
            className="p-1.5 bg-white border border-[#E8E5DF] hover:border-[#6B6A67] text-[#6B6A67] hover:text-[#252525] rounded-md transition-colors"
            title={current.pinned ? 'Unpin' : 'Pin to top'}
          >
            <Pin size={14} className={current.pinned ? 'fill-current text-[#252525]' : ''} />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDeleteThought(current.id)}
            className="p-1.5 bg-white border border-[#E8E5DF] hover:border-[#9A3412] text-[#A39F97] hover:text-[#9A3412] rounded-md transition-colors"
            title="Delete this thought"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Main Header & Metadata */}
      <header className="mb-10">
        {/* Topic and Status Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-3 text-xs">
          {/* Topic Dropdown */}
          <select
            value={current.topic || ''}
            onChange={(e) => handleFieldChange('topic', e.target.value || undefined)}
            className="bg-transparent border-b border-[#E8E5DF] pb-0.5 text-[#6B6A67] hover:text-[#252525] focus:outline-none cursor-pointer"
          >
            <option value="">No Topic</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <span aria-hidden="true" className="text-[#E8E5DF]">·</span>

          {/* Status Selector */}
          <select
            value={current.status}
            onChange={(e) => handleFieldChange('status', e.target.value as ThoughtStatus)}
            className={`bg-transparent border-b border-[#E8E5DF] pb-0.5 focus:outline-none font-medium cursor-pointer ${
              current.status === 'resolved'
                ? 'text-[#3E5C50]'
                : current.status === 'in_progress'
                ? 'text-[#3D5F7A]'
                : 'text-[#6B6A67]'
            }`}
          >
            <option value="unsorted">Unsorted</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <span aria-hidden="true" className="text-[#E8E5DF]">·</span>
          <span className="text-[#A39F97]">Added {addedDate}</span>
        </div>

        {/* Thought Title (Editable) */}
        {isReadingMode ? (
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-editorial font-normal leading-tight text-[#252525] mb-2">
            {current.title}
          </h1>
        ) : (
          <input
            type="text"
            value={current.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            className="w-full text-2xl sm:text-3xl lg:text-4xl font-editorial font-normal leading-tight text-[#252525] bg-transparent border-none focus:outline-none border-b border-transparent focus:border-[#E8E5DF] pb-1 transition-colors"
            placeholder="Name this thought..."
          />
        )}
      </header>

      {/* READING MODE VIEW */}
      {isReadingMode ? (
        <article className="space-y-8 text-base text-[#252525] leading-relaxed font-serif max-w-prose">
          <section className="p-6 bg-[#FFFFFF] border border-[#E8E5DF] rounded-xl">
            <div className="text-[11px] uppercase tracking-widest text-[#A39F97] font-sans mb-2">
              Raw Thought
            </div>
            <p className="text-lg italic text-[#252525] font-editorial">
              "{current.rawThought}"
            </p>
          </section>

          {current.botheringMe && (
            <section className="space-y-1">
              <div className="text-[11px] uppercase tracking-widest text-[#A39F97] font-sans">
                What is actually bothering me?
              </div>
              <p className="text-base text-[#252525]">{current.botheringMe}</p>
            </section>
          )}

          {(current.whatMightBeTrue || current.whatMightNotBeTrue) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {current.whatMightBeTrue && (
                <div className="p-4 bg-[#EEF4F8]/50 border border-[#8FAFC8]/40 rounded-lg space-y-1">
                  <div className="text-[11px] uppercase tracking-widest text-[#3D5F7A] font-sans">
                    What might be true
                  </div>
                  <p className="text-sm text-[#252525]">{current.whatMightBeTrue}</p>
                </div>
              )}

              {current.whatMightNotBeTrue && (
                <div className="p-4 bg-[#FAF9F6] border border-[#E8E5DF] rounded-lg space-y-1">
                  <div className="text-[11px] uppercase tracking-widest text-[#6B6A67] font-sans">
                    What might not be true
                  </div>
                  <p className="text-sm text-[#252525]">{current.whatMightNotBeTrue}</p>
                </div>
              )}
            </div>
          )}

          {(current.whatICanControl || current.whatICanDo) && (
            <div className="space-y-4 pt-2">
              {current.whatICanControl && (
                <section className="space-y-1">
                  <div className="text-[11px] uppercase tracking-widest text-[#A39F97] font-sans">
                    What is within my control
                  </div>
                  <p className="text-base text-[#252525]">{current.whatICanControl}</p>
                </section>
              )}

              {current.whatICanDo && (
                <section className="space-y-1">
                  <div className="text-[11px] uppercase tracking-widest text-[#A39F97] font-sans">
                    What I could do
                  </div>
                  <p className="text-base text-[#252525]">{current.whatICanDo}</p>
                </section>
              )}
            </div>
          )}

          {current.nextAction && (
            <section className="p-4 bg-[#EEF3F0] border border-[#8EAA9D]/40 rounded-lg space-y-1">
              <div className="text-[11px] uppercase tracking-widest text-[#3E5C50] font-sans">
                Possible Next Action
              </div>
              <p className="text-base font-medium text-[#252525]">{current.nextAction}</p>
            </section>
          )}

          {current.resolution && (
            <section className="p-5 border-t border-[#E8E5DF] space-y-1">
              <div className="text-[11px] uppercase tracking-widest text-[#3E5C50] font-sans">
                Conclusion / Resolution
              </div>
              <p className="text-base italic text-[#252525]">{current.resolution}</p>
            </section>
          )}
        </article>
      ) : (
        /* EDITABLE UNPACKING WORKSPACE (THE CONVERSATION WITH ONESELF) */
        <div className="space-y-10 pb-16">
          {/* LAYER 01: RAW THOUGHT */}
          <LayerSection
            stepNumber="01"
            title="Raw Thought"
            motif={<SparkMark size={15} className="text-[#6B6A67]" />}
            guide="The unfiltered, messy reality as it first appeared in your head."
          >
            <AutoTextarea
              value={current.rawThought}
              onChange={(val) => handleFieldChange('rawThought', val)}
              placeholder="What was the raw thought?"
            />
          </LayerSection>

          {/* LAYER 02: WHAT IS ACTUALLY BOTHERING ME? */}
          <LayerSection
            stepNumber="02"
            title="What is actually bothering me?"
            motif={<BotheringMark size={15} className="text-[#6B6A67]" />}
            guide="Look beneath the surface trigger. Is it fear of regret? Feeling helpless? A boundary being crossed?"
          >
            <AutoTextarea
              value={current.botheringMe || ''}
              onChange={(val) => handleFieldChange('botheringMe', val || undefined)}
              placeholder="+ Unpack what is underneath this thought..."
            />
          </LayerSection>

          {/* TWO-COLUMN INQUIRY: WHAT MIGHT BE TRUE vs WHAT MIGHT NOT BE TRUE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            {/* LAYER 03: WHAT MIGHT BE TRUE? */}
            <LayerSection
              stepNumber="03"
              title="What might be true?"
              motif={<InquiryMark size={15} className="text-[#8FAFC8]" />}
              guide="Acknowledge genuine facts or valid friction without denial."
            >
              <AutoTextarea
                value={current.whatMightBeTrue || ''}
                onChange={(val) => handleFieldChange('whatMightBeTrue', val || undefined)}
                placeholder="+ Name what might be true..."
              />
            </LayerSection>

            {/* LAYER 04: WHAT MIGHT NOT BE TRUE? */}
            <LayerSection
              stepNumber="04"
              title="What might not be true?"
              motif={<UntrueMark size={15} className="text-[#6B6A67]" />}
              guide="Challenge the catastrophizing, mind-reading, or black-and-white assumptions."
            >
              <AutoTextarea
                value={current.whatMightNotBeTrue || ''}
                onChange={(val) => handleFieldChange('whatMightNotBeTrue', val || undefined)}
                placeholder="+ Name what might not be true..."
              />
            </LayerSection>
          </div>

          {/* AGENCY & ACTIONS: WHAT CAN I CONTROL vs WHAT COULD I DO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            {/* LAYER 05: WHAT IS WITHIN MY CONTROL? */}
            <LayerSection
              stepNumber="05"
              title="What can I control?"
              motif={<CompassMark size={15} className="text-[#8FAFC8]" />}
              guide="Center your attention strictly inside your sphere of agency."
            >
              <AutoTextarea
                value={current.whatICanControl || ''}
                onChange={(val) => handleFieldChange('whatICanControl', val || undefined)}
                placeholder="+ What is in my hands right now..."
              />
            </LayerSection>

            {/* LAYER 06: WHAT CAN I DO ABOUT IT? */}
            <LayerSection
              stepNumber="06"
              title="What could I do?"
              motif={<ActionMark size={15} className="text-[#6B6A67]" />}
              guide="Explore possible options or responses freely without committing yet."
            >
              <AutoTextarea
                value={current.whatICanDo || ''}
                onChange={(val) => handleFieldChange('whatICanDo', val || undefined)}
                placeholder="+ Possible options..."
              />
            </LayerSection>
          </div>

          {/* LAYER 07: POSSIBLE NEXT ACTION */}
          <LayerSection
            stepNumber="07"
            title="Possible next action"
            motif={<NextMark size={15} className="text-[#8EAA9D]" />}
            guide="A single, low-friction, immediate step if you want to take one."
          >
            <AutoTextarea
              value={current.nextAction || ''}
              onChange={(val) => handleFieldChange('nextAction', val || undefined)}
              placeholder="+ A clear, gentle next step (optional)..."
            />
          </LayerSection>

          {/* LAYER 08: RELATED THOUGHTS */}
          <div className="pt-6 border-t border-[#E8E5DF]/70">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#A39F97] font-mono">08</span>
                <BranchMark size={15} className="text-[#6B6A67]" />
                <h3 className="text-xs uppercase tracking-widest text-[#6B6A67] font-sans">
                  Related thoughts
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsConnectingOpen(!isConnectingOpen)}
                  className="text-xs text-[#6B6A67] hover:text-[#252525] flex items-center gap-1 transition-colors"
                >
                  <LinkIcon size={12} />
                  <span>Connect thought</span>
                </button>

                <button
                  onClick={() => setIsBranchingOpen(!isBranchingOpen)}
                  className="text-xs text-[#6B6A67] hover:text-[#252525] flex items-center gap-1 transition-colors"
                >
                  <Plus size={12} />
                  <span>Branch new</span>
                </button>
              </div>
            </div>

            {/* Connection picker dropdown */}
            {isConnectingOpen && (
              <div className="p-3 mb-4 bg-white border border-[#E8E5DF] rounded-xl shadow-sm space-y-2">
                <div className="flex items-center justify-between text-xs text-[#6B6A67] mb-1">
                  <span>Select a thought to connect:</span>
                  <button
                    onClick={() => setIsConnectingOpen(false)}
                    className="text-[#A39F97] hover:text-[#252525]"
                  >
                    <X size={13} />
                  </button>
                </div>
                {candidatesToConnect.length === 0 ? (
                  <p className="text-xs text-[#A39F97] py-2 italic font-serif">
                    No other thoughts available to connect.
                  </p>
                ) : (
                  <div className="max-h-48 overflow-y-auto divide-y divide-[#E8E5DF]/50">
                    {candidatesToConnect.map((candidate) => (
                      <button
                        key={candidate.id}
                        onClick={() => handleAddRelatedId(candidate.id)}
                        className="w-full text-left py-2 px-2 hover:bg-[#F3F1ED] rounded transition-colors text-xs text-[#252525] flex items-center justify-between group"
                      >
                        <span className="font-editorial text-sm truncate mr-2">
                          {candidate.title}
                        </span>
                        <span className="text-[10px] text-[#A39F97] group-hover:text-[#252525] shrink-0">
                          + Connect
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Branch new thought form */}
            {isBranchingOpen && (
              <form
                onSubmit={handleCreateBranch}
                className="p-4 mb-4 bg-white border border-[#E8E5DF] rounded-xl shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between text-xs text-[#6B6A67]">
                  <span>Branch a related thought:</span>
                  <button
                    type="button"
                    onClick={() => setIsBranchingOpen(false)}
                    className="text-[#A39F97] hover:text-[#252525]"
                  >
                    <X size={13} />
                  </button>
                </div>
                <input
                  type="text"
                  autoFocus
                  placeholder="What is the connected thought?"
                  value={newBranchContent}
                  onChange={(e) => setNewBranchContent(e.target.value)}
                  className="w-full text-sm font-serif p-2 bg-[#FAF9F6] border border-[#E8E5DF] rounded focus:outline-none focus:border-[#252525]"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBranchingOpen(false)}
                    className="px-3 py-1 text-xs text-[#6B6A67] hover:text-[#252525]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newBranchContent.trim()}
                    className="px-3 py-1 bg-[#252525] text-white text-xs rounded hover:bg-[#3D3C3A] disabled:opacity-30"
                  >
                    Create & Link
                  </button>
                </div>
              </form>
            )}

            {/* Render connected thoughts */}
            {relatedThoughts.length === 0 ? (
              <p className="text-xs text-[#A39F97] font-serif italic py-2">
                No related thoughts yet. Connections tend to appear as you keep thinking.
              </p>
            ) : (
              <div className="space-y-2 pt-1">
                {relatedThoughts.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectRelatedThought(rel)}
                    className="flex items-center justify-between p-3 bg-white border border-[#E8E5DF] hover:border-[#6B6A67] rounded-lg transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 truncate mr-3">
                      <BranchMark size={13} className="text-[#A39F97]" />
                      <span className="text-sm font-editorial text-[#252525] truncate">
                        {rel.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-[#A39F97]">
                        {rel.topic || rel.status}
                      </span>
                      <button
                        onClick={(e) => handleRemoveRelatedId(rel.id, e)}
                        title="Unlink thought"
                        className="p-1 text-[#A39F97] hover:text-[#9A3412] transition-colors rounded"
                      >
                        <X size={12} />
                      </button>
                      <ExternalLink size={12} className="text-[#A39F97] group-hover:text-[#252525]" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* LAYER 09: RESOLUTION / CONCLUSION */}
          <div className="pt-8 border-t border-[#E8E5DF] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#A39F97] font-mono">09</span>
                <ResolveMark
                  size={16}
                  resolved={current.status === 'resolved'}
                  className="text-[#3E5C50]"
                />
                <h3 className="text-xs uppercase tracking-widest text-[#6B6A67] font-sans">
                  Resolution / Conclusion
                </h3>
              </div>

              <button
                onClick={handleToggleResolve}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                  current.status === 'resolved'
                    ? 'bg-[#EEF3F0] border-[#8EAA9D] text-[#3E5C50]'
                    : 'bg-white border-[#E8E5DF] text-[#6B6A67] hover:border-[#6B6A67]'
                }`}
              >
                <ResolveMark size={13} resolved={current.status === 'resolved'} />
                <span>
                  {current.status === 'resolved' ? 'Resolved' : 'Resolve thought'}
                </span>
              </button>
            </div>

            <p className="text-xs text-[#6B6A67] font-serif italic">
              “I'm comfortable leaving this thought here for now.”
            </p>

            <AutoTextarea
              value={current.resolution || ''}
              onChange={(val) => handleFieldChange('resolution', val || undefined)}
              placeholder="+ What I've decided or realized (optional)..."
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component for Layer Containers
function LayerSection({
  stepNumber,
  title,
  motif,
  guide,
  children,
}: {
  stepNumber: string;
  title: string;
  motif: React.ReactNode;
  guide: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#A39F97] font-mono">{stepNumber}</span>
          {motif}
          <h3 className="text-xs uppercase tracking-widest text-[#6B6A67] font-sans">
            {title}
          </h3>
        </div>
      </div>

      <div className="relative bg-white border border-[#E8E5DF] hover:border-[#D4D0C7] focus-within:border-[#252525] rounded-xl p-4 sm:p-5 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
        {children}
      </div>

      <p className="text-[11px] text-[#A39F97] font-serif italic px-1">
        {guide}
      </p>
    </section>
  );
}

// Auto-resizing textarea for calm editing
function AutoTextarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = `${Math.max(ref.current.scrollHeight, 48)}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={1}
      className="w-full bg-transparent text-sm sm:text-base text-[#252525] placeholder:text-[#A39F97] placeholder:font-serif placeholder:italic focus:outline-none font-serif leading-relaxed"
    />
  );
}
