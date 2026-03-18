// server/src/routes/edit-profile.routes.ts
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs'; // <-- Added File System module
import { verifyToken } from '../middleware/verifyToken';
import { getMyProfile, updateProfileInfo, changePassword } from '../controllers/edit-profile.controller';

const router = Router();

// 1. Force the 'uploads' directory to exist in the root of the /server folder
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Configure Multer with the absolute path and safe filenames
const storage = multer.diskStorage({
  destination: function (req, file, cb) { 
    cb(null, uploadDir) // Using the absolute path we just guaranteed
  },
  filename: function (req, file, cb) { 
    // Clean spaces out of the filename so URLs don't break
    const safeName = file.originalname.replace(/\s+/g, '-');
    cb(null, Date.now() + '-' + safeName);
  }
});

const upload = multer({ storage });

// All routes here require the user to be logged in
router.get('/', verifyToken, getMyProfile);
router.put('/info', verifyToken, upload.single('avatarFile'), updateProfileInfo);
router.patch('/password', verifyToken, changePassword);

export default router;