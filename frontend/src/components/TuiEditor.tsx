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

const TuiEditor = forwardRef((props: TuiEditorProps, ref) => {
  const editorRef = useRef<any>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const isFirst = useRef(true);

  useImperativeHandle(ref, () => ({
    getInstance: () => editorRef.current
  }));

  useEffect(() => {
    if (divRef.current && !editorRef.current) {
      editorRef.current = new Editor({
        el: divRef.current,
        height: props.height,
        initialEditType: 'wysiwyg',
        previewStyle: props.previewStyle,
        initialValue: props.value,
        hideModeSwitch: true,
        events: {
          change: () => {
            if (props.onChange && editorRef.current && typeof editorRef.current.getHTML === 'function') {
              props.onChange(editorRef.current.getHTML());
            }
          },
        },
        hooks: props.addImageBlobHook
          ? {
              addImageBlobHook: props.addImageBlobHook,
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
  }, [props.addImageBlobHook, props.height, props.onChange, props.previewStyle, props.value]);

  useEffect(() => {
    if (
      editorRef.current &&
      typeof editorRef.current.getHTML === 'function' &&
      typeof editorRef.current.setHTML === 'function'
    ) {
      if (isFirst.current) {
        isFirst.current = false;
      } else if (props.value !== editorRef.current.getHTML()) {
        editorRef.current.setHTML(props.value || '');
      }
    }
  }, [props.value]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setHeight(props.height);
      editorRef.current.changePreviewStyle(props.previewStyle);
    }
  }, [props.height, props.previewStyle]);

  return <div ref={divRef} />;
});
TuiEditor.displayName = 'TuiEditor';

export default TuiEditor; 