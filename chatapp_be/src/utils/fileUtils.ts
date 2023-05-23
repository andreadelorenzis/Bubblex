import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

const fs = require('fs');

// Set up multer storage configuration
const storage = multer.diskStorage({
    destination: function (req: any, file: any, cb: any) {
        const uploadPath = 'uploads/';

        // Create the 'uploads' folder if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }

        cb(null, uploadPath);
    },
    filename: function (req: Request, file: any, cb: any) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileExtension = path.extname(file.originalname);
        cb(null, uniqueSuffix + fileExtension);
    }
});

// Create multer instance with storage configuration
const upload = multer({ storage });

// Middleware for handling file uploads
export const uploadFile = upload.single('file');

// Function to extract the file URL based on the uploaded file
export const extractFileUrl = (req: Request) => {
    if (req.file) {
        const fileUrl = `http://localhost:3000/uploads/${req.file.filename}`;
        return fileUrl;
    }
    return null;
};
