// Import the 'nodemailer' library
const nodemailer = require('nodemailer');

// This is the default Vercel handler
export default async function handler(req, res) {
    // We only want to handle POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests allowed' });
    }

    const { name, email, phone, message } = req.body;

    // Simple validation
    if (!name || !email || !message) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create the transporter object. This is how you connect to Gmail.
    // We use Environment Variables (process.env) so your password isn't in the code.
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Your email: vcare1.enterprises@gmail.com
            pass: process.env.EMAIL_PASS, // Your 16-character "App Password"
        },
    });

    // --- Email 1: Notification to Vcare ---
    // This part has been updated for better "Reply" functionality
    const mailToVcare = {
        from: '"Vcare Website Form" <vcare1.enterprises@gmail.com>', // Sent FROM your address
        to: 'vcare1.enterprises@gmail.com',                     // Sent TO your address
        replyTo: `"${name}" <${email}>`,                       // When you hit Reply, it goes to the user
        subject: `New Vcare Contact Form Submission from ${name}`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                <hr>
                <p><strong>Message:</strong></p>
                <p style="white-space: pre-wrap;">${message}</p>
            </div>
        `,
    };

    // --- Email 2: Auto-response to the User ---
    // (This part remains unchanged)
    const mailToUser = {
        from: '"Vcare" <vcare1.enterprises@gmail.com>', // From your official email
        to: email,
        subject: 'Thank you for contacting Vcare!',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Thank You for Your Inquiry, ${name}!</h2>
                <p>We have received your message and are looking into it. <strong>Vcare will soon address your problem.</strong></p>
                <p>Here is a copy of the details you submitted:</p>
                <hr>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                <p><strong>Message:</strong></p>
                <p style="white-space: pre-wrap;">${message}</p>
                <hr>
                <p>Best regards,<br>The Vcare Team</p>
            </div>
        `,
    };

    try {
        // Send both emails in parallel
        await Promise.all([
            transporter.sendMail(mailToVcare),
            transporter.sendMail(mailToUser)
        ]);

        // Send a success response back to the form
        return res.status(200).json({ status: 'Ok', message: 'Emails sent successfully!' });
    } catch (error) {
        console.error(error);
        // Send an error response back to the form
        return res.status(500).json({ status: 'Error', message: 'Something went wrong.' });
    }
}

