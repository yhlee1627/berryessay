import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import Editor from '@toast-ui/editor';
import '@toast-ui/editor/dist/toastui-editor.css';

interface TuiEditorProps {
  value?: string;
  height?: string;
  previewStyle?: 'tab' | 'vertical';
  onChange?: (value: string) => void;
  addImageBlobHook?: (blob: Blob, callback: (url: string, alt: string, attr?: Record<string, unknown>) => void) => void;
}

const TuiEditor = forwardRef<Editor | null, TuiEditorProps>(
  ({ value = '', height = '500px', previewStyle = 'vertical', onChange, addImageBlobHook }, ref) => {
    const editorRef = useRef<Editor | null>(null);
    const divRef = useRef<HTMLDivElement>(null);
    const isFirst = useRef(true);

    useImperativeHandle(ref, () => editorRef.current);

    useEffect(() => {
      if (divRef.current && !editorRef.current) {
        editorRef.current = new Editor({
          el: divRef.current,
          height,
          initialEditType: 'wysiwyg',
          previewStyle,
          initialValue: value,
          hideModeSwitch: true,
          events: {
            change: () => {
              if (onChange && editorRef.current && typeof editorRef.current.getHTML === 'function') {
                onChange(editorRef.current.getHTML());
              }
            },
          },
          hooks: addImageBlobHook
            ? {
                addImageBlobHook: addImageBlobHook,
              }
            : undefined,
        });
      }
      return () => {
        if (editorRef.current && typeof editorRef.current.destroy === 'function') {
          editorRef.current.destroy();
          editorRef.current = null;
        }
      };
    }, [addImageBlobHook, height, onChange, previewStyle, value]);

    useEffect(() => {
      if (
        editorRef.current &&
        typeof editorRef.current.getHTML === 'function' &&
        typeof editorRef.current.setHTML === 'function'
      ) {
        if (isFirst.current) {
          isFirst.current = false;
        } else if (value !== editorRef.current.getHTML()) {
          editorRef.current.setHTML(value || '');
        }
      }
    }, [value]);

    useEffect(() => {
      if (editorRef.current) {
        editorRef.current.setHeight(height);
        editorRef.current.changePreviewStyle(previewStyle);
      }
    }, [height, previewStyle]);

    return <div ref={divRef} />;
  }
);
TuiEditor.displayName = 'TuiEditor';

export default TuiEditor; 