import nodemailer from "nodemailer";

export const sendEmail = async ({ email, otp }) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.APP_MAIL,
                pass: process.env.APP_PASS,
            },
        });

        const mailOptions = {
            from: process.env.APP_MAIL,
            to: email,
            subject: "ভেরিফিকেশন কোড (OTP) - TaxLine BD",
            html: `
      <div style="font-family: 'Noto Sans Bengali', Arial, sans-serif; background: #f8fafc; padding: 20px;">
        <div style="max-width: 520px; margin: auto; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); overflow: hidden;">
          
          <!-- Header -->
          <div style="background: linear-gradient(90deg, #d48300, #ffcc7b); color: #fff; padding: 16px; text-align: center; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">
            TaxLine BD - ই-রিটার্ন সার্ভিস
          </div>

          <!-- Body -->
          <div style="padding: 22px; color: #222; line-height: 1.7; font-size: 15px;">
            <p>প্রিয় করদাতা,</p>
            <p>TaxLine BD পোর্টালে আপনার একাউন্ট তৈরি করার জন্য ধন্যবাদ।</p>
            
            <p style="margin-top: 15px; font-size: 16px; font-weight: 500;">আপনার ভেরিফিকেশন কোড (OTP):</p>
            <div style="text-align: center; margin: 20px 0;">
              <span style="
                font-size: 30px; 
                font-weight: bold; 
                color: #d48300; 
                letter-spacing: 4px; 
                padding: 10px 25px; 
                border: 2px dashed #d48300; 
                border-radius: 8px;
                display: inline-block;
                background: #fff7eb;">
                ${otp}
              </span>
            </div>

            <p>অনুগ্রহ করে উপরের কোডটি ব্যবহার করে রেজিস্ট্রেশন সম্পূর্ণ করুন।</p>
            <p>আমাদের ই-রিটার্ন প্ল্যাটফর্মের মাধ্যমে আপনি সহজে কর জমা, হিসাব ও ভেরিফিকেশন করতে পারবেন।</p>
          </div>

          <!-- Footer -->
          <div style="background: #f4f4f4; text-align: center; padding: 12px; font-size: 13px; color: #555;">
            © ${new Date().getFullYear()} TaxLine BD | জাতীয় রাজস্ব বোর্ড অনুমোদিত নয়, এটি একটি তথ্যভিত্তিক সহায়তা প্ল্যাটফর্ম।
          </div>
        </div>
      </div>
      `,
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Email sending failed:", error);
    }
};
