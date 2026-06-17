import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, "uploads/");
    },
    filename: (req,file, cb) => {
     const uploadId = req.params.uploadId;
     const chunkNumber = req.query.chunkNumber;

     cb(
        null,
        `${uploadId}-${chunkNumber}`
     )
  }
});

export const upload = multer({storage});