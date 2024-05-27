"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_express_handlebars_1 = __importDefault(require("nodemailer-express-handlebars"));
const path_1 = __importDefault(require("path"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { MAIL_PORT, MAIL_SERVER_GMAIL, MAILER_EMAIL_ID_GMAIL, MAILER_PASSWORD_GMAIL, } = process.env;
const options = {
    viewEngine: {
        extname: ".html",
        layoutsDir: path_1.default.resolve("src/api/template/"),
        defaultLayout: false,
        partialsDir: path_1.default.resolve("src/api/template/"),
    },
    viewPath: path_1.default.resolve("src/api/template/"),
    extName: ".html",
};
const mailSender = {
    send: (data) => __awaiter(void 0, void 0, void 0, function* () {
        data.domainName = process.env.REACT_APP_URL;
        const smtpTransport = nodemailer_1.default.createTransport({
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
        smtpTransport.use("compile", (0, nodemailer_express_handlebars_1.default)(options));
        const sent = yield smtpTransport.sendMail(data);
        return sent;
    }),
};
exports.default = mailSender;
