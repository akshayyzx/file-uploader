import { Router } from "express";

import {
  completeUpload,
  getPresignedUrl,
  getUploadStatus,
  initializeUpload,
  uploadChunk,
} from "../controllers/upload.controller";
import { upload } from "../config/multer";

const router = Router();

router.post("/initialize", initializeUpload);
router.get("/status/:uploadId", getUploadStatus);
router.post(
  "/:uploadId/chunk",
  upload.single("chunk"),
  uploadChunk
);
router.post(
  "/presigned-url",
  getPresignedUrl
);
router.post(
  "/complete",
  completeUpload
);

export default router;
