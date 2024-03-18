import express from "express";
import crypto from "node:crypto";
import cors from "cors";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import multer from "multer";
import {
  validateUserSignin,
  validateUserlogin,
  validateDataMessage,
} from "./schema/userSchema.mjs";
import { sendVerifyCode } from "./service/mail.mjs";
import fs from "node:fs/promises";
import path, { dirname } from "node:path";

import { fileURLToPath } from "url";
import { corsMiddleware } from "./Middleware/cors";

const app = express();
const PORT = process.env.PORT || 3000;
const config = {
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  port: process.env.DB_PORT,
  database: process.env.MYSQLDATABASE,
};

const storage = multer.diskStorage({
  destination: "./Server/uploads",
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage: storage });
// const upload = multer({ dest: "./Server/uploads" });
const connection = await mysql.createConnection(config);

//Middleware para capturar el body de una reques en un post
app.use(corsMiddleware());
app.use(express.json());
app.disable("x-powered-by");

//Rutas
//TODO --> MIGRAR A ARQUITECTURA MVC
app.use((req, res, next) => {
  //verificar si usuario cookies o login

  next();
});
app.use(express.static("./Server/uploads")); // Especifica la carpeta donde se encuentran las imágenes

app.get("/file/:id", (req, res) => {
  const { id } = req.params;
  console.log(id);

  const filePath = `./Server/uploads/${id}`;
  res.download(filePath); // Descargar la imagen
});
app.get("/assistant-quote", async (req, res) => {
  const [quotes, _] = await connection.query(
    "SELECT quotations.*, usuarios.nombre , usuarios.telefono FROM quotations JOIN usuarios ON usuarios.id  = quotations.user_id"
  );
  console.log(quotes);
  res.status(200).json(quotes);
});
app.get("/quote/:id", async (req, res) => {
  const { id } = req.params;
  const getImageUrl = async () => {
    try {
      const [[dataBaseUrlImage], _] = await connection.query(
        "SELECT * FROM quotations WHERE id_quotation=?",
        [id]
      );
      const { url } = await dataBaseUrlImage;
      // console.log(url);
      return url;
    } catch (err) {
      return res.status(400).json({ error: "imagen no encontrada" });
    }
  };
  const urlImage = await getImageUrl();
  console.log(urlImage);
  // const getImageFile = async () => {
  //   const __filename = fileURLToPath(import.meta.url);
  //   const mainFrolder = path.join(__filename, "..");
  //   const imageFolder = path.join(mainFrolder, "uploads");
  //   const file = fs.readFile(nombreimagen, formato);
  // };
  // getImageFile();
  // devolver la imagen
  // devolver el id de quote
  // devolver el id de quote
  res.status(200).json({ id });
  // console.log(id);
});

app.post("/new-quote", upload.single("file"), async (req, res, next) => {
  const { email } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "No se ha recibido ningun archivo" });
  }
  // recuperar el id del usuario
  const [[idUser], _] = await connection.query(
    "SELECT id FROM usuarios WHERE email=?",
    [email]
  );
  const { userId } = idUser;
  const { id } = idUser;
  const date = Date.now();
  const newDate = new Date(date);

  const quoteId = crypto.randomUUID();
  const url = req.file.filename;

  const setQuote = await connection.query(
    "INSERT INTO quotations (id_quotation , user_id ,  fecha_quotation , url) VALUES (?,?,?,?)",
    [quoteId, id, newDate, url]
  );

  res.status(200).json({ quoteId });
  next();
});
app.post("/send-quote", async (req, res) => {
  console.log(req.body);
  const {
    quantity,
    Technology,
    Material,
    Finishing,
    Tolerance,
    Roughness,
    Threads,
    lead_time,
    name,
    username,
    address,
    email,
    token,
    Quotation_id,
  } = req.body;
  const date = Date.now();
  const newDate = new Date(date);
  try {
    const [[userId], _] = await connection.query(
      "SELECT id FROM usuarios WHERE email= ?",
      [email]
    );
    const { id } = userId;

    const insertQuote = await connection.query(
      "UPDATE quotations SET technology = ? , material = ? , finishing = ? , tolerance = ? , threads = ? , lead_time = ? , address = ? , quantity = ? , quotation_Date = ?,   note = ? WHERE   id_quotation = ? ",
      [
        Technology,
        Material,
        Finishing,
        Tolerance,
        Threads,
        lead_time,
        address,
        quantity,
        newDate,
        "none",
        Quotation_id,
      ]
    );
    res.status(201).json({ message: "QUOTED CREATED SUCCESSFULLY" });
  } catch (err) {
    console.log(err);
  }
});

app.post("/assistant-changes", async (req, res) => {
  const { status, price, id } = req.body;
  console.log(req.body);
  const insertdata = await connection.query(
    "UPDATE quotations SET price = ? , status = ? WHERE id_quotation = ? ",
    [price, status, id]
  );
  if (!insertdata) {
    return res.status(400).json({ message: "error al actualizar los datos" });
  }
  res.status(200).json({ message: "Datos actualizados correctamente" });
});

app.post("/service/login", async (req, res) => {
  const validateData = validateUserlogin(req.body);
  if (validateData.error) {
    return res.status(400).json({ error: validateData.error.message });
  }
  console.log(validateData);
  const { phone, password } = validateData.data;
  const [querdata, _] = await connection.query(
    "SELECT telefono, contrasena FROM usuarios WHERE telefono = ? AND contrasena = ?",
    [phone, password]
  );
  const response = await querdata;
  if (response.length === 0) {
    res.status(401).json({
      error: "invalid user or password",
    });
    return;
  }
  const userInfo = await connection.query(
    "SELECT * FROM usuarios WHERE telefono = ?",
    [phone]
  );

  const [user] = userInfo[0];
  const userForToken = {
    id: user.ID,
    password: user.password,
  };
  const token = jwt.sign(userForToken, "1234", { expiresIn: "3d" });
  const data = {
    name: user.name,
    username: user.username,
    email: user.email,
    token,
  };

  res.status(200).json(data);
});
app.post("/verify", async (req, res) => {
  const { phone } = req.body;
  const { otpCode } = await sendVerifyCode(phone);
  console.log(otpCode);
  // verificar el codigo y almacenarlo DB
  const saltRounds = 10;
  const myPlaintextPassword = otpCode;
  const salt = bcrypt.genSaltSync(saltRounds);
  const encriptedCode = bcrypt.hashSync(myPlaintextPassword, salt);
  const insertdata = await connection.query(
    "INSERT INTO verify (phone, secret_word ) VALUES (?,?)",
    [phone, encriptedCode]
  );
  res
    .status(200)
    .json({ message: "Codigo de Verificacion enviado correctamente" });
});
app.post("/sign-up", async (req, res) => {
  // validar
  const validateData = validateUserSignin(req.body);
  if (validateData.error) {
    return res.status(400).json({ error: validateData.error.message });
  }
  const { name, username, email, password, phone, rol, verifyCode } =
    validateData.data;
  //manerjar el error
  const [querdata, _] = await connection.query(
    "SELECT phone, secret_word FROM verify WHERE phone = ?",
    [phone]
  );

  const inputUser = verifyCode;
  const codeValidate = querdata.filter((data) => {
    const code = data.secret_word;
    //comparar codigos
    const isValid = bcrypt.compareSync(inputUser, code);
    console.log(isValid);
    if (isValid) return data;
  });

  if (!codeValidate[0]) {
    console.log("El código no es válido");
    return res.status(498).json({ message: "El código no es válido" });
  }

  //    Revisar si el usuario ya existe en la base de datos.
  const [isUserExist, tableInfo] = await connection.query(
    "SELECT * FROM usuarios WHERE phone = ?",
    [phone]
  );
  //Verificar si el usuario ya existe para enviar un enviar un error
  if (isUserExist[0]) {
    return res.status(400).json({ message: "El usuario ya existe" });
  }
  // si el suario no existe crearle una nueva cuenta y enviar el token
  const userId = crypto.randomUUID();
  const user = {
    userId,
    name,
    username,
    email,
    password,
    rol,
    phone,
    company: "",
  };

  const insertdata = await connection.query(
    "INSERT INTO usuarios ( id, nombre, apellido , email , telefono , contrasena ,  rol_id ) VALUES (?,?,?,?,?,?)",
    [userId, name, username, email, phone, password, rol]
  );
  const userForToken = {
    id: user.id,
    password: user.password,
  };
  const token = jwt.sign(userForToken, "1234", { expiresIn: "3d" });
  const data = {
    name: user.name,
    username: user.username,
    token,
  };
  res.status(201).json(data);
});
app.post("/contact", async (req, res) => {
  const Validatedata = validateDataMessage(req.body);
  if (Validatedata.error) {
    return res.status(400).json({ error: Validatedata.error.message });
  }
  const { name, surename, email, companyName, phone, message, check } =
    Validatedata.data;
  const insertMessage = connection.query(
    "INSERT INTO messages ( name, surename, email, company , phone ,message, checked) VALUES (?,?,?,?,?,?,?)",
    [name, surename, email, companyName, phone, message, check]
  );
  res.status(200).json({ message: "Message have sent successfully" });
});
app.post("/recover", async (req, res) => {
  const validateData = validateUserlogin(req.body);
  if (validateData.error) {
    return res.status(400).json({ error: validateData.error.message });
  }
  const { phone, password, verifyCode } = validateData.data;
  //verificar el codigo de verificacion
  const [querydata, a] = await connection.query(
    "SELECT phone, secret_word FROM verify WHERE phone = ?",
    [phone]
  );

  const inputUser = verifyCode;
  const [codeValidate] = querydata.filter((data) => {
    const code = data.secret_word;
    //comparar codigos
    const isValid = bcrypt.compareSync(inputUser, code);
    if (isValid) return data;
    return false;
  });

  if (!codeValidate) {
    return res.status(498).json({ message: "El código no es válido" });
  }

  const [userData, _] = await connection.query(
    "SELECT * FROM usuarios WHERE phone = ?",
    [phone]
  );
  const [data] = userData;

  console.log(data);
  const userPhone = data?.phone;
  if (!userPhone) {
    return res.status(400).json({
      message: "No se ha encontrado un usuarion con este Numero de telefono",
    });
  }
  const changePassword = await connection.query(
    "UPDATE  usuarios SET password = ? WHERE phone = ?",
    [password, phone]
  );

  res.status(200).send("Contraseña actualizado correctamente");
});

app.get("/", (req, res) => {
  // res.status(200).send("Hola Mundo");
  const data = "SELECT * FROM usuarios";
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto http://localhost:${PORT}`);
});
