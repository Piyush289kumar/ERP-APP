import multer from "multer";
import path from "path";
import fs from "node:fs";

// Temporary upload directory
const uploadDir = "uploads/temp";

// Ensure folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage (temporary, Cloudinary will store permanently)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File Type Validation (images + videos)
const fileFilter = (req, file, cb) => {
  const allowed = /\.(jpg|jpeg|png|webp|gif|mp4|mov|avi)$/; // ✅ RegExp
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only image/vidoe file are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

export default upload;
