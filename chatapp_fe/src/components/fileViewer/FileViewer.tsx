import React, { useState, useEffect } from 'react'
import './fileViewer.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileText, faClose } from '@fortawesome/free-solid-svg-icons'
import { getTypeName, formatFileSize, getIconByType } from '../../utils/fileUtils'

export default function FileViewer({ file, onClose }: any) {
    const [fileProperties, setFileProperties] = useState<any>({
        name: '',
        size: '',
        type: '',
        icon: null
    });
    const [isVisible, setIsVisible] = useState<boolean>(false);

    useEffect(() => {
        // Access file properties
        const fileName = file.name;
        const fileSize = formatFileSize(file.size);
        const fileType = getTypeName(file.type);
        const iconType = getIconByType(fileType, '50px', '#d6d9dc');
        setFileProperties({
            name: fileName,
            size: fileSize,
            type: fileType,
            icon: iconType
        });
        setIsVisible(true);
    }, []);

    const handleCloseViewer = () => {
        onClose();
    }

    return (
        <div className={`file-viewer ${isVisible ? 'file-viewer--show' : 'file-viewer--hide'}`}>
            <button className='file-viewer__close' onClick={handleCloseViewer}><FontAwesomeIcon icon={faClose} style={{ color: '#ffffff', fontSize: '20px' }} /></button>
            <p className='file-viewer__name'>{fileProperties.name}</p>
            {fileProperties.icon}
            <p className='file-viewer__type-size'>{fileProperties.type} - {fileProperties.size}</p>
        </div>
    )
}
