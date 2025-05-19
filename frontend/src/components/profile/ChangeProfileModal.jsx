import React, { useState } from 'react';
import axios from 'axios';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import Modal from '../common/Modal';

const ChangeProfileModal = ({ isOpen, onClose }) => {
	const [selectedImage, setSelectedImage] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setSelectedImage(file);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!selectedImage) {
			showErrorToast('Please select an image');
			return;
		}

		setIsSubmitting(true);
		try {
			// First upload the image
			const formData = new FormData();
			formData.append('image', selectedImage);

			const imageURLResponse = await axios.post(
				'http://localhost:8000/api/images/upload-image',
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				}
			);

			if (!imageURLResponse.data.url) {
				throw new Error(
					imageURLResponse.data.message || 'Failed to upload image'
				);
			}

			const imageUrl = imageURLResponse.data.url;

			// Then update the user's profile picture
			await axios.patch(
				'http://localhost:8000/api/auth/update-profile-picture',
				{ profilePicture: imageUrl },
				{ withCredentials: true }
			);

			showSuccessToast('Profile picture updated successfully');
			setSelectedImage(null);
			onClose();
		} catch (error) {
			showErrorToast(error.response?.data?.message || error.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const modalContent = (
		<form onSubmit={handleSubmit}>
			<div className="mb-4">
				<label htmlFor="profilePicture" className="form-label">
					Select Image
				</label>
				<input
					type="file"
					className="form-control"
					id="profilePicture"
					accept="image/*"
					onChange={handleImageChange}
					required
				/>
			</div>
		</form>
	);

	const modalFooter = (
		<>
			<button
				type="button"
				className="btn btn-secondary"
				onClick={onClose}
				disabled={isSubmitting}
			>
				Cancel
			</button>
			<button
				type="submit"
				className="btn btn-primary"
				disabled={isSubmitting}
				form="changeProfileForm"
			>
				{isSubmitting ? (
					<>
						<span
							className="spinner-border spinner-border-sm me-2"
							role="status"
							aria-hidden="true"
						></span>
						Updating...
					</>
				) : (
					'Update Profile Picture'
				)}
			</button>
		</>
	);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Change Profile Picture"
			footer={modalFooter}
		>
			{modalContent}
		</Modal>
	);
};

export default ChangeProfileModal;
