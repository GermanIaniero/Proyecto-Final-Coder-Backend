import config from "../config/config.js";
import nodemailer from "nodemailer";
import twilio from "twilio";
import __dirname from "../utils/utils.js";
import { generateToken } from "../utils/utils.js";

const client = twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTHO_TOKEN);

const transport = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  auth: {
    user: "gamcordoba@gmail.com",
    pass: "mhepmcughwgbrfho",
  },
});

export const sent_sms = async (req, res) => {
  try {
    const result = await client.messages.create({
      body: "REGISTRO EXITOSO. Tu usuario registrado es: gamcordoba@gmail.com",
      from: config.TWILIO_SMS_NUMBER,
      to: "+543512404281",
    });

    console.log(result);
    res.send("Sms sent");
  } catch (error) {
    console.error(error);
    res.status(500).send("Sms send failed");
  }
};

export const sent_email = async (req, res) => {
  try {
    const userEmail = req.body.email;
    const token = generateToken({ user: userEmail });
    const resetLink = `https://proyecto-final-coder-backend-production-germanianiero.up.railway.app/resetPassConfirm?token=${token}`;

    const result = await transport.sendMail({
      from: "gamcordoba@gmail.com",
      to: userEmail,
      subject: "Restablecimiento de Contraseña",
      html: `
      <div>
        <h2>Restablecimiento de Contraseña</h2>
        <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${resetLink}">${resetLink}</a>;
      </div>
      `,
    });

    console.log(result);
    res.render("resetPassOk", {});
  } catch (error) {
    console.error(error);
    res.status(500).send("Fallo al enviar el correo electrónico");
  }
};

export const sent_success = async (
  email,
  amountTotalBuy,
  products,
  newTicket
) => {
  try {
    const { code, purchase_datetime } = newTicket;
    const formattedPurchaseDate = new Date(purchase_datetime).toLocaleString();

    const result = await transport.sendMail({
      from: "gamcordoba@gmail.com",
      to: email,
      subject: "ECOMMERCE GERMAN - Tu pedido",
      html: `
        <div>
          <h2>¡Gracias por tu compra!</h2>
          <h4>Resumen de compra:</h4>
          <p>Código de orden: ${code}</p>
          <p>Fecha de compra: ${formattedPurchaseDate}</p>
          <p>Productos:</p>
          <ul>
            ${products.map(
              (product) =>
                `<li>${product.quantity} ${product.pid.title} - ${product.pid.price} C/U </li>`
            )}
          </ul>
          <p>Total: $ ${amountTotalBuy}</p>

        </div>
      `,
    });

    console.log("Correo electrónico enviado:", result);
  } catch (error) {
    console.error("Error al enviar el correo electrónico:", error);
    throw new Error("Error al enviar el correo electrónico");
  }
};

export const sent_contacto = async (req, res) => {
  try {
    const nombre = req.body.nombre;
    const email = req.body.email;
    const telefono = req.body.telefono;
    const mensaje = req.body.mensaje;

    const result = await transport.sendMail({
      from: email,
      to: "gamcordoba@gmail.com",
      subject: "Mensaje de contacto",
      html: `
      <div>
        <h3>Mensaje de ${nombre}</h3>
        <p>Email: ${email}</p>
        <p>Telefono: ${telefono}</p>
        <p>Mensaje: ${mensaje}</p>
      </div>
      `,
    });

    console.log(result);
    res.render("contacto", {});
  } catch (error) {
    console.error(error);
    res.status(500).send("Fallo al enviar el correo electrónico");
  }
};
