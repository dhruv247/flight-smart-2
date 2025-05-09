import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Create a transporter
 */
const transporter = nodemailer.createTransport({
	service: process.env.EMAIL_SERVICE || 'gmail',
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASSWORD,
	},
});

/**
 * Send email
 * @param {string} to - The email address of the recipient
 * @param {string} subject - The subject of the email
 * @param {string} text - The text of the email
 * @param {string} html - The HTML of the email
 */
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
		return info;
	} catch (error) {
		console.error('Error sending email:', error.message);
		throw error;
	}
};

/**
 * Send airline verification email
 * @param {object} airline - The airline object
 * @returns {Promise<object>} - The email info
 */
const sendAirlineVerificationEmail = async (airline) => {
	const subject = 'Flight Smart - Airline Verification';
	const text = `Hello ${airline.username},\n\nWe are pleased to inform you that your registration request for Flight Smart has been approved.\n\nPlease proceed to the login page to access your account.\n\nBest regards,\nFlight Smart Team`;

	const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Flight Smart - Airline Verification</h2>
      <p>Hello ${airline.username},</p>
      <p>We are pleased to inform you that your registration request for Flight Smart has been approved.</p>	
      <p>Please proceed to the login page to access your account.</p>
      <p>Best regards,<br>Flight Smart Team</p>
    </div>
  `;

	return sendEmail(airline.email, subject, text, html);
};

/**
 * Send airline deletion email
 * @param {object} airline - The airline object
 * @returns {Promise<object>} - The email info
 */
const sendAirlineDeletionEmail = async (airline) => {
	const subject = 'Flight Smart Registration Request Denied';
	const text = `Hello ${airline.username},\n\nWe regret to inform you that your registration request for Flight Smart has been denied by our administrators.\n\nIf you believe this was a mistake or would like to reapply, please contact our support team.\n\nBest regards,\nFlight Smart Team`;

	const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Flight Smart Registration Request Denied</h2>
      <p>Hello ${airline.username},</p>
      <p>We regret to inform you that your registration request for Flight Smart has been denied by our administrators.</p>
      <p>If you believe this was a mistake, please try to register again.</p>
      <p>Best regards,<br>Flight Smart Team</p>
    </div>
  `;

	return sendEmail(airline.email, subject, text, html);
};

/**
 * Send booking confirmation email
 * @param {object} user - The user object
 * @param {object} booking - The booking object
 * @returns {Promise<object>} - The email info
 */
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
			<p>Please check your booking details in your Flight Smart Dashboard.</p>
			
			<div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
				<h3 style="color: #2c3e50;">Booking Details</h3>
				<p><strong>Booking ID:</strong> ${booking._id}</p>
				<p><strong>Total Amount:</strong> ₹${booking.bookingPrice}</p>
				<p><strong>Booking Date:</strong> ${formatDateTime(booking.createdAt)}</p>
			</div>
			
			<p>Best regards,<br>Flight Smart Team</p>
		</div>
	`;

	const text = `Booking Confirmation\n\n
		Hello,\n\n
		Thank you for booking with Flight Smart! Your booking has been confirmed.\n\n
		Please check your booking details in your Flight Smart Dashboard.\n\n
		Booking ID: ${booking._id}\n
		Total Amount: ${booking.bookingPrice}\n
		Booking Date: ${formatDateTime(booking.createdAt)}\n\n
		Best regards,\n
		Flight Smart Team`;

	return sendEmail(user.email, subject, text, html);
};

export {
	sendAirlineDeletionEmail,
	sendBookingConfirmationEmail,
	sendAirlineVerificationEmail,
};