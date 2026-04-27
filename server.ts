import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for sending email
  app.post("/api/send-email", async (req, res) => {
    try {
      const { name, email, phone, companyName, service, date, time, reference_id, booking_details } = req.body;
      
      const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST || "smtp.gmail.com",
        port: parseInt(process.env.MAIL_PORT || "587", 10),
        secure: process.env.MAIL_ENCRYPTION === "ssl" || process.env.MAIL_PORT === "465",
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });

      const mailOptions = {
        from: `eLawyersBD <${process.env.MAIL_USER}>`,
        to: email, // Send to the customer
        bcc: process.env.MAIL_USER, // Also notify the business
        subject: `Booking Request Received - ${reference_id}`,
        text: `Hello ${name},\n\nWe have received your booking request for ${service}.\n\nPreferred Date: ${date}\nPreferred Time: ${time}\nReference ID: ${reference_id}\n\nClient Details:\nPhone: ${phone}\nCompany: ${companyName || 'N/A'}\nDetails: ${booking_details}\n\nOur team will review your request and get back to you soon.\n\nThank you,\neLawyersBD`,
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
            <div style="background-color: #0f172a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #fff; margin: 0; font-size: 24px;">eLawyersBD</h1>
            </div>
            <div style="padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
              <h2 style="color: #1e293b; margin-top: 0;">Booking Received</h2>
              <p>Hello <strong>${name}</strong>,</p>
              <p>We have received your booking request for <strong>${service}</strong>. Here are the details:</p>
              
              <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #edf2f7; font-weight: bold; width: 40%;">Reference ID</td>
                  <td style="padding: 10px; border-bottom: 1px solid #edf2f7;">${reference_id}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #edf2f7; font-weight: bold;">Service</td>
                  <td style="padding: 10px; border-bottom: 1px solid #edf2f7;">${service}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #edf2f7; font-weight: bold;">Date</td>
                  <td style="padding: 10px; border-bottom: 1px solid #edf2f7;">${date}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #edf2f7; font-weight: bold;">Time</td>
                  <td style="padding: 10px; border-bottom: 1px solid #edf2f7;">${time}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #edf2f7; font-weight: bold;">Phone</td>
                  <td style="padding: 10px; border-bottom: 1px solid #edf2f7;">${phone}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #edf2f7; font-weight: bold;">Company</td>
                  <td style="padding: 10px; border-bottom: 1px solid #edf2f7;">${companyName || "N/A"}</td>
                </tr>
              </table>

              <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin-top: 0; font-weight: bold; color: #64748b; font-size: 12px; text-transform: uppercase;">Description</p>
                <p style="margin-bottom: 0;">${booking_details || "No additional details provided."}</p>
              </div>

              <p>Our team will review your request and get back to you shortly to confirm the appointment.</p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #edf2f7; font-size: 14px; color: #64748b;">
                <p>Thank you for choosing <strong>eLawyersBD</strong>.</p>
              </div>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: "Email sent successfully" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ success: false, error: "Failed to send email" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Since we're using Express 4.x as per package.json ("express": "^4.21.2")
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
