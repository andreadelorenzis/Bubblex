import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { firebaseStorage } from "../config/firebaseConfig";
import { UploadTaskSnapshot } from "firebase/storage";
const {
    ref,
    uploadBytes,
    listAll,
    deleteObject,
    getDownloadURL
} = require("firebase/storage");

const fs = require('fs');

const memoryStorage = multer.memoryStorage();
const upload = multer({ storage: memoryStorage });

// Middleware for handling file uploads
export const uploadFile = upload.single('file');

const imageFilter = (req: Request, file: any, cb: any) => {
    if (!file.originalname.match(/\.(JPG|jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(undefined, true)
};

const documentFilter = (req: Request, file: any, cb: any) => {
    if (!file.originalname.match(/\.(pdf|doc|docx|txt)$/i)) {
        return cb(new Error('Only document files (PDF, DOC, DOCX, TXT) are allowed!'), false);
    }
    cb(null, true);
};

const videoFilter = (req: Request, file: any, cb: any) => {
    if (!file.originalname.match(/\.(mp4|mov|avi|wmv)$/i)) {
        return cb(new Error('Only video files are allowed!'), false);
    }
    cb(null, true);
};

const audioFilter = (req: Request, file: any, cb: any) => {
    if (!file.originalname.match(/\.(mp3|wav|ogg)$/i)) {
        return cb(new Error('Only audio files are allowed!'), false);
    }
    cb(null, true);
};

const fileFilter = (req: Request, file: any, cb: any) => {
    const allowedExtensions = /\.(jpg|jpeg|png|gif|pdf|doc|docx|txt|mp4|mov|avi|wmv)$/i;
    if (!allowedExtensions.test(file.originalname)) {
        return cb(new Error('Only specific file types are allowed!'), false);
    }
    cb(null, true);
};

const generateUniqueFileName = (fileExtension: any) => {
    const uniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    const fileName = uniqueId + fileExtension;
    return fileName;
};

const processImageMiddleware = multer({
    fileFilter: fileFilter,
    storage: multer.memoryStorage(), //storage
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB file size limit
    }
}).single('file');

// Custom middleware for handling file upload errors
export const handleFileUploadError = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof multer.MulterError) {
        // Multer errors (e.g., file size limit exceeded)
        console.error(err);
        return res.status(400).json({ error: err.message });
    } else if (err) {
        // Custom error thrown from fileFilter
        console.error(err);
        return res.status(400).json({ error: err.message });
    }
    next();
};

// Middleware for processing the image after upload
export const processImage = [
    processImageMiddleware,
    handleFileUploadError,
    async (req: any, res: Response, next: NextFunction) => {
        if (req.file) {
            try {
                // Generate a unique filename
                const fileExtension = path.extname(req.file.originalname);
                const uniqueFileName = generateUniqueFileName(fileExtension);

                // Upload the file to Firebase Storage
                const fileRef = ref(firebaseStorage, uniqueFileName);
                const metatype = {
                    contentType: req.file?.mimetype,
                    name: uniqueFileName,
                };
                await uploadBytes(fileRef, req.file?.buffer, metatype);

                // Get the download URL of the uploaded file
                const downloadURL = await getDownloadURL(fileRef);

                // Set the file URL in the document or use it as needed
                const fileURL = downloadURL.toString();

                console.log(fileURL)

                // Perform additional processing with the fileURL if required

                // Pass the fileURL to the next middleware or handle it accordingly
                req.fileUrl = fileURL;
            } catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Failed to upload file' });
            }
        }
        next();
    },
];
