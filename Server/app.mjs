import express from "express";
import multer from "multer";
import { corsMiddleware } from "./Middleware/cors.js";
import { serviceRouter } from "./Routes/service-router.js";
import cors from "cors";
const app = express();
const PORT = process.env.PORT ?? 3000;

//Middleware para capturar el body de una reques en un post Y PARA EL CORS
// app.use(corsMiddleware());
app.use(cors());
app.use(express.json());
app.disable("x-powered-by");
//TODO : CREAR UN MIDDLEWARE PARA LAS PETICIONES DEL USUARIO Y VERIFICAR SI ESTAN AUTENTICADOS Y AUTORIZADOS
app.use((req, res, next) => {
  //verificar si usuario cookies o login

  next();
});
app.use(express.static("./Server/uploads")); // Especifica la carpeta donde se encuentran las imágenes
app.use("/", serviceRouter);
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto http://localhost:${PORT}`);
});
