import {
  PutObjectCommand,
} from "@aws-sdk/client-s3";

import { s3Client } from "../config/s3";

export const uploadToS3 = async (
  key: string,
  body: Buffer
) => {
  try {
    console.log("Uploading to S3:", {
      bucket: process.env.AWS_BUCKET_NAME,
      key,
      size: body.length,
    });

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: body,
    });

    const response = await s3Client.send(command);
    console.log("Upload successful:", response);
    return response;
  } catch (error: any) {
    console.error("S3 Upload Error:", {
      message: error?.message,
      code: error?.Code || error?.code,
      statusCode: error?.$metadata?.httpStatusCode,
      requestId: error?.$metadata?.requestId,
      fullError: error,
    });
    throw error;
  }
};