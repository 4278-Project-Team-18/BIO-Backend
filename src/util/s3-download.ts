import { S3 } from 'aws-sdk';

export const uploadToS3 = async (isStudent: boolean, mongoObj: any) => {
  //initialize s3 object
  const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.REGION,
  });

  // set naming convention depending on student vs. volunteer letter
  const bucketName = process.env.S3_BUCKET ? process.env.S3_BUCKET : '';
  const folder = isStudent ? 'student-letters' : 'volunteer-letters';
  const tag = isStudent ? 'student' : 'volunteer';
  const key = `${folder}/${mongoObj.firstName}-${mongoObj.lastInitial}-${tag}-letter-${mongoObj._id}`;

  const signedUrl = s3.getSignedUrl('getObject', {
    Bucket: bucketName,
    Key: key,
  });
  return signedUrl;
};
