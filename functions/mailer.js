export async function sendMail(mailerData) {
  const { subject, sender, receivers, textContent, htmlContent } = mailerData;
  // console.log("mailer Data", mailerData);
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: "outlook",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
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
