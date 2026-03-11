import React from 'react';
import Editor from 'react-simple-code-editor';
// Import Prism and the SQL language definition
import Prism from 'prismjs';
import 'prismjs/components/prism-sql';

// Custom lightweight theme for Prism SQL tailored to our app
const highlightWithPrism = (code) => {
    return Prism.highlight(code, Prism.languages.sql, 'sql')
        .replace(/\b(SELECT|FROM|WHERE|JOIN|ON|INSERT|INTO|VALUES|UPDATE|SET|DELETE|ORDER BY|GROUP BY|ASC|DESC|MAX|COUNT|AS|AND|OR)\b/gi, '<span class="sql-keyword">$1</span>')
        .replace(/('.*?')/g, '<span class="sql-string">$1</span>')
        .replace(/\b(\d+)\b/g, '<span class="sql-number">$1</span>');
};

const SqlEditor = ({ value, onChange, onExecute }) => {
    return (
        <div style={{
            backgroundColor: '#263238',
            borderRadius: 'var(--radius-md)',
            padding: '10px',
            border: '2px solid #546e7a',
            position: 'relative',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
        }}>
            <Editor
                value={value}
                onValueChange={onChange}
                highlight={code => highlightWithPrism(code)}
                padding={15}
                style={{
                    fontFamily: '"Fira Code", "Courier New", Courier, monospace',
                    fontSize: '1.2rem',
                    color: '#eceff1',
                    minHeight: '120px',
                    outline: 'none',
                }}
            />
            <button
                onClick={onExecute}
                className="btn-primary pop-in"
                style={{
                    position: 'absolute',
                    bottom: '15px',
                    right: '15px',
                    padding: '8px 16px',
                }}
            >
                Executar 🚀
            </button>

            <style>{`
        .sql-keyword { color: #ffeb3b; font-weight: bold; }
        .sql-string { color: #8bc34a; }
        .sql-number { color: #29b6f6; }
      `}</style>
        </div>
    );
};

export default SqlEditor;
