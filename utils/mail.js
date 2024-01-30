import nodemailer from 'nodemailer'

export const sendEmail = (subject, message, send_to) =>{

    let config = {
        service : 'outlook',
        auth : {
            user : process.env.E_MAIL,
            pass : process.env.E_PASS
        }
    }

    const transporter = nodemailer.createTransport(config)

    let massage = {
        from : process.env.E_MAIL,
        to : send_to,
        subject : subject,
        html : message
    }

    transporter.sendMail(massage, function (err, info) {
        if (err) {
          console.log(err);
        } else {
          console.log(info);
        }
      });
};