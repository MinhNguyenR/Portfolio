import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function normalizeDenseMarkdown(raw) {
  let text = String(raw || '')
    .replace(/\r\n/g, '\n')
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .trim();

  text = text.replace(/\s*▸\s*/g, '\n\n- ');
  text = text.replace(/([^\n])\s([✨🔥🚀📌📍✅⚡🧠📊📚🛠️🔬🎯])/g, '$1\n\n$2');
  text = text.replace(/([^\n])\s(•\s+\*\*)/g, '$1\n$2');
  text = text.replace(/\.\s+([•\-]\s+)/g, '.\n$1');

  const looksDense = text.length > 280 && !/\n\n/.test(text);
  if (looksDense) {
    text = text
      .replace(/([.!?])\s+(?=[A-ZÀ-Ỹ0-9])/g, '$1\n\n')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  return text;
}

function MarkdownRenderer({ content }) {
  if (!content) return <p style={{ color: 'var(--ocean-light)' }}>No content available.</p>;
  const normalized = normalizeDenseMarkdown(content);

  return (
    <div className="markdown-content markdown-github-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
          pre: ({ ...props }) => <pre className="markdown-pre" {...props} />,
          code: ({ ...props }) => <code className="markdown-code" {...props} />,
          table: ({ ...props }) => <div className="markdown-table-wrap"><table {...props} /></div>,
          input: ({ ...props }) => <input {...props} disabled />,
        }}
      >
        {normalized}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownRenderer;
