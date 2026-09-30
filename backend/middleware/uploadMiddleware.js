import multer from 'multer';
import path from 'path';
import fs from 'fs';

const docsDir = path.resolve('uploads/documents');
const photosDir = path.resolve('uploads/photos');

// Ensure upload directories exist
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}
if (!fs.existsSync(photosDir)) {
  fs.mkdirSync(photosDir, { recursive: true });
}

// ----------------------------------------------------
// Document Storage & Validation (Item 13)
// ----------------------------------------------------
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, docsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

const ALLOWED_DOC_MIMES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
];

export const uploadDocumentMiddleware = multer({
  storage: documentStorage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB Enterprise limit
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_DOC_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: PDF, images, Word, Excel, CSV, text.`), false);
    }
  },
});

// ----------------------------------------------------
// Site Photo Storage & Validation (Item 14)
// ----------------------------------------------------
const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, photosDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `photo-${base}-${Date.now()}${ext}`);
  },
});

const ALLOWED_PHOTO_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

export const uploadPhotoMiddleware = multer({
  storage: photoStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_PHOTO_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported image type: ${file.mimetype}. Allowed: JPEG, PNG, WEBP.`), false);
    }
  },
});
