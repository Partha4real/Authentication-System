const nodemailer = require('nodemailer');


let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'partha.beis.16@acharya.ac.in',
      pass: 'Shehates@1998'
    }
  });
  

module.exports = transporter;