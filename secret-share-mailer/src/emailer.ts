import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import Mail from "nodemailer/lib/mailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

dotenv.config();

const {
    RABBITMQ_HOST,
    RABBITMQ_USERNAME,
    RABBITMQ_PASSWORD,
    RABBITMQ_QUEUE,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS
} = process.env;

if (!RABBITMQ_HOST || !RABBITMQ_USERNAME || !RABBITMQ_PASSWORD || !RABBITMQ_QUEUE || !SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error('Missing required environment variables');
}

const transporter: Mail<SMTPTransport.SentMessageInfo> = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
});

const sendEmail = async (to: string, subject: string, text: string): Promise<void> => {
    const mailOptions: Mail.Options = {
        from: SMTP_USER,
        to,
        subject,
        text,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

export default sendEmail;



