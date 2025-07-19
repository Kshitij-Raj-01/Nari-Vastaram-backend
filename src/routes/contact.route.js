const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config();

const router = express.Router();

// POST route for contact form
router.post("/", async (req, res) => {
  console.log("Contact route hit with data:", req.body); // Debug log
  
  const { name, email, message } = req.body;

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Please fill all fields." });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  try {
    // Transporter configuration
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,       // Your Gmail address
        pass: process.env.EMAIL_PASS,       // Your Gmail app password
      },
    });

    // Mail options
    const mailOptions = {
      from: `"${name}" <${process.env.EMAIL_USER}>`, // Use your email as sender
      to: process.env.RECEIVER_EMAIL || process.env.EMAIL_USER,  // Where you want to receive messages
      replyTo: email, // Set reply-to as the user's email
      subject: "💌 New Contact Message from Website",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Message</h2>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <div style="background-color: white; padding: 15px; border-radius: 4px; margin-top: 10px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            This message was sent from your website contact form.
          </p>
        </div>
      `,
      text: `
You have a new message from your website:

Name: ${name}
Email: ${email}
Message: ${message}
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    
    console.log("Email sent successfully"); // Debug log
    res.status(200).json({ message: "Message sent successfully!" });
    
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email. Please try again later." });
  }
});

module.exports = router;