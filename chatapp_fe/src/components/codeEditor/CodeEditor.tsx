import React, { useState } from 'react'
import "./codeEditor.css"
import AceEditor from 'react-ace';

// Import the necessary language modes and themes
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-mysql";
import "ace-builds/src-noconflict/mode-markdown";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";

export default function CodeEditor({ onSubmit }: any) {
    const [code, setCode] = useState<any>('');
    const [language, setLanguage] = useState<any>('javascript');

    const handleCodeChange = (newCode: any) => {
        setCode(newCode);
    };

    const handleLanguageChange = (newLanguage: any) => {
        setLanguage(newLanguage);
    };

    const handleSubmit = () => {
        onSubmit({ code, language });
    }

    return (
        <div className='code-editor'>
            <select
                className="code-editor__select"
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}>
                <option value="javascript">JavaScript</option>
                <option value="java">Java</option>
                <option value="python">Python</option>
                <option value="html">HTML</option>
                <option value="mysql">MySQL</option>
                <option value="markdown">Markdown</option>
                <option value="css">CSS</option>
            </select>

            <div className="code-editor__container">
                <AceEditor
                    mode={language}
                    theme="monokai"
                    value={code}
                    onChange={handleCodeChange}
                    name="code-editor"
                    editorProps={{ $blockScrolling: true, lineHeight: 2 }}
                    height="300px"
                    width="100%"
                />
            </div>
            <button onClick={handleSubmit} className='code-editor__submit-btn'>Send code snippet</button>
        </div>
    );
}
