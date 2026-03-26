"use client";

import Editor from "@monaco-editor/react";

interface CodeEditorProps {
    language?: string;
    value: string;
    onChange: (value: string) => void;
    readOnly?: boolean;
}

export default function CodeEditor({
    language = "python",
    value,
    onChange,
    readOnly = false,
}: CodeEditorProps) {
    return (
        <Editor
            height="100%"
            language={language}
            value={value}
            onChange={(v) => onChange(v || "")}
            theme="vs-dark"
            options={{
                fontSize: 14,
                fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                minimap: { enabled: false },
                padding: { top: 16, bottom: 16 },
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                wordWrap: "on",
                readOnly,
                renderLineHighlight: "gutter",
                glyphMargin: false,
                folding: true,
                bracketPairColorization: { enabled: true },
            }}
        />
    );
}
