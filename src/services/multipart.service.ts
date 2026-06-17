import {
  CreateMultipartUploadCommand,
} from "@aws-sdk/client-s3";

import { s3Client } from "../config/s3";

export const createMultipartUpload =
  async (fileName: string) => {
    const command =
      new CreateMultipartUploadCommand({
        Bucket:
          process.env
            .AWS_BUCKET_NAME,

        Key: fileName,
      });

    return s3Client.send(
      command
    );
  };