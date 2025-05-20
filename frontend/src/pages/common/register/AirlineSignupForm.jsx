import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { showSuccessToast, showErrorToast } from '../../../utils/toast';
import { useNavigate } from 'react-router-dom';

const AirlineSignupForm = () => {
	const navigate = useNavigate();

	const [profilePicture, setProfilePicture] = useState('');
	const [isImageUploading, setIsImageUploading] = useState(false);
	const [confirmPassword, setConfirmPassword] = useState('');
	const [isFormValid, setIsFormValid] = useState(false);

	const [formData, setFormData] = useState({
		email: '',
		username: '',
		password: '',
		userType: 'airline',
		profilePicture: '',
	});

	useEffect(() => {
		// Check if all required fields are filled
		const isEmailValid = formData.email.trim() !== '';
		const isUsernameValid = formData.username.trim() !== '';
		const isPasswordValid = formData.password.trim() !== '';
		const isConfirmPasswordValid = confirmPassword.trim() !== '';
		const isProfilePictureValid = formData.profilePicture.trim() !== '';

		setIsFormValid(
			isEmailValid &&
				isUsernameValid &&
				isPasswordValid &&
				isConfirmPasswordValid &&
				isProfilePictureValid &&
				!isImageUploading
		);
	}, [
		formData.email,
		formData.username,
		formData.password,
		formData.profilePicture,
		confirmPassword,
		isImageUploading,
	]);

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleConfirmPasswordChange = (e) => {
		setConfirmPassword(e.target.value);
	};

	const handleFileChange = async (e) => {
		const file = e.target.files[0];
		if (!file) return;

		setIsImageUploading(true);
		const formData = new FormData();
		formData.append('image', file);

		try {
			const response = await axios.post(
				'http://localhost:8000/api/images/upload-image',
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				}
			);

			setProfilePicture(response.data.url);
			setFormData((prevData) => ({
				...prevData,
				profilePicture: response.data.url,
			}));
		} catch (error) {
			showErrorToast('Error uploading profile picture');
			setProfilePicture('');
			setFormData((prevData) => ({
				...prevData,
				profilePicture: '',
			}));
		} finally {
			setIsImageUploading(false);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Check if image is still uploading
		if (isImageUploading) {
			showErrorToast('Please wait for the image to finish uploading');
			return;
		}

		try {
			if (confirmPassword !== formData.password) {
				showErrorToast('Passwords must match to register user!');
				return;
			}

			const res = await axios.post(
				'http://localhost:8000/api/auth/register',
				formData,
				{
					withCredentials: true,
				}
			);
			showSuccessToast(
				'Registration Request Sent! Please wait for response from site admin.'
			);
			navigate('/login');
		} catch (error) {
			if (
				error.response &&
				error.response.data &&
				error.response.data.message
			) {
				showErrorToast(error.response.data.message);
			} else {
				showErrorToast('An unexpected error occurred. Please try again.');
			}
		}
	};

	return (
		<form id="registrationForm" onSubmit={handleSubmit} className="mt-3">
			{/* Email Input */}
			<div className="row mb-3">
				<div className="col-1 col-md-4"></div>
				<div className="col-10 col-md-4">
					<input
						type="email"
						className="form-control"
						name="email"
						id="email"
						placeholder="Email"
						required
						onChange={handleChange}
					/>
				</div>
				<div className="col-1 col-md-4"></div>
			</div>
			{/* Airline Name Input */}
			<div className="row mb-3">
				<div className="col-1 col-md-4"></div>
				<div className="col-10 col-md-4">
					<input
						type="text"
						className="form-control"
						name="username"
						id="username"
						placeholder="Airline Name"
						required
						onChange={handleChange}
					/>
				</div>
				<div className="col-1 col-md-4"></div>
			</div>
			{/* Profile Picture Input */}
			<div className="row mb-3">
				<div className="col-1 col-md-4"></div>
				<div className="col-10 col-md-4">
					<div className="d-flex flex-column border p-2 rounded">
						<label htmlFor="profilePicture" className="form-label text-muted text-start">
							Airline Logo
						</label>
						<input
							type="file"
							className="form-control"
							name="profilePicture"
							id="profilePicture"
							placeholder="Airline Logo"
							onChange={handleFileChange}
							disabled={isImageUploading}
							required
						/>
						{isImageUploading && (
							<div className="ms-2">
								<div
									className="spinner-border spinner-border-sm text-primary"
									role="status"
								>
									<span className="visually-hidden">Loading...</span>
								</div>
							</div>
						)}
					</div>
				</div>
				<div className="col-1 col-md-4"></div>
			</div>
			{/* Password Instructions */}
			<div className="row mb-3">
				<div className="col-1 col-md-4"></div>
				<div className="col-10 col-md-4">
					<div className="text-start text-muted small">
						Password must contain:
						<ul>
							<li>At least 8 characters</li>
							<li>One uppercase letter</li>
							<li>One lowercase letter</li>
							<li>One number</li>
							<li>One special character (@$!%*?&)</li>
						</ul>
					</div>
				</div>
				<div className="col-1 col-md-4"></div>
			</div>
			{/* Password Input */}
			<div className="row mb-3">
				<div className="col-1 col-md-4"></div>
				<div className="col-10 col-md-4">
					<input
						type="password"
						name="password"
						id="password"
						className="form-control"
						placeholder="Password"
						required
						onChange={handleChange}
					/>
				</div>
				<div className="col-1 col-md-4"></div>
			</div>
			{/* Confirm Password Input */}
			<div className="row mb-3">
				<div className="col-1 col-md-4"></div>
				<div className="col-10 col-md-4">
					<input
						type="password"
						name="confirmPassword"
						id="confirmPassword"
						className="form-control"
						placeholder="Re-Enter Password"
						required
						onChange={handleConfirmPasswordChange}
					/>
				</div>
				<div className="col-1 col-md-4"></div>
			</div>
			{/* Register Button */}
			<div className="row mb-3">
				<div className="col-1 col-md-4"></div>
				<div className="col-10 col-md-4">
					<button
						type="submit"
						className="form-control btn btn-primary"
						disabled={!isFormValid}
					>
						{isImageUploading ? 'Uploading Image...' : 'Register'}
					</button>
				</div>
				<div className="col-1 col-md-4"></div>
			</div>
		</form>
	);
};

export default AirlineSignupForm;
