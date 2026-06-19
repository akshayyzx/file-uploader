import { Request, Response } from "express";
import { randomUUID } from "crypto";
import {
  completeMultipartUpload,
  createMultipartUpload,
  uploadMultipartPart,
} from "../services/multipart.service";
import { Upload } from "../models/Upload";
import {
  generatePresignedUrl,
}
from "../services/presigned-url.service";

export const initializeUpload = async (
  req: Request,
  res: Response
) => {
  try {
    const { fileName, fileSize, totalChunks } = req.body;

    if (!fileName || !fileSize || !totalChunks) {
      return res.status(400).json({
        success: false,
        message: "Missing fields",
      });
    }

    const uploadId = randomUUID();

    const s3Response = await createMultipartUpload(fileName);

    const upload = await Upload.create({
      uploadId,
      fileName,
      fileSize,
      totalChunks,
      s3UploadId: s3Response.UploadId,
      uploadedParts: [],
    });

    return res.status(201).json({
      success: true,
      uploadId,
      s3UploadId: s3Response.UploadId,
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

      if (
        !uploadId ||
        !partNumber
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Missing uploadId or partNumber",
        });
      }

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

      const normalizedPartNumber =
        Number(partNumber);

      if (
        !Number.isInteger(
          normalizedPartNumber
        ) ||
        normalizedPartNumber < 1 ||
        normalizedPartNumber >
          upload.totalChunks
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid partNumber",
        });
      }

      const url =
        await generatePresignedUrl({
          key: upload.fileName,

          uploadId:
            upload.s3UploadId,

          partNumber:
            normalizedPartNumber,
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

export const uploadChunk =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { uploadId } =
        req.params;
      const partNumber =
        req.body.partNumber ||
        req.query.partNumber;

      if (
        !uploadId ||
        !partNumber ||
        !req.file
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Missing uploadId, partNumber, or chunk",
        });
      }

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

      const normalizedPartNumber =
        Number(partNumber);

      if (
        !Number.isInteger(
          normalizedPartNumber
        ) ||
        normalizedPartNumber < 1 ||
        normalizedPartNumber >
          upload.totalChunks
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid partNumber",
        });
      }

      const response =
        await uploadMultipartPart({
          fileName: upload.fileName,
          uploadId:
            upload.s3UploadId,
          partNumber:
            normalizedPartNumber,
          body: req.file.buffer,
        });

      const etag =
        response.ETag;

      if (!etag) {
        return res.status(500).json({
          success: false,
          message:
            "S3 did not return an ETag",
        });
      }

      await Upload.updateOne(
        { uploadId },
        {
          $pull: {
            uploadedParts: {
              partNumber:
                normalizedPartNumber,
            },
          },
        }
      );

      await Upload.updateOne(
        { uploadId },
        {
          $push: {
            uploadedParts: {
              partNumber:
                normalizedPartNumber,
              etag,
            },
          },
        }
      );

      return res.json({
        success: true,
        partNumber:
          normalizedPartNumber,
        etag,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Failed to upload chunk",
      });
    }
  };

export const completeUpload =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { uploadId } =
        req.body;

      if (
        !uploadId
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Missing uploadId",
        });
      }

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

      const normalizedParts =
        upload.uploadedParts.map(
          (part) => ({
            partNumber:
              Number(part.partNumber),
            etag: String(part.etag),
          })
        );

      const hasInvalidPart =
        normalizedParts.some(
          (part) =>
            !Number.isInteger(
              part.partNumber
            ) ||
            part.partNumber < 1 ||
            !part.etag
        );

      if (
        hasInvalidPart ||
        normalizedParts.length !==
          upload.totalChunks
      ) {
        return res.status(400).json({
          success: false,
          message:
            "All chunks must be uploaded before completion",
        });
      }

      await completeMultipartUpload({
        fileName: upload.fileName,
        uploadId:
          upload.s3UploadId,
        parts: normalizedParts,
      });

      upload.set(
        "uploadedParts",
        normalizedParts
      );
      upload.status = "completed";

      await upload.save();

      return res.json({
        success: true,
        message:
          "Upload completed",
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Failed to complete upload",
      });
    }
  };
