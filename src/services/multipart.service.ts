import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
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

export const uploadMultipartPart =
  async ({
    fileName,
    uploadId,
    partNumber,
    body,
  }: {
    fileName: string;
    uploadId: string;
    partNumber: number;
    body: Buffer;
  }) => {
    const command =
      new UploadPartCommand({
        Bucket:
          process.env
            .AWS_BUCKET_NAME,

        Key: fileName,

        UploadId: uploadId,

        PartNumber: partNumber,

        Body: body,
      });

    return s3Client.send(
      command
    );
  };

export const completeMultipartUpload =
  async ({
    fileName,
    uploadId,
    parts,
  }: {
    fileName: string;
    uploadId: string;
    parts: Array<{
      partNumber: number;
      etag: string;
    }>;
  }) => {
    const command =
      new CompleteMultipartUploadCommand({
        Bucket:
          process.env
            .AWS_BUCKET_NAME,

        Key: fileName,

        UploadId: uploadId,

        MultipartUpload: {
          Parts: parts
            .sort(
              (first, second) =>
                first.partNumber -
                second.partNumber
            )
            .map((part) => ({
              PartNumber:
                part.partNumber,
              ETag: part.etag,
            })),
        },
      });

    return s3Client.send(
      command
    );
  };
