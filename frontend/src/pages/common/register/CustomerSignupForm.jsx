import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showSuccessToast, showErrorToast } from '../../../utils/toast';
import { Link } from 'react-router-dom';
import { imageService } from '../../../services/image.service';
import { authService } from '../../../services/auth.service';

const CustomerSignupForm = () => {
	const navigate = useNavigate();

	const [profilePicture, setProfilePicture] = useState('https://flight-smart-1-images.s3.amazonaws.com/1746975947571-default.jpeg');
	const [isImageUploading, setIsImageUploading] = useState(false);
	const [confirmPassword, setConfirmPassword] = useState('');
	const [isFormValid, setIsFormValid] = useState(false);
	const [formData, setFormData] = useState({
		email: '',
		username: '',
		password: '',
		userType: 'customer',
		profilePicture: 'https://flight-smart-1-images.s3.amazonaws.com/1746975947571-default.jpeg',
	});

	useEffect(() => {
		// Check if all required fields are filled
		const isEmailValid = formData.email.trim() !== '';
		const isUsernameValid = formData.username.trim() !== '';
		const isPasswordValid = formData.password.trim() !== '';
		const isConfirmPasswordValid = confirmPassword.trim() !== '';

		setIsFormValid(
			isEmailValid &&
				isUsernameValid &&
				isPasswordValid &&
				isConfirmPasswordValid &&
				!isImageUploading
		);
	}, [
		formData.email,
		formData.username,
		formData.password,
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
			const response = await imageService.uploadImage(
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

			const res = await authService.register(formData);
			showSuccessToast('Registration successful!');
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
		<div className="d-flex justify-content-center align-items-center">
			<div
				className="card shadow-lg border-0"
				style={{ width: '800px', background: '#f8f9fa' }}
			>
				<div
					className="card-header bg-primary text-white d-flex align-items-center justify-content-center"
					style={{
						borderTopLeftRadius: '0.5rem',
						borderTopRightRadius: '0.5rem',
					}}
				>
					<i className="bi bi-person-plus-fill me-2 fs-4"></i>
					<h4 className="mb-0">Customer Signup</h4>
				</div>
				<div className="card-body p-4">
					<form id="registrationForm" onSubmit={handleSubmit}>
						<div className="row g-4">
							{/* Email Input */}
							<div className="col-md-4">
								<label className="form-label fw-semibold">Email</label>
								<div className="d-flex align-items-center gap-2 bg-light rounded p-2">
									<i className="bi bi-envelope-fill text-primary"></i>
									<input
										type="email"
										className="form-control bg-white border-0"
										name="email"
										id="email"
										placeholder="Enter your email"
										required
										onChange={handleChange}
									/>
								</div>
							</div>

							{/* Username Input */}
							<div className="col-md-4">
								<label className="form-label fw-semibold">Username</label>
								<div className="d-flex align-items-center gap-2 bg-light rounded p-2">
									<i className="bi bi-person-fill text-primary"></i>
									<input
										type="text"
										className="form-control bg-white border-0"
										name="username"
										id="username"
										placeholder="Enter your username"
										required
										onChange={handleChange}
									/>
								</div>
							</div>

							{/* Profile Picture Input */}
							<div className="col-md-4">
								<label className="form-label fw-semibold">
									Profile Picture
								</label>
								<div className="d-flex align-items-center gap-2 bg-light rounded p-2">
									<i className="bi bi-image-fill text-primary"></i>
									<input
										type="file"
										className="form-control bg-white border-0"
										name="profilePicture"
										id="profilePicture"
										onChange={handleFileChange}
										disabled={isImageUploading}
									/>
									{isImageUploading && (
										<div
											className="spinner-border spinner-border-sm text-primary"
											role="status"
										>
											<span className="visually-hidden">Loading...</span>
										</div>
									)}
								</div>
							</div>

							{/* Password Input */}
							<div className="col-md-6">
								<label className="form-label fw-semibold">Password</label>
								<div className="d-flex align-items-center gap-2 bg-light rounded p-2">
									<i className="bi bi-lock-fill text-primary"></i>
									<input
										type="password"
										name="password"
										id="password"
										className="form-control bg-white border-0"
										placeholder="Enter your password"
										required
										onChange={handleChange}
									/>
								</div>
							</div>

							{/* Confirm Password Input */}
							<div className="col-md-6">
								<label className="form-label fw-semibold">
									Confirm Password
								</label>
								<div className="d-flex align-items-center gap-2 bg-light rounded p-2">
									<i className="bi bi-lock-fill text-primary"></i>
									<input
										type="password"
										name="confirmPassword"
										id="confirmPassword"
										className="form-control bg-white border-0"
										placeholder="Re-enter your password"
										required
										onChange={handleConfirmPasswordChange}
									/>
								</div>
							</div>

							{/* Password Instructions */}
							<div className="col-md-3"></div>
							<div className="col-md-6">
								<div className="text-start text-muted small bg-light rounded p-2">
									<p className="text-center">Password must contain:</p>
									<ul className="mb-0 row">
										<li className="col-md-6">At least 8 characters</li>
										<li className="col-md-6">One uppercase letter</li>
										<li className="col-md-6">One lowercase letter</li>
										<li className="col-md-6">One number</li>
										<div className="col-md-1"></div>
										<li className="col-md-10">
											One special character (@$!%*?&)
										</li>
										<div className="col-md-1"></div>
									</ul>
								</div>
							</div>
							<div className="col-md-3"></div>
						</div>

						{/* Register Button */}
						<div className="text-center mt-4">
							<button
								type="submit"
								className="btn btn-primary btn-lg px-5 shadow-sm"
								disabled={!isFormValid}
								style={{ minWidth: 140 }}
							>
								{isImageUploading ? 'Uploading...' : 'Register'}
							</button>
						</div>

						<div className="text-center mt-3">
							<p className="mb-2">
								Already have an account? Login <Link to="/login">here</Link>
							</p>
							<Link to="/">
								<button className="btn btn-outline-primary">
									Back to home
								</button>
							</Link>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default CustomerSignupForm;
