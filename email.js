
const nodemailer = require('nodemailer');


class Email{
    sendEmail(to){
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'kidslaughs123@gmail.com',
                pass: 'deepak!123'
            }
        });
        const mailOptions = {
            from: 'kidslaughs123@gmail.com', // sender address
            to: to, // list of receivers comma separated
            subject: 'New Jokes for you', // Subject line
            html: '<p>Dear Customer, New Jokes for you waiting at <a href="www.kidslaughs.com">kidslaughs.com</a></p>'// plain text body
        };
        transporter.sendMail(mailOptions, function (err, info) {
            if(err)
                console.log(err)
            else
                console.log(info);
        });
    }
}

module.exports= new Email();