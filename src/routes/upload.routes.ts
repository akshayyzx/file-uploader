import { Router } from "express";

import {
  initializeUpload,getUploadStatus
} from "../controllers/upload.controller";

const router = Router();

router.post("/initialize", initializeUpload);
router.get("/status/:uploadId", getUploadStatus);
router.post(
  "/presigned-url",
  getPresignedUrl
);

export default router;