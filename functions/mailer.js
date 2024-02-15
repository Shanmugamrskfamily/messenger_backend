import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

async function sendMail(mailerData) {
  const { subject, sender, receivers, textContent, htmlContent } = mailerData;

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL, // generated ethereal user
      pass: process.env.PASS, // generated ethereal password
    },
  });

  // send mail with defined transporter object
  let info = await transporter.sendMail({
    from: `${sender.name} <${sender.mailId}>`,
    to: receivers.join(","),
    subject: subject,
    text: textContent,
    html: htmlContent,
  });

  console.log("Message sent: %s", info.messageId);
}

export { sendMail };
