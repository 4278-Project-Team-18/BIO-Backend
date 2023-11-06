import AWS from 'aws-sdk';

export const uploadToS3 = async (
  file: any,
  isStudent: boolean,
  mongoObj: any
) => {
  //initialize s3 object
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.REGION,
  });

  //set naming convention depending on student vs. volunteer letter
  const folder = isStudent ? 'student-letters' : 'volunteer-letters';
  const tag = isStudent ? 'student' : 'volunteer';

  //defining parameters for s3 upload
  const param = {
    Bucket: process.env.S3_BUCKET ? process.env.S3_BUCKET : '',
    Key: `${folder}/${mongoObj.firstName}-${mongoObj.lastInitial}-${tag}-letter-${mongoObj._id}-${file.originalname}`,
    Body: file.buffer,
  };

  //upload to s3
  return await s3.upload(param).promise();
};
