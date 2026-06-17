import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { createMultipartUpload } from "../services/multiPart.service";
import { Upload } from "../models/Upload";
import {
  generatePresignedUrl,
}
from "../services/presigned-url.service";

export const initializeUpload =
  async (
    req: Request,
    res: Response
  ) => {
    try {

      const {
        fileName,
        fileSize,
        totalChunks,
      } = req.body;

      if (
        !fileName ||
        !fileSize ||
        !totalChunks
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Missing fields",
        });
      }

      const uploadId =
        uuidv4();

      const s3Response =
        await createMultipartUpload(
          fileName
        );

      const upload =
        await Upload.create({
          uploadId,

          fileName,

          fileSize,

          totalChunks,

          s3UploadId:
            s3Response.UploadId,

          uploadedParts: [],
        });

      return res.status(201).json({
        success: true,

        uploadId,

        s3UploadId:
          s3Response.UploadId,
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        success: false,
      });

    }
  };

export const getUploadStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const { uploadId } = req.params;

    const upload = await Upload.findOne({
      uploadId,
    });

    if (!upload) {
      return res.status(404).json({
        success: false,
        message: "Upload not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        uploadId: upload.uploadId,
        fileName: upload.fileName,
        totalChunks: upload.totalChunks,
        uploadedParts:
          upload.uploadedParts,
        status: upload.status,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch upload status",
    });
  }
};

export const getPresignedUrl =
  async (
    req: Request,
    res: Response
  ) => {
    try {

      const {
        uploadId,
        partNumber,
      } = req.body;

      const upload =
        await Upload.findOne({
          uploadId,
        });

      if (!upload) {
        return res.status(404).json({
          success: false,
          message:
            "Upload not found",
        });
      }

      const url =
        await generatePresignedUrl({
          key: upload.fileName,

          uploadId:
            upload.s3UploadId,

          partNumber,
        });

      return res.json({
        success: true,
        url,
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        success: false,
      });

    }
  };
