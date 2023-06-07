
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileImage, faFileVideo, faFileAudio, faFilePdf, faFileWord, faFileExcel, faFilePowerpoint, faFileAlt, faFileArchive, faFileCode } from '@fortawesome/free-solid-svg-icons';
import React from 'react';

/**
 * Returns a shortened name based on the type of the file
 * 
 * @param fileType 
 * @returns name
 */
export const getTypeName = (fileType: any): string => {
    let name = '';

    switch (fileType) {
        case 'image/jpeg':
            name = 'JPEG';
            break;
        case 'image/png':
            name = 'PNG';
            break;
        case 'image/gif':
            name = 'GIF';
            break;
        case 'image/svg+xml':
            name = 'SVG';
            break;
        case 'image/webp':
            name = 'WebP';
            break;
        case 'image/bmp':
            name = 'BMP';
            break;
        case 'video/mp4':
            name = 'MP4';
            break;
        case 'video/webm':
            name = 'WebM';
            break;
        case 'video/quicktime':
            name = 'MOV';
            break;
        case 'video/x-msvideo':
            name = 'AVI';
            break;
        case 'video/x-matroska':
            name = 'MKV';
            break;
        case 'audio/mpeg':
            name = 'MP3';
            break;
        case 'audio/wav':
            name = 'WAV';
            break;
        case 'audio/flac':
            name = 'FLAC';
            break;
        case 'audio/ogg':
            name = 'OGG';
            break;
        case 'audio/aac':
            name = 'AAC';
            break;
        case 'application/pdf':
            name = 'PDF';
            break;
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            name = 'DOC';
            break;
        case 'application/vnd.ms-excel':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            name = 'XLS';
            break;
        case 'application/vnd.ms-powerpoint':
        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
            name = 'PPT';
            break;
        case 'text/plain':
            name = 'TXT';
            break;
        case 'application/zip':
            name = 'ZIP';
            break;
        case 'application/x-rar-compressed':
            name = 'RAR';
            break;
        case 'application/x-7z-compressed':
            name = '7Z';
            break;
        case 'application/x-tar':
            name = 'TAR';
            break;
        case 'application/gzip':
            name = 'GZIP';
            break;
        case 'text/html':
            name = 'HTML';
            break;
        case 'text/css':
            name = 'CSS';
            break;
        case 'text/javascript':
            name = 'JS';
            break;
        case 'application/json':
            name = 'JSON';
            break;
        case 'application/xml':
            name = 'XML';
            break;
        default:
            name = 'Unknown';
            break;
    }

    return name;
};

/**
 * Returns a specific icon based on the type of the file
 * 
 * @param fileType 
 * @param size 
 * @param color 
 * @returns FontAwesomeIcon
 */
export const getIconByType = (fileType: any, size: any = '1x', color: any = '#333') => {
    const iconStyle = { fontSize: size, color };

    switch (fileType) {
        case 'image/jpeg':
        case 'image/png':
        case 'image/gif':
        case 'image/svg+xml':
        case 'image/webp':
        case 'image/bmp':
            return <FontAwesomeIcon icon={faFileImage} style={iconStyle} />;
        case 'video/mp4':
        case 'video/webm':
        case 'video/quicktime':
        case 'video/x-msvideo':
        case 'video/x-matroska':
            return <FontAwesomeIcon icon={faFileVideo} style={iconStyle} />;
        case 'audio/mpeg':
        case 'audio/wav':
        case 'audio/flac':
        case 'audio/ogg':
        case 'audio/aac':
            return <FontAwesomeIcon icon={faFileAudio} style={iconStyle} />;
        case 'application/pdf':
            return <FontAwesomeIcon icon={faFilePdf} style={iconStyle} />;
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            return <FontAwesomeIcon icon={faFileWord} style={iconStyle} />;
        case 'application/vnd.ms-excel':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            return <FontAwesomeIcon icon={faFileExcel} style={iconStyle} />;
        case 'application/vnd.ms-powerpoint':
        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
            return <FontAwesomeIcon icon={faFilePowerpoint} style={iconStyle} />;
        case 'text/plain':
            return <FontAwesomeIcon icon={faFileAlt} style={iconStyle} />;
        case 'application/zip':
        case 'application/x-rar-compressed':
        case 'application/x-7z-compressed':
        case 'application/x-tar':
        case 'application/gzip':
            return <FontAwesomeIcon icon={faFileArchive} style={iconStyle} />;
        case 'text/html':
        case 'text/css':
        case 'text/javascript':
        case 'application/json':
        case 'application/xml':
            return <FontAwesomeIcon icon={faFileCode} style={iconStyle} />;
        default:
            return <FontAwesomeIcon icon={faFileAlt} style={iconStyle} />;
    }
};

/**
 * Return a string representing the size of the file formatted (es. 5KB)
 * 
 * @param bytes 
 * @returns file size formatted
 */
export const formatFileSize = (bytes: any) => {
    if (bytes === 0) return '0 B';

    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}