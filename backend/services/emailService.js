const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail', // or use host and port for other providers
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendWelcomeEmail = async (to, username) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('Email credentials not found. Skipping email sending.');
        return;
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: 'Welcome to Climate Disease Predictor',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h1 style="color: #3b82f6;">Welcome, ${username}!</h1>
                <p>Thank you for registering with <strong>Climate Disease Predictor</strong>.</p>
                <p>You can now access our advanced AI-driven tools to predict potential health risks based on environmental conditions.</p>
                <br>
                <p>Stay Safe & Healthy,</p>
                <p>The ClimateHealth Team</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to ${to}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};
