import { S3 } from 'aws-sdk';

export const uploadToS3 = async (
  file: any,
  isStudent: boolean,
  mongoObj: any
) => {
  const s3 = new S3();
  const folder = isStudent ? 'student-letters' : 'volunteer-letters';
  const tag = isStudent ? 'student' : 'volunteer';
  const param = {
    Bucket: process.env.S3_BUCKET ? process.env.S3_BUCKET : '',
    Key: `${folder}/${mongoObj.firstName}-${mongoObj.lastInitial}-${tag}-letter-${mongoObj._id}-${file.originalname}`,
    Body: file.buffer,
  };
  console.log('reached here');
  return await s3.upload(param).promise();
};
