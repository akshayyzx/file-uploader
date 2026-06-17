import express from 'express';
import cors from 'cors';
import uploadRoutes from "./routes/upload.routes";
import { uploadToS3 } from "./services/s3.service";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.use(
  "/api/upload",
  uploadRoutes
);

app.get("/test-s3", async (_, res) => {
  try {
    await uploadToS3(
      "hello.txt",
      Buffer.from("Hello from Akshay")
    );

    res.json({
      success: true,
      message: "Uploaded to S3",
    });
  } catch (error: any) {
    console.error("S3 Error:", error);

    res.status(500).json({
      success: false,
      error: {
        message: error?.message || "Unknown error",
        code: error?.Code || error?.code,
        statusCode: error?.$metadata?.httpStatusCode,
        name: error?.name,
      },
    });
  }
});


export default app;
