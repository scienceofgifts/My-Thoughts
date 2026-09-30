import React from 'react';
import { X } from 'lucide-react';
import { BrandMark } from './EditorialMotifs';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ThinkingPrinciplesModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#252525]/30 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto bg-[#FAF9F6] border border-[#E8E5DF] rounded-xl p-8 sm:p-10 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-1.5 text-[#6B6A67] hover:text-[#252525] hover:bg-[#F3F1ED] rounded-md transition-colors"
          aria-label="Close principles guide"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2.5 mb-6 text-[#6B6A67]">
          <BrandMark size={20} />
          <span className="text-xs uppercase tracking-widest font-sans">Core Philosophy</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-editorial font-medium text-[#252525] mb-4">
          How to use this space
        </h2>

        <p className="text-sm text-[#6B6A67] leading-relaxed mb-8">
          This workspace is designed to make thinking feel lighter. It is deliberately not a task manager or a productivity system.
        </p>

        <div className="space-y-6 text-sm text-[#252525] leading-relaxed">
          <div className="border-l-2 border-[#E8E5DF] pl-4">
            <h3 className="font-editorial text-lg font-medium text-[#252525] mb-1">
              01. A thought does not need to become a task
            </h3>
            <p className="text-xs text-[#6B6A67]">
              Not every internal friction requires an action item. Often, simply naming what is bothering you and understanding where it comes from is the entire resolution.
            </p>
          </div>

          <div className="border-l-2 border-[#E8E5DF] pl-4">
            <h3 className="font-editorial text-lg font-medium text-[#252525] mb-1">
              02. Comfortable with unfinished thinking
            </h3>
            <p className="text-xs text-[#6B6A67]">
              You do not need to fill out every section. A thought can sit as a single raw sentence for weeks. Unpack only when you feel ready to look at it.
            </p>
          </div>

          <div className="border-l-2 border-[#E8E5DF] pl-4">
            <h3 className="font-editorial text-lg font-medium text-[#252525] mb-1">
              03. Separate the real from the catastrophic
            </h3>
            <p className="text-xs text-[#6B6A67]">
              By asking <span className="italic">“What might be true?”</span> alongside <span className="italic">“What might not be true?”</span>, you respect your instincts without getting swept away by worst-case spirals.
            </p>
          </div>

          <div className="border-l-2 border-[#E8E5DF] pl-4">
            <h3 className="font-editorial text-lg font-medium text-[#252525] mb-1">
              04. Focus strictly on your sphere of agency
            </h3>
            <p className="text-xs text-[#6B6A67]">
              Distinguish between the uncontrollable weather of life and the single small step you can take today.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#E8E5DF] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-medium text-[#FAF9F6] bg-[#252525] rounded-lg hover:bg-[#3D3C3A] transition-colors"
          >
            Return to thinking
          </button>
        </div>
      </div>
    </div>
  );
}
