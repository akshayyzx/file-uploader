import {
  UploadPartCommand,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from
"@aws-sdk/s3-request-presigner";

import { s3Client }
from "../config/s3";

export const generatePresignedUrl =
  async ({
    key,
    uploadId,
    partNumber,
  }: {
    key: string;
    uploadId: string;
    partNumber: number;
  }) => {

    const command =
      new UploadPartCommand({
        Bucket:
          process.env
            .AWS_BUCKET_NAME,

        Key: key,

        UploadId: uploadId,

        PartNumber: partNumber,
      });

    return getSignedUrl(
      s3Client,
      command,
      {
        expiresIn: 3600,
      }
    );
  };