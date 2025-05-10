import { Mark, mergeAttributes } from '@tiptap/core';

export interface CorrectionAttrs {
  id: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    correction: {
      setCorrection: (attrs: CorrectionAttrs, from: number, to: number) => ReturnType;
      unsetCorrection: (from: number, to: number) => ReturnType;
    };
  }
}

const CorrectionMark = Mark.create({
  name: 'correction',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      id: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-correction-id]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-correction-id': HTMLAttributes.id,
        style: 'background: #fff3cd !important; border-bottom: 2px solid #ffc107 !important; cursor: pointer !important;',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setCorrection:
        (attrs, from, to) =>
        ({ chain }) => {
          return chain()
            .setMark(this.name, { ...attrs, from, to })
            .run();
        },
      unsetCorrection:
        (from, to) =>
        ({ chain }) => {
          return chain()
            // @ts-expect-error: TipTap unsetMark는 실제로 { from, to }를 허용함
            .unsetMark(this.name, { from, to })
            .run();
        },
    };
  },
});

export default CorrectionMark; 