import React, { useRef, useEffect } from 'react';
import Editor from '@toast-ui/editor';
import '@toast-ui/editor/dist/toastui-editor.css';

interface TuiEditorProps {
  initialValue?: string;
  height?: string;
  previewStyle?: 'tab' | 'vertical';
  onChange?: (value: string) => void;
}

const TuiEditor: React.FC<TuiEditorProps> = ({
  initialValue = '',
  height = '500px',
  previewStyle = 'vertical',
  onChange,
}) => {
  const editorRef = useRef<Editor | null>(null);
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (divRef.current) {
      editorRef.current = new Editor({
        el: divRef.current,
        height,
        initialEditType: 'markdown',
        previewStyle,
        initialValue,
        events: {
          change: () => {
            if (onChange && editorRef.current) {
              onChange(editorRef.current.getMarkdown());
            }
          },
        },
      });
    }
    return () => {
      editorRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setHeight(height);
      editorRef.current.changePreviewStyle(previewStyle);
    }
  }, [height, previewStyle]);

  return <div ref={divRef} />;
};

export default TuiEditor; 