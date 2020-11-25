const nodemailer = require('nodemailer');


let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: '*****',  //enter your email
      pass: '*****'  //enter password
    }
  });
  

module.exports = transporter;
