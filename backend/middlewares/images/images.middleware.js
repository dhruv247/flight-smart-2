const AWS = require('aws-sdk');

AWS.config.update({
	accessKeyId: process.env.AWS_ACCESS_KEY,
	secretAccessKey: process.env.AWS_SECRET_KEY,
	region: process.env.AWS_BUCKET_REGION, // e.g., 'us-east-1'
});

const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = new AWS.S3();

const upload = multer({
	storage: multerS3({
		s3: s3,
		bucket: process.env.AWS_BUCKET_NAME,
		acl: 'public-read', // or 'private'
		metadata: (req, file, cb) => {
			cb(null, { fieldName: file.fieldname });
		},
		contentType: multerS3.AUTO_CONTENT_TYPE,
		key: (req, file, cb) => {
			cb(null, `${Date.now().toString()}-${file.originalname}`);
		},
	}),
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB limit
	},
	fileFilter: (req, file, cb) => {
		// Accept only images
		if (file.mimetype.startsWith('image/')) {
			cb(null, true);
		} else {
			cb(new Error('Not an image! Please upload an image file.'), false);
		}
	},
});

module.exports = upload;
