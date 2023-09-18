var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false, // upgrade later with STARTTLS
    auth: {
      user: "abi.heaventreecko@gmail.com",
      pass: "DgKT2LWkv4p9PS7I",
    },
  });

module.exports=transporter
