import React, { useEffect } from 'react'
import AceEditor from 'react-ace';
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-mysql";
import "ace-builds/src-noconflict/mode-markdown";
import "ace-builds/src-noconflict/theme-monokai";
import Message from '../message/Message';
import "./codeMessage.css"

export default function CodeMessage({
    message,
    userColor,
    code,
    language
}: any) {
    const sender = message.sender;
    const content = message.content;

    useEffect(() => {
        // Add custom styles to adjust line height
        const editorElement: any = document.querySelector('.ace_editor');
        if (editorElement) {
            editorElement.style.lineHeight = '1.5';
        }
    }, []);

    return (
        <div className='code-message'>
            <Message message={message} userColor={userColor} />
            <div className="code-message__container">
                <AceEditor
                    mode={language}
                    theme="monokai"
                    value={code}
                    readOnly
                    wrapEnabled
                    fontSize={14}
                    showPrintMargin={false}
                    width='100%'
                    showGutter={true}
                    maxLines={Infinity}
                />
            </div>
        </div>
    )
}
