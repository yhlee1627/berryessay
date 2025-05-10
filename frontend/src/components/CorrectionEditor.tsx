"use client";

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

interface CorrectionEditorProps {
  content: string;
  onSave?: (newContent: string) => void;
  cardless?: boolean;
}

const CorrectionEditor = forwardRef(function CorrectionEditor({ content, onSave: _onSave, cardless }: CorrectionEditorProps, ref) {
  const [editorContent, setEditorContent] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    getText: () => editorContent
  }), [editorContent]);

  // 오토리사이즈 효과
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [editorContent]);

  return (
    cardless ? (
      <textarea
        ref={textareaRef}
        value={editorContent}
        onChange={(e) => setEditorContent(e.target.value)}
        className="w-full min-h-[400px] max-h-[2000px] p-6 text-xl leading-relaxed bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-2xl resize-vertical placeholder-gray-400 transition"
        placeholder="여기에 에세이를 작성하세요..."
        rows={1}
        style={{overflow: 'auto'}}
      />
    ) : (
      <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-6 relative">
        <textarea
          ref={textareaRef}
          value={editorContent}
          onChange={(e) => setEditorContent(e.target.value)}
          className="w-full min-h-[400px] max-h-[2000px] p-6 text-xl leading-relaxed bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-2xl resize-vertical placeholder-gray-400 transition"
          placeholder="여기에 에세이를 작성하세요..."
          rows={1}
          style={{overflow: 'auto'}}
        />
      </div>
    )
  );
});

export default CorrectionEditor; 