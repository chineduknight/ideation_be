import hbs from "nodemailer-express-handlebars";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const {
  MAIL_PORT,
  MAIL_SERVER_GMAIL,
  MAILER_EMAIL_ID_GMAIL,
  MAILER_PASSWORD_GMAIL,
} = process.env;

const options = {
  viewEngine: {
    extname: ".html",
    layoutsDir: path.resolve("src/api/template/"),
    defaultLayout: false,
    partialsDir: path.resolve("src/api/template/"),
  },
  viewPath: path.resolve("src/api/template/"),
  extName: ".html",
};
const mailSender = {
  send: async (data) => {
    data.domainName = process.env.REACT_APP_URL;
    const smtpTransport = nodemailer.createTransport({
      host: MAIL_SERVER_GMAIL,
      port: MAIL_PORT,
      auth: {
        user: MAILER_EMAIL_ID_GMAIL,
        pass: MAILER_PASSWORD_GMAIL,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    smtpTransport.use("compile", hbs(options));

    const sent = await smtpTransport.sendMail(data);

    return sent;
  },
};

export default mailSender;
