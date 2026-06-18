import multer from "multer";

const storage =
  multer.memoryStorage();

const maxChunkSize =
  Number(
    process.env
      .MAX_UPLOAD_CHUNK_SIZE
  ) || 25 * 1024 * 1024;

export const upload = multer({
  storage,
  limits: {
    fileSize: maxChunkSize,
  },
});
