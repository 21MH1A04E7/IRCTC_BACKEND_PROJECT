const { config } = require("../config");
const transporter=require('../config/nodemailer')


const minute = (config.OTP_TTL || 300) / 60;

const sendOTPEmail = async (email, otp) => {
  const msg = {
    to: email,
    from: config.NODE_MAILER_VERIFIED_EMAIL,
    subject: "Your OTP Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 10px;">
        
        <h2 style="text-align: center; color: #333;">
          OTP Verification
        </h2>

        <p style="font-size: 16px; color: #555;">
          Your OTP code is for the BACKEND PROJECT
        </p>

        <div style="
          text-align: center;
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          color: #000;
          margin: 30px 0;
        ">
          ${otp}
        </div>

        <p style="font-size: 15px; color: #555;">
          This OTP is valid for <strong>${minute} minutes</strong>.
        </p>

        <p style="font-size: 14px; color: #999;">
          If you did not request this OTP, please ignore this email.
        </p>

      </div>
    `,
  };

  try {
    await transporter.sendMail(msg);

    console.log("OTP email sent successfully");
  } catch (error) {
    console.log(error.response?.body || error.message);
  }
};

const verifyOtpEmail = async (meta) => {
    const msg = {
      to: meta.email,
      from: config.NODE_MAILER_VERIFIED_EMAIL,
      subject: "Email Verified Successfully",
      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 20px;
          border: 1px solid #e5e5e5;
          border-radius: 10px;
        ">
  
          <h2 style="
            text-align: center;
            color: #22c55e;
          ">
            Email Verified
          </h2>
  
          <p style="
            font-size: 16px;
            color: #555;
          ">
            Hello ${meta.firstName + meta.lastName || "User"},
          </p>
  
          <p style="
            font-size: 15px;
            color: #555;
            line-height: 1.6;
          ">
            Your email has been verified successfully. for the BACKEND PROJECT
          </p>
  
          <div style="
            text-align: center;
            margin: 30px 0;
          ">
            <span style="
              display: inline-block;
              padding: 12px 25px;
              background: #22c55e;
              color: white;
              border-radius: 6px;
              font-weight: bold;
              font-size: 16px;
            ">
              Verification Successful
            </span>
          </div>
  
          <p style="
            font-size: 14px;
            color: #999;
          ">
            Thank you for verifying your email.
          </p>
  
        </div>
      `,
    };
  
    try {
      await transporter.sendMail(msg);
  
      console.log("Verification email sent successfully");
    } catch (error) {
      console.log(error.response?.body || error.message);
    }
  };
  
module.exports = {
  sendOTPEmail,
  verifyOtpEmail
};