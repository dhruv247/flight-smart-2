import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import { sendBookingConfirmationEmail } from '../utils/emailUtils.js';

dotenv.config();

// Check for required environment variables
if (!process.env.AWS_BUCKET_REGION) {
	console.error('ERROR: AWS_BUCKET_REGION environment variable is not set');
	process.exit(1);
}

if (!process.env.SQS_EMAIL_QUEUE_URL) {
	console.error('ERROR: SQS_EMAIL_QUEUE_URL environment variable is not set');
	process.exit(1);
}

if (!process.env.AWS_ACCESS_KEY || !process.env.AWS_SECRET_KEY) {
	console.error('ERROR: AWS credentials are not set in environment variables');
	process.exit(1);
}

// Configure AWS SDK with region
AWS.config.update({
	region: process.env.AWS_BUCKET_REGION,
	accessKeyId: process.env.AWS_ACCESS_KEY,
	secretAccessKey: process.env.AWS_SECRET_KEY,
});

// Create SQS service object
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

/**
 * Process a message from the SQS queue
 * @param {Object} message - The SQS message
 */
const processMessage = async (message) => {
	try {
		const body = JSON.parse(message.Body);

		// Depending on message type, call different email functions
		const messageType = message.MessageAttributes?.MessageType?.StringValue;

		if (messageType === 'BookingConfirmation') {
			console.log(
				`Processing booking confirmation email for booking: ${body.booking._id}`
			);
			await sendBookingConfirmationEmail(body.user, body.booking);
			console.log(`Email sent successfully for booking: ${body.booking._id}`);
		} else {
			console.warn(`Unknown message type: ${messageType}`);
		}

		await sqs
			.deleteMessage({
				QueueUrl: process.env.SQS_EMAIL_QUEUE_URL,
				ReceiptHandle: message.ReceiptHandle,
			})
			.promise();

		console.log(`Message deleted from queue: ${message.MessageId}`);
	} catch (error) {
		console.error('Error processing message:', error);
	}
};

/**
 * Poll SQS queue for messages
 */
const pollQueue = async () => {
	try {
		const params = {
			QueueUrl: process.env.SQS_EMAIL_QUEUE_URL,
			MaxNumberOfMessages: 10,
			WaitTimeSeconds: 20,
			MessageAttributeNames: ['All'],
		};

		const data = await sqs.receiveMessage(params).promise();

		if (data.Messages) {
			console.log(`Received ${data.Messages.length} messages`);

			// Process each message
			for (const message of data.Messages) {
				await processMessage(message);
			}
		}
	} catch (error) {
		console.error('Error polling queue:', error);
	}

	// Continue polling
	setTimeout(pollQueue, 1000);
};

// Start polling
console.log('Email worker started');
pollQueue();