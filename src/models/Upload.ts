import mongoose from "mongoose";

const uploadSchema = new mongoose.Schema(
  {
    uploadId: {
      type: String,
      required: true,
      unique: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    fileSize: {
      type: Number,
      required: true,
    },

    totalChunks: {
      type: Number,
      required: true,
    },

    s3UploadId: {
      type: String,
      required: true,
    },

    uploadedParts: [
      {
        partNumber: Number,
        etag: String,
      },
    ],

    status: {
      type: String,
      enum: [
        "uploading",
        "completed",
        "failed",
      ],
      default: "uploading",
    },
  },
  {
    timestamps: true,
  }
);

export const Upload = mongoose.model(
  "Upload",
  uploadSchema
);