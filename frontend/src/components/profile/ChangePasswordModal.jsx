import React, { useState } from 'react';
import axios from 'axios';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import Modal from '../common/Modal';

const ChangePasswordModal = ({ isOpen, onClose }) => {
	const [formData, setFormData] = useState({
		oldPassword: '',
		newPassword: '',
		confirmPassword: '',
	});

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Validate passwords match
		if (formData.newPassword !== formData.confirmPassword) {
			showErrorToast('New passwords do not match');
			return;
		}

		try {
			await axios.patch(
				'http://localhost:8000/api/auth/update-password',
				{
					oldPassword: formData.oldPassword,
					newPassword: formData.newPassword,
				},
				{ withCredentials: true }
			);
			showSuccessToast('Password updated successfully');
			setFormData({
				oldPassword: '',
				newPassword: '',
				confirmPassword: '',
			});
			onClose();
		} catch (error) {
			if (error.response) {
				showErrorToast('Error: ' + error.response.data.message);
			} else {
				showErrorToast(error.message);
			}
		}
	};

	const modalContent = (
		<form onSubmit={handleSubmit}>
			<div className="mb-3">
				<label htmlFor="oldPassword" className="form-label">
					Current Password
				</label>
				<input
					type="password"
					className="form-control"
					id="oldPassword"
					name="oldPassword"
					value={formData.oldPassword}
					onChange={handleChange}
					required
				/>
			</div>
			<div className="mb-3">
				<label htmlFor="newPassword" className="form-label">
					New Password
				</label>
				<input
					type="password"
					className="form-control"
					id="newPassword"
					name="newPassword"
					value={formData.newPassword}
					onChange={handleChange}
					required
				/>
			</div>
			<div className="mb-3">
				<label htmlFor="confirmPassword" className="form-label">
					Confirm New Password
				</label>
				<input
					type="password"
					className="form-control"
					id="confirmPassword"
					name="confirmPassword"
					value={formData.confirmPassword}
					onChange={handleChange}
					required
				/>
			</div>
		</form>
	);

	const modalFooter = (
		<>
			<button type="button" className="btn btn-secondary" onClick={onClose}>
				Cancel
			</button>
			<button
				type="submit"
				className="btn btn-primary"
				form="changePasswordForm"
			>
				Update Password
			</button>
		</>
	);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Change Password"
			footer={modalFooter}
		>
			{modalContent}
		</Modal>
	);
};

export default ChangePasswordModal;
