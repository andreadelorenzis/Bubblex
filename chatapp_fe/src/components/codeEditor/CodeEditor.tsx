import React, { useState } from 'react'
import "./codeEditor.css"
import AceEditor from 'react-ace';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCode } from '@fortawesome/free-solid-svg-icons'

// Import the necessary language modes and themes
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-mysql";
import "ace-builds/src-noconflict/mode-markdown";
import "ace-builds/src-noconflict/theme-monokai";
import Modal from '../modal/Modal';

export default function CodeEditor({ onSubmit, onClose }: any) {
    const [code, setCode] = useState<any>('');
    const [language, setLanguage] = useState<any>('java');

    const handleCodeChange = (newCode: any) => {
        setCode(newCode);
    };

    const handleLanguageChange = (newLanguage: any) => {
        setLanguage(newLanguage);
    };

    const handleSubmit = () => {
        onSubmit('code', { code, language });
    }

    return (
        <>
            <Modal
                header={(<span className='code-modal__header'>
                    <FontAwesomeIcon icon={faCode} style={{ fontSize: '40px' }} />
                    <h2>Code</h2>
                </span>)}
                content={(
                    <div className='code-editor'>
                        <select
                            className="code-editor__select"
                            value={language}
                            onChange={(e) => handleLanguageChange(e.target.value)}>
                            <option value="java">Java</option>
                            <option value="python">Python</option>
                            <option value="mysql">MySQL</option>
                            <option value="markdown">Markdown</option>
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
                    </div>
                )}
                footer={(
                    <button onClick={handleSubmit} className='code-editor__submit-btn'>Send code snippet</button>
                )}
                onClose={onClose}
            />
        </>
    );
}
