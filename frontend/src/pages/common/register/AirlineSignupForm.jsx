import React, { useState } from 'react';
import axios from 'axios';
import { showSuccessToast, showErrorToast } from '../../../utils/toast';
import { useNavigate } from 'react-router-dom';

const AirlineSignupForm = () => {
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		email: '',
		username: '',
		password: '',
		userType: 'airline',
	});

	const [confirmPassword, setConfirmPassword] = useState('');

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleConfirmPasswordChange = (e) => {
		setConfirmPassword(e.target.value);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

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
					<button type="submit" className="form-control btn btn-primary">
						Register
					</button>
				</div>
				<div className="col-1 col-md-4"></div>
			</div>
		</form>
	);
};

export default AirlineSignupForm;
