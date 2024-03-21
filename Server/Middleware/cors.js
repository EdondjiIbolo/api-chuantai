import cors from "cors";

const ACCEPTED_ORIGINS = [
  "https://dachuan-router.vercel.app/",
  "http://localhost:5173",
  "http://localhost:5174",
];

export const corsMiddleware = ({ accepted_origins = ACCEPTED_ORIGINS } = {}) =>
  cors({
    origin: (origin, callback) => {
      if (ACCEPTED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      if (!origin) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
  });
