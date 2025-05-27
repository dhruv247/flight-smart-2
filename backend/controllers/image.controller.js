/**
 * Upload an image
 * @param {*} req
 * @param {*} res
 * @returns {Object} message
 */
const uploadImage = (req, res) => {
	try {

		// validate file
		if (!req.file) {
			return res.status(400).json({
				message: 'No file uploaded',
			});
		}

		// return success message
		return res.status(200).json({
			message: 'Image uploaded successfully',
			url: req.file.location,
		});
	} catch (error) {
		return res.status(500).json({
			message: "Failed to upload image. Please try again later.",
		});
	}
};

export { uploadImage };