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
 * send email
 * @param {*} to 
 * @param {*} subject 
 * @param {*} text 
 * @param {*} html 
 * @returns 
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
 * @param {*} airline 
 * @returns 
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
 * @param {*} airline 
 * @returns 
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
 * @param {*} booking 
 * @returns 
 */
const sendBookingConfirmationEmail = async (booking) => {
	const subject = 'Flight Smart - Booking Confirmation';

	const formatDateTime = (dateTime) => {
		const date = new Date(dateTime);
		return {
			time: date.toLocaleTimeString('en-US', {
				hour: '2-digit',
				minute: '2-digit',
				hour12: false,
			}),
			date: date
				.toLocaleDateString('en-US', {
					year: 'numeric',
					month: '2-digit',
					day: '2-digit',
				})
				.replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2'),
		};
	};

	const html = `
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
			<h2 style="color: #2c3e50;">Booking Confirmation</h2>
			<p>Hello ${booking.userDetails.username},</p>
			<p>Thank you for booking with Flight Smart! Your booking has been confirmed.</p>
			
			<!-- User Information -->
			<div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
				<h3 style="color: #2c3e50;">User Information</h3>
				<div style="margin-bottom: 10px;">
					<strong>Username:</strong> ${booking.userDetails.username}
				</div>
				<div>
					<strong>Email:</strong> ${booking.userDetails.email}
				</div>
			</div>

			<!-- Flight Information -->
			<div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
				<h3 style="color: #2c3e50;">Flight Information</h3>
				
				<!-- Departure Flight -->
				<div style="margin-bottom: 20px;">
					<h4 style="color: #2c3e50;">Departure Flight</h4>
					<div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
						<div>
							<div style="font-size: 16px; font-weight: 500;">
								${booking.tickets[0].departureFlight.departureAirport.airportName}<br>
								(${booking.tickets[0].departureFlight.departureAirport.airportCode})<br>
								${booking.tickets[0].departureFlight.departureAirport.city}
							</div>
							<div style="color: #6c757d; margin-top: 10px;">
								${formatDateTime(booking.tickets[0].departureFlight.departureDateTime).date}
							</div>
							<div style="color: #6c757d;">
								${formatDateTime(booking.tickets[0].departureFlight.departureDateTime).time}
							</div>
						</div>
						<div style="text-align: center; padding: 0 15px;">
							✈️
						</div>
						<div style="text-align: right;">
							<div style="font-size: 16px; font-weight: 500;">
								${booking.tickets[0].departureFlight.arrivalAirport.airportName}<br>
								(${booking.tickets[0].departureFlight.arrivalAirport.airportCode})<br>
								${booking.tickets[0].departureFlight.arrivalAirport.city}
							</div>
							<div style="color: #6c757d; margin-top: 10px;">
								${formatDateTime(booking.tickets[0].departureFlight.arrivalDateTime).date}
							</div>
							<div style="color: #6c757d;">
								${formatDateTime(booking.tickets[0].departureFlight.arrivalDateTime).time}
							</div>
						</div>
					</div>
					<div style="margin-top: 10px; text-align: center;">
						<strong>Airline:</strong> ${
							booking.tickets[0].departureFlight.airline.airlineName
						} | 
						<strong>Flight:</strong> ${booking.tickets[0].departureFlight.flightNo} | 
						<strong>Plane:</strong> ${booking.tickets[0].departureFlight.plane} | 
						<strong>Duration:</strong> ${Math.floor(
							booking.tickets[0].departureFlight.duration / 60
						)}:${(booking.tickets[0].departureFlight.duration % 60)
		.toString()
		.padStart(2, '0')} hr
					</div>
				</div>

				${
					booking.tickets[0].returnFlight
						? `
				<!-- Return Flight -->
				<hr style="margin: 20px 0;">
				<div style="margin-bottom: 20px;">
					<h4 style="color: #2c3e50;">Return Flight</h4>
					<div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
						<div>
							<div style="font-size: 16px; font-weight: 500;">
								${booking.tickets[0].returnFlight.departureAirport.airportName}<br>
								(${booking.tickets[0].returnFlight.departureAirport.airportCode})<br>
								${booking.tickets[0].returnFlight.departureAirport.city}
							</div>
							<div style="color: #6c757d; margin-top: 10px;">
								${formatDateTime(booking.tickets[0].returnFlight.departureDateTime).date}
							</div>
							<div style="color: #6c757d;">
								${formatDateTime(booking.tickets[0].returnFlight.departureDateTime).time}
							</div>
						</div>
						<div style="text-align: center; padding: 0 15px;">
							✈️
						</div>
						<div style="text-align: right;">
							<div style="font-size: 16px; font-weight: 500;">
								${booking.tickets[0].returnFlight.arrivalAirport.airportName}<br>
								(${booking.tickets[0].returnFlight.arrivalAirport.airportCode})<br>
								${booking.tickets[0].returnFlight.arrivalAirport.city}
							</div>
							<div style="color: #6c757d; margin-top: 10px;">
								${formatDateTime(booking.tickets[0].returnFlight.arrivalDateTime).date}
							</div>
							<div style="color: #6c757d;">
								${formatDateTime(booking.tickets[0].returnFlight.arrivalDateTime).time}
							</div>
						</div>
					</div>
					<div style="margin-top: 10px; text-align: center;">
						<strong>Airline:</strong> ${
							booking.tickets[0].returnFlight.airline.airlineName
						} | 
						<strong>Flight:</strong> ${booking.tickets[0].returnFlight.flightNo} | 
						<strong>Plane:</strong> ${booking.tickets[0].returnFlight.plane} | 
						<strong>Duration:</strong> ${Math.floor(
							booking.tickets[0].returnFlight.duration / 60
						)}:${(booking.tickets[0].returnFlight.duration % 60)
								.toString()
								.padStart(2, '0')} hr
					</div>
				</div>
				`
						: ''
				}
			</div>

			<!-- Tickets Information -->
			<div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
				<h3 style="color: #2c3e50;">Tickets</h3>
				<table style="width: 100%; border-collapse: collapse;">
					<thead>
						<tr style="border-bottom: 1px solid #dee2e6;">
							<th style="text-align: left; padding: 8px;">Passenger</th>
							<th style="text-align: left; padding: 8px;">DOB</th>
							<th style="text-align: left; padding: 8px;">Seat Type</th>
							<th style="text-align: left; padding: 8px;">Departure Seat</th>
							<th style="text-align: left; padding: 8px;">Return Seat</th>
							<th style="text-align: left; padding: 8px;">Price</th>
						</tr>
					</thead>
					<tbody>
						${booking.tickets
							.map(
								(ticket) => `
							<tr style="border-bottom: 1px solid #dee2e6;">
								<td style="padding: 8px;">${ticket.nameOfFlyer}</td>
								<td style="padding: 8px;">${ticket.dateOfBirth}</td>
								<td style="padding: 8px;">${
									ticket.seatType === 'business' ? 'Business' : 'Economy'
								}</td>
								<td style="padding: 8px;">${ticket.departureFlightSeatNumber}</td>
								<td style="padding: 8px;">${ticket.returnFlightSeatNumber || '-'}</td>
								<td style="padding: 8px;">₹${ticket.ticketPrice}</td>
							</tr>
						`
							)
							.join('')}
					</tbody>
				</table>
			</div>

			<!-- Booking Information -->
			<div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
				<h3 style="color: #2c3e50;">Booking Information</h3>
				<div style="margin-bottom: 10px;">
					<strong>PNR:</strong> ${booking.pnr}
				</div>
				<div style="margin-bottom: 10px;">
					<strong>Status:</strong> 
					<span style="background-color: #28a745; color: white; padding: 2px 8px; border-radius: 4px;">
						Confirmed
					</span>
				</div>
				<div style="margin-bottom: 10px;">
					<strong>Booked On:</strong> ${booking.createdAt.split('T')[0]}
				</div>
				<div style="margin-bottom: 10px;">
					<strong>Total Passengers:</strong> ${booking.tickets.length}
				</div>
				<div>
					<strong>Total Amount:</strong> ₹${booking.tickets.reduce(
						(sum, ticket) => sum + ticket.ticketPrice,
						0
					)}
				</div>
			</div>
			
			<p>Best regards,<br>Flight Smart Team</p>
		</div>
	`;

	const text = `Booking Confirmation\n\n
		Hello ${booking.userDetails.username},\n\n
		Thank you for booking with Flight Smart! Your booking has been confirmed.\n\n
		User Information:\n
		Username: ${booking.userDetails.username}
		Email: ${booking.userDetails.email}\n\n
		Flight Information:\n
		Departure Flight:\n
		From: ${booking.tickets[0].departureFlight.departureAirport.airportName} (${
		booking.tickets[0].departureFlight.departureAirport.airportCode
	})
		To: ${booking.tickets[0].departureFlight.arrivalAirport.airportName} (${
		booking.tickets[0].departureFlight.arrivalAirport.airportCode
	})
		Date: ${
			formatDateTime(booking.tickets[0].departureFlight.departureDateTime).date
		}
		Time: ${
			formatDateTime(booking.tickets[0].departureFlight.departureDateTime).time
		} - ${
		formatDateTime(booking.tickets[0].departureFlight.arrivalDateTime).time
	}
		Airline: ${booking.tickets[0].departureFlight.airline.airlineName}
		Flight: ${booking.tickets[0].departureFlight.flightNo}
		Plane: ${booking.tickets[0].departureFlight.plane}
		Duration: ${Math.floor(booking.tickets[0].departureFlight.duration / 60)}:${(
		booking.tickets[0].departureFlight.duration % 60
	)
		.toString()
		.padStart(2, '0')} hr\n
		${
			booking.tickets[0].returnFlight
				? `
		Return Flight:\n
		From: ${booking.tickets[0].returnFlight.departureAirport.airportName} (${
						booking.tickets[0].returnFlight.departureAirport.airportCode
				  })
		To: ${booking.tickets[0].returnFlight.arrivalAirport.airportName} (${
						booking.tickets[0].returnFlight.arrivalAirport.airportCode
				  })
		Date: ${formatDateTime(booking.tickets[0].returnFlight.departureDateTime).date}
		Time: ${
			formatDateTime(booking.tickets[0].returnFlight.departureDateTime).time
		} - ${formatDateTime(booking.tickets[0].returnFlight.arrivalDateTime).time}
		Airline: ${booking.tickets[0].returnFlight.airline.airlineName}
		Flight: ${booking.tickets[0].returnFlight.flightNo}
		Plane: ${booking.tickets[0].returnFlight.plane}
		Duration: ${Math.floor(booking.tickets[0].returnFlight.duration / 60)}:${(
						booking.tickets[0].returnFlight.duration % 60
				  )
						.toString()
						.padStart(2, '0')} hr\n
		`
				: ''
		}
		Tickets:\n
		${booking.tickets
			.map(
				(ticket) => `
		Passenger: ${ticket.nameOfFlyer}
		DOB: ${ticket.dateOfBirth}
		Seat Type: ${ticket.seatType === 'business' ? 'Business' : 'Economy'}
		Departure Seat: ${ticket.departureFlightSeatNumber}
		Return Seat: ${ticket.returnFlightSeatNumber || '-'}
		Price: ₹${ticket.ticketPrice}\n
		`
			)
			.join('')}
		Booking Information:\n
		PNR: ${booking.pnr}
		Status: Confirmed
		Booked On: ${booking.createdAt.split('T')[0]}
		Total Passengers: ${booking.tickets.length}
		Total Amount: ₹${booking.tickets.reduce(
			(sum, ticket) => sum + ticket.ticketPrice,
			0
		)}\n
		Best regards,\n
		Flight Smart Team`;

	return sendEmail(booking.userDetails.email, subject, text, html);
};

/**
 * Send booking cancellation email
 * @param {*} booking 
 * @returns 
 */
const sendBookingCancellationEmail = async (booking) => {
	const subject = 'Flight Smart - Booking Cancellation';

	const html = `
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
			<h2 style="color: #2c3e50;">Booking Cancellation</h2>
			<p>Hello ${booking.userDetails.username},</p>
			<p>Your booking <strong>${booking.pnr}</strong> has been cancelled successfully. If this was an error, please contact the airline through the chat</p>
			<p>Best regards,<br>Flight Smart Team</p>
		</div>
	`;

	const text = `Hello ${
		booking.userDetails.username
	},\n\nYour booking ${booking.pnr} has been cancelled successfully.\n\nBest regards,\nFlight Smart Team`;

	return sendEmail(booking.userDetails.email, subject, text, html);
};

export {
	sendAirlineDeletionEmail,
	sendBookingConfirmationEmail,
	sendAirlineVerificationEmail,
	sendBookingCancellationEmail,
};
