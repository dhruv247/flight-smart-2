import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Configure AWS SDK
AWS.config.update({
	region: process.env.AWS_BUCKET_REGION,
	accessKeyId: process.env.AWS_ACCESS_KEY,
	secretAccessKey: process.env.AWS_SECRET_KEY,
});

// Create SQS service object
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

/**
 * Send a message to SQS queue
 * @param {Object} messageBody - The message body to send
 * @returns {Promise} - The result of the send operation
 */
export const sendToEmailQueue = async (messageBody) => {
	const params = {
		MessageBody: JSON.stringify(messageBody),
		QueueUrl: process.env.SQS_EMAIL_QUEUE_URL,
		MessageAttributes: {
			MessageType: {
				DataType: 'String',
				StringValue: 'BookingConfirmation',
			},
		},
	};

	try {
		const result = await sqs.sendMessage(params).promise();
		console.log('Message sent to SQS queue:', result.MessageId);
		return result;
	} catch (error) {
		console.error('Error sending message to SQS:', error);
		throw error;
	}
};

/**
 * Check that the email queue exists
 */
export const setupQueues = async () => {
	try {
		// Check if queue exists
		const queueName = 'booking-emails';
		const queueData = await sqs.getQueueUrl({ QueueName: queueName }).promise();
		console.log(`Queue already exists: ${queueData.QueueUrl}`);
	} catch (error) {
		console.error('Error: Queue does not exist!', error);
	}
};
