import { Router } from "express";
import { ServiceController } from "../Controller/service.js";
import multer from "multer";

const PORT = process.env.PORT || 3000;

export const serviceRouter = Router();
const storage = multer.diskStorage({
  destination: "./Server/uploads",
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage: storage });
serviceRouter.get("/panel-info", ServiceController.GetInfo);
serviceRouter.post("/login", ServiceController.logInUser);
serviceRouter.post("/verify", ServiceController.SendVerificationCode);
serviceRouter.post("/sign-up", ServiceController.signAccountUser);
serviceRouter.post("/message-contact", ServiceController.newMessage);
serviceRouter.post("/recover", ServiceController.recoverPassword);
serviceRouter.post("/assistant-changes", ServiceController.AssistantChange);
serviceRouter.get("/assistant-quote", ServiceController.Assistantquote);
serviceRouter.get("/customer-quote", ServiceController.Userquote);
serviceRouter.post("/send-quote", ServiceController.Sendquote);
serviceRouter.get("/file/:id", ServiceController.ReceiveFile);
serviceRouter.get("/quote/:id", ServiceController.SingleQuote);
serviceRouter.get("/data", ServiceController.GetData);
serviceRouter.get("/my-orders", ServiceController.GetOrders);
serviceRouter.post(
  "/new-quote",
  upload.single("file"),
  ServiceController.Newquote
);
