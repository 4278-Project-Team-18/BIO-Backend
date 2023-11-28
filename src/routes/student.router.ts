import {
  createStudent,
  getStudents,
  updateStudent,
  uploadVolunteerLetter,
  uploadStudentLetter,
  uploadErrorHandling,
  addBookLink,
} from '../controllers/student.controller';
import multer from 'multer';
import express from 'express';

//setting up configs for file upload endpoint
const studentRouter = express.Router();
const storage = multer.memoryStorage();
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype == 'application/pdf') {
    cb(null, true);
  } else {
    return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE'), false);
  }
};
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1000000000, files: 1 },
});

/* Student Controller */
studentRouter.post('/', createStudent);
studentRouter.get('/', getStudents);
studentRouter.patch('/:studentId', updateStudent);
studentRouter.patch('/:studentId/addBookLink', addBookLink);
studentRouter.post(
  '/:studentId/uploadVolunteerLetter',
  upload.single('file'),
  uploadVolunteerLetter
);
studentRouter.post(
  '/:studentId/uploadStudentLetter',
  upload.single('file'),
  uploadStudentLetter
);
studentRouter.use(uploadErrorHandling);

export = studentRouter;
