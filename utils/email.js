const nodemailer = require('nodemailer');


const sendEmail = async option => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        } 
    })


    // var transport = nodemailer.createTransport({
    //     host: "sandbox.smtp.mailtrap.io",
    //     port: 2525,
    //     auth: {
    //       user: "89a8dcf00736df",
    //       pass: "830dc587923c38"
    //     }
    //   });




    const mailOptions = {
        from: 'Natours Team <5jLp0@example.com>',
        to: option.email,
        subject: option.subject,
        text: option.message
    }
   await  transporter.sendMail(mailOptions)
}

module.exports = sendEmail