exports.uploadImage = (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({
				success: false,
				message: 'No file uploaded',
			});
		}

		res.status(200).json({
			success: true,
			message: 'Image uploaded successfully',
			url: req.file.location,
		});
	} catch (error) {
		// console.error('Upload error:', error);
		res.status(500).json({
			success: false,
			message: 'Error uploading image',
			error: error.message,
		});
	}
};