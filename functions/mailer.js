export async function sendMail(mailerData) {
  const { subject, sender, receivers, textContent, htmlContent } = mailerData;
  // console.log("mailer Data", mailerData);
  // create reusable transporter object using the default SMTP transport
  // let transporter = nodemailer.createTransport({
  //   host: "smtp.outlook.com",
  //   service: "outlook",
  //   secure: false,
  //   auth: {
  //     user: process.env.EMAIL,
  //     pass: process.env.PASS,
  //   },
  // });
  var transporter = nodemailer.createTransport("SMTP", {
    host: "smtp-mail.outlook.com", // hostname
    secureConnection: false, 
    port: 587, 
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
    },
    tls: {
        ciphers:'SSLv3'
    }
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
