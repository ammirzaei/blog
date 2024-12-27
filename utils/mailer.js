const nodeMailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

const transporterDetails = smtpTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'amir@gmail.com',
        pass: '123'
    },
    tls: {
        rejectUnauthorized: false
    }
});

exports.sendEmail = (to, subject, message) => {
    const transporter = nodeMailer.createTransport(transporterDetails);
    transporter.sendMail({
        from: 'am@',
        to,
        subject,
        html: message
    });
}