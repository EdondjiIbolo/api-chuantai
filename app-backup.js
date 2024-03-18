import express from "express";
import crypto from "node:crypto";
import cors from "cors";

import bcrypt from "bcrypt";
import {
  validateUserSignin,
  validateUserlogin,
  validateDataMessage,
} from "./schema/userSchema.mjs";
import { sendVerifyCode } from "./service/mail.mjs";
import { serviceRouter } from "./Routes/service-router.js";

const app = express();
const PORT = process.env.PORT || 3000;

//Middleware para capturar el body de una reques en un post
app.use(cors());
app.use(express.json());
app.disable("x-powered-by");

//Rutas
//TODO --> MIGRAR A ARQUITECTURA MVC
app.use((req, res, next) => {
  //verificar si usuario cookies o login

  next();
});
// app.post("/login", async (req, res) => {
//   const validateData = validateUserlogin(req.body);
//   if (validateData.error) {
//     return res.status(400).json({ error: validateData.error.message });
//   }
//   const { phone, password } = validateData.data;
//   const [querdata, _] = await connection.query(
//     "SELECT phone, password FROM usuarios WHERE phone = ? AND password = ?",
//     [phone, password]
//   );
//   const response = await querdata;
//   if (response.length === 0) {
//     res.status(401).json({
//       error: "invalid user or password",
//     });
//     return;
//   }
//   const userInfo = await connection.query(
//     "SELECT * FROM usuarios WHERE phone = ?",
//     [phone]
//   );

//   const [user] = userInfo[0];
//   const userForToken = {
//     id: user.ID,
//     password: user.password,
//   };
//   const token = jwt.sign(userForToken, "1234", { expiresIn: "3d" });
//   const data = {
//     name: user.name,
//     username: user.username,
//     email: user.email,
//     token,
//   };

//   res.status(200).json(data);
// });
// app.post("/verify", async (req, res) => {
//   const { phone } = req.body;
//   const { otpCode } = await sendVerifyCode(phone);
//   console.log(otpCode);
//   // verificar el codigo y almacenarlo DB
//   const saltRounds = 10;
//   const myPlaintextPassword = otpCode;
//   const salt = bcrypt.genSaltSync(saltRounds);
//   const encriptedCode = bcrypt.hashSync(myPlaintextPassword, salt);
//   const insertdata = await connection.query(
//     "INSERT INTO verify (phone, secret_word ) VALUES (?,?)",
//     [phone, encriptedCode]
//   );
//   res
//     .status(200)
//     .json({ message: "Codigo de Verificacion enviado correctamente" });
// });
// app.post("/sign-up", async (req, res) => {
//   // validar
//   const validateData = validateUserSignin(req.body);
//   if (validateData.error) {
//     return res.status(400).json({ error: validateData.error.message });
//   }
//   const { name, username, email, password, phone, rol, verifyCode } =
//     validateData.data;
//   //manerjar el error
//   const [querdata, _] = await connection.query(
//     "SELECT phone, secret_word FROM verify WHERE phone = ?",
//     [phone]
//   );

//   const inputUser = verifyCode;
//   const codeValidate = querdata.filter((data) => {
//     const code = data.secret_word;
//     //comparar codigos
//     const isValid = bcrypt.compareSync(inputUser, code);
//     console.log(isValid);
//     if (isValid) return data;
//   });

//   if (!codeValidate[0]) {
//     console.log("El código no es válido");
//     return res.status(498).json({ message: "El código no es válido" });
//   }

//   //    Revisar si el usuario ya existe en la base de datos.
//   const [isUserExist, tableInfo] = await connection.query(
//     "SELECT * FROM usuarios WHERE phone = ?",
//     [phone]
//   );
//   //Verificar si el usuario ya existe para enviar un enviar un error
//   if (isUserExist[0]) {
//     return res.status(400).json({ message: "El usuario ya existe" });
//   }
//   // si el suario no existe crearle una nueva cuenta y enviar el token

//   const user = {
//     name,
//     username,
//     email,
//     password,
//     rol,
//     phone,
//   };

//   const insertdata = await connection.query(
//     "INSERT INTO usuarios ( name, username, email, password, Rol_ID,phone) VALUES (?,?,?,?,?,?)",
//     [name, username, email, password, rol, phone]
//   );
//   const userForToken = {
//     id: user.id,
//     password: user.password,
//   };
//   const token = jwt.sign(userForToken, "1234", { expiresIn: "3d" });
//   const data = {
//     name: user.name,
//     username: user.username,
//     token,
//   };
//   res.status(201).json(data);
// });
// app.post("/contact", async (req, res) => {
//   const Validatedata = validateDataMessage(req.body);
//   if (Validatedata.error) {
//     return res.status(400).json({ error: Validatedata.error.message });
//   }
//   const { name, surename, email, companyName, phone, message, check } =
//     Validatedata.data;
//   const insertMessage = connection.query(
//     "INSERT INTO messages ( name, surename, email, company , phone ,message, checked) VALUES (?,?,?,?,?,?,?)",
//     [name, surename, email, companyName, phone, message, check]
//   );
//   res.status(200).json({ message: "Message have sent successfully" });
// });
// app.post("/recover", async (req, res) => {
//   const validateData = validateUserlogin(req.body);
//   if (validateData.error) {
//     return res.status(400).json({ error: validateData.error.message });
//   }
//   const { phone, password, verifyCode } = validateData.data;
//   //verificar el codigo de verificacion
//   const [querydata, a] = await connection.query(
//     "SELECT phone, secret_word FROM verify WHERE phone = ?",
//     [phone]
//   );

//   const inputUser = verifyCode;
//   const [codeValidate] = querydata.filter((data) => {
//     const code = data.secret_word;
//     //comparar codigos
//     const isValid = bcrypt.compareSync(inputUser, code);
//     if (isValid) return data;
//     return false;
//   });

//   if (!codeValidate) {
//     return res.status(498).json({ message: "El código no es válido" });
//   }

//   const [userData, _] = await connection.query(
//     "SELECT * FROM usuarios WHERE phone = ?",
//     [phone]
//   );
//   const [data] = userData;

//   console.log(data);
//   const userPhone = data?.phone;
//   if (!userPhone) {
//     return res.status(400).json({
//       message: "No se ha encontrado un usuarion con este Numero de telefono",
//     });
//   }
//   const changePassword = await connection.query(
//     "UPDATE  usuarios SET password = ? WHERE phone = ?",
//     [password, phone]
//   );

//   res.status(200).send("Contraseña actualizado correctamente");
// });
// app.get("/", async (req, res) => {
//   const [[data], _] = await connection.query("SELECT * FROM roles");
//   console.log(data.id);
//   res.status(200).send("Hola Mundo");
// });

app.use("/service", serviceRouter);
app.listen(PORT, () => {
  console.log(
    `Servidor escuchando en el puerto http://localhost:${PORT}/service`
  );
});
