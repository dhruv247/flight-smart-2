import React, { useState } from 'react';
import axios from 'axios';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

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
				'http://localhost:8000/api/user/auth/update-password',
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

	if (!isOpen) return null;

	return (
		<div
			className="modal show d-block"
			tabIndex="-1"
			style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
		>
			<div className="modal-dialog modal-dialog-centered">
				<div className="modal-content">
					<div className="modal-header border-bottom">
						<h5 className="modal-title">Change Password</h5>
						<button
							type="button"
							className="btn-close"
							onClick={onClose}
						></button>
					</div>
					<div className="modal-body p-4">
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
							<div className="modal-footer border-top">
								<button
									type="button"
									className="btn btn-secondary"
									onClick={onClose}
								>
									Cancel
								</button>
								<button type="submit" className="btn btn-primary">
									Update Password
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ChangePasswordModal;
