import React, { useEffect } from 'react'
import AceEditor from 'react-ace';
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-mysql";
import "ace-builds/src-noconflict/mode-markdown";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/theme-twilight";
import "ace-builds/src-noconflict/ext-language_tools";
import Message from '../message/Message';
import "./codeMessage.css"

export default function CodeMessage({ user, userColor, content, code, language }: any) {
    useEffect(() => {
        // Add custom styles to adjust line height
        const editorElement: any = document.querySelector('.ace_editor');
        if (editorElement) {
            editorElement.style.lineHeight = '1.5';
        }
    }, []);

    return (
        <div className='code-message'>
            <Message user={user} userColor={userColor} content={content} />
            <div className="code-message__container">
                <AceEditor
                    mode={language}
                    theme="twilight"
                    value={code}
                    readOnly
                    wrapEnabled
                    fontSize={14}
                    showPrintMargin={false}
                    width='100%'
                    showGutter={false}
                    maxLines={Infinity}
                />
            </div>
        </div>
    )
}
