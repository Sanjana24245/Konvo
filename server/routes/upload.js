   // routes/upload.js
   import express from 'express';
   import multer from 'multer';
   import path from 'path';

   const router = express.Router();

   const storage = multer.diskStorage({
     destination: function (req, file, cb) {
       cb(null, 'uploads/');
     },
     filename: function (req, file, cb) {
       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
       const ext = path.extname(file.originalname);
       cb(null, file.fieldname + '-' + uniqueSuffix + ext);
     }
   });

   const upload = multer({ storage });

   router.post('/upload', upload.single('file'), (req, res) => {
     if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

     const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
     res.json({ url: fileUrl, name: req.file.originalname, type: req.file.mimetype });
   });

   export default router;
   