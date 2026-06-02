const nodemailer = require("nodemailer");
const {config}=require('./index')

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.NODE_MAILEREMAIL_USER,
    pass: config.NODE_MAILEREMAIL_PASS
  },
});

module.exports=transporter
