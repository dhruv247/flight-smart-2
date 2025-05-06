const nodemailer = require('nodemailer');
require('dotenv').config();

// create a transporter
const transporter = nodemailer.createTransport({
	service: process.env.EMAIL_SERVICE || 'gmail',
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASSWORD,
	},
});

// sendmail format function
const sendEmail = async (to, subject, text, html = null) => {
	try {
		const mailOptions = {
			from: process.env.EMAIL_USER,
			to,
			subject,
			text,
			...(html && { html }),
		};

		const info = await transporter.sendMail(mailOptions);
		console.log('Email sent successfully:', info.messageId);
		return info;
	} catch (error) {
		console.error('Error sending email:', error.message);
		throw error;
	}
};

// send password email to airline
const sendAirlinePasswordEmail = async (airline, password) => {
	const subject = 'Your Flight Smart Account Password';
	const text = `Hello ${airline.airlineName},\n\nYour account has been verified and a password has been generated for you.\n\nYour password is: ${password}\n\nPlease login to your account and change this password immediately for security reasons.\n\nBest regards,\nFlight Smart Team`;

	const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Your Flight Smart Account Password</h2>
      <p>Hello ${airline.airlineName},</p>
      <p>Your account has been verified and a password has been generated for you.</p>
      <p><strong>Your password is: ${password}</strong></p>
      <p>Please login to your account and change this password immediately for security reasons.</p>
      <p>Best regards,<br>Flight Smart Team</p>
    </div>
  `;

	return sendEmail(airline.email, subject, text, html);
};

// send rejection email to airline
const sendAirlineDeletionEmail = async (airline) => {
	const subject = 'Flight Smart Registration Request Denied';
	const text = `Hello ${airline.airlineName},\n\nWe regret to inform you that your registration request for Flight Smart has been denied by our administrators.\n\nIf you believe this was a mistake or would like to reapply, please contact our support team.\n\nBest regards,\nFlight Smart Team`;

	const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Flight Smart Registration Request Denied</h2>
      <p>Hello ${airline.airlineName},</p>
      <p>We regret to inform you that your registration request for Flight Smart has been denied by our administrators.</p>
      <p>If you believe this was a mistake, please try to register again.</p>
      <p>Best regards,<br>Flight Smart Team</p>
    </div>
  `;

	return sendEmail(airline.email, subject, text, html);
};

// send booking confirmation email
const sendBookingConfirmationEmail = async (user, booking) => {
	const subject = 'Flight Smart - Booking Confirmation';

	// Format date and time (to look formal in email)
	const formatDateTime = (date) => {
		return new Date(date).toLocaleString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	const html = `
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
			<h2 style="color: #2c3e50;">Booking Confirmation</h2>
			<p>Hello</p>
			<p>Thank you for booking with Flight Smart! Your booking has been confirmed.</p>
			
			<div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
				<h3 style="color: #2c3e50;">Booking Details</h3>
				<p><strong>Booking ID:</strong> ${booking._id}</p>
				<p><strong>Total Amount:</strong> ${booking.bookingPrice}</p>
				<p><strong>Booking Date:</strong> ${formatDateTime(booking.createdAt)}</p>
			</div>

			<p style="margin-top: 30px;">If you have any questions or need to make changes to your booking, please contact our customer support.</p>
			
			<p>Best regards,<br>Flight Smart Team</p>
		</div>
	`;

	const text = `Booking Confirmation\n\n
		Hello,\n\n
		Thank you for booking with Flight Smart! Your booking has been confirmed.\n\n
		Booking ID: ${booking._id}\n
		Total Amount: ${booking.bookingPrice}\n
		Booking Date: ${formatDateTime(booking.createdAt)}\n\n
		Please check your booking details in your Flight Smart account.\n\n
		Best regards,\n
		Flight Smart Team`;

	return sendEmail(user.email, subject, text, html);
};

module.exports = {
	sendEmail,
	sendAirlinePasswordEmail,
	sendAirlineDeletionEmail,
	sendBookingConfirmationEmail,
};