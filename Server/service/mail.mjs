import nodemailer from "nodemailer";
import fs from "fs";
import OTP from "otplib";
import "dotenv/config";
import Twilio from "twilio";
export async function sendVerifyCode(phone) {
  //configurar la autenticacion para enviar los sms desde la cuenta origen
  const password = process.env.EMAIL_PASSWORD_ACOUNT;
  try {
    // const transporter = nodemailer.createTransport({
    //   service: "Gmail",
    //   secure: false,
    //   auth: {
    //     user: "enzombula@gmail.com",
    //     pass: password,
    //   },
    //   // tls: {
    //   //   rejectUnauthorized: false,
    //   //   ca: [fs.readFileSync("./server.crt")],
    //   // },
    // });

    const accountSid = process.env.AccountSid;
    const authToken = process.env.AuthToken;

    const client = new Twilio(accountSid, authToken);

    const { authenticator } = OTP;
    //Generar el token
    const secret = authenticator.generateSecret();
    // Generar un código OTP de 6 dígitos
    const otpCode = authenticator.generate(secret);

    //Agregar el token al sms
    client.messages
      .create({
        body: `Your verification code is ${otpCode}. For security reasons, do not share this code with anyone.`,
        from: process.env.PHONE_TWILO,
        to: phone,
      })
      .then((message) => console.log("SMS enviado :" + message.sid))
      .catch((error) => error);
    // let mailOptions = {
    //   from: "enzombula@gmail.com",
    //   to: `${email}`,
    //   subject: "Código de verificación",
    //   text: `Tu código de verificación es: ${otpCode}`,
    // };
    //enviar el sms con el token
    // transporter.sendMail(mailOptions, function (error, info) {
    //   if (error) {
    //     console.log(error);
    //     return error;
    //   } else {
    //     console.log("Email enviado: " + info.response);
    //   }
    // });
    console.log(otpCode);
    console.log(secret);
    //retornar el token para su posterior verificacion
    return { otpCode, secret };
  } catch (error) {
    console.log(error);
    return error;
  }
}
