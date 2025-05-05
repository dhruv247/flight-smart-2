const express = require('express');
const router = express.Router();
const upload = require('../../middlewares/images/images.middleware');
const { uploadImage } = require('../../controllers/images/imagesController');

router.post('/upload', upload.single('image'), uploadImage);

module.exports = router;
