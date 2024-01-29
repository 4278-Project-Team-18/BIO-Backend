import Student from '../models/student.model';
import { S3 } from 'aws-sdk';
import type mongoose from 'mongoose';

export const deleteFromS3 = async (
  isStudent: boolean,
  mongoId: mongoose.Types.ObjectId
) => {
  //initialize s3 object
  const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.REGION,
  });

  // findbyID
  const mongoObj = await Student.findById(mongoId);
  if (!mongoObj) {
    return false;
  }

  // set naming convention depending on student vs. volunteer letter
  const bucketName = process.env.S3_BUCKET ? process.env.S3_BUCKET : '';
  const folder = isStudent ? 'student-letters' : 'volunteer-letters';
  const tag = isStudent ? 'student' : 'volunteer';
  const key = `${folder}/${mongoObj.firstName}-${mongoObj.lastInitial}-${tag}-letter-${mongoObj._id}`;

  const params = {
    Bucket: bucketName,
    Key: key,
  };

  // Call S3 to delete the object.
  s3.deleteObject(params, function (err, data) {
    if (err) console.log(err, err.stack);
    else console.log(data);
  });

  return true;
};
