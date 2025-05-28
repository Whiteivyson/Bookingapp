// lambda-image-resizer/index.js
const AWS = require('aws-sdk');
const Sharp = require('sharp');

const s3 = new AWS.S3();

const DEST_BUCKET = process.env.DEST_BUCKET;

exports.handler = async (event) => {
  const record = event.Records[0];
  const srcBucket = record.s3.bucket.name;
  const srcKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
  const destKey = `resized-${srcKey}`;

  try {
    // Get the image from S3
    const originalImage = await s3.getObject({ Bucket: srcBucket, Key: srcKey }).promise();

    // Resize the image
    const resizedImage = await Sharp(originalImage.Body)
      .resize(800, 600)
      .toBuffer();

    // Upload the resized image to the destination bucket
    await s3.putObject({
      Bucket: DEST_BUCKET,
      Key: destKey,
      Body: resizedImage,
      ContentType: 'image/jpeg'
    }).promise();

    return {
      statusCode: 200,
      body: `Successfully resized ${srcKey} and uploaded to ${DEST_BUCKET}/${destKey}`
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to resize and upload image.', error })
    };
  }
};
