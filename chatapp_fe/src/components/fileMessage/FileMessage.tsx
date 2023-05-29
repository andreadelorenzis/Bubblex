import React from 'react'
import "./fileMessage.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload } from '@fortawesome/free-solid-svg-icons'
import { faCircleDown } from '@fortawesome/free-regular-svg-icons'
import Message from '../message/Message'
import { saveAs } from 'file-saver';

export default function FileMessage({ user, userColor, content, icon, name, type, size, fileUrl }: any) {

    const handleDownload = async () => {
        try {
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            saveAs(blob, name); // Replace with the desired filename and extension
        } catch (error) {
            console.error('Error downloading the file:', error);
        }
    };
    return (
        <div className='file-message'>
            <Message user={user} userColor={userColor} content={content} />
            <div className="file-message__container">
                <div className="file-message__icon">
                    {icon}
                </div>
                <div className="file-message__text__container">
                    <p className="file-message__name">{name}</p>
                    <p className="file-message__type-size">{type} - {size}</p>
                </div>
                <button className="file-message__upload" onClick={handleDownload}>
                    <FontAwesomeIcon className='icon' icon={faCircleDown} style={{ fontSize: '30px' }} />
                </button>
            </div>
        </div>
    )
}
