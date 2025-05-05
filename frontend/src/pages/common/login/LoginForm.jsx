import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { showSuccessToast, showErrorToast } from '../../../utils/toast';

const LoginForm = () => {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleLogin = async (event) => {
		event.preventDefault();
		try {
			// First try user login
			try {
				const userRes = await axios.post(
					'http://localhost:8000/api/user/auth/login',
					formData,
					{
						withCredentials: true,
					}
				);
				showSuccessToast('Login successful!');
				console.log('User Login Successful!', userRes.data);
				if (userRes.data.userType === 'customer') {
					navigate('/');
				} else {
					navigate('/admin/dashboard');
				}
				return;
			} catch (userError) {
				// If user login fails, try airline login
				const airlineRes = await axios.post(
					'http://localhost:8000/api/airline/auth/login',
					formData,
					{
						withCredentials: true,
					}
				);
				showSuccessToast('Login successful!');
				console.log('Airline Login Successful!', airlineRes.data);
				navigate('/airline/dashboard');
			}
		} catch (error) {
			if (error.response) {
				showErrorToast('Error: ' + error.response.data.message);
				console.log('Error Message', error.response.data.message);
			} else {
				showErrorToast(error.message);
				console.log('Error Message', error.message);
			}
		}
	};

	return (
		<div>
			<form id="loginForm" onSubmit={handleLogin} className="mt-5">
				{/* Email input */}
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
							autoComplete="off"
						/>
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
							autoComplete="off"
						/>
					</div>
					<div className="col-1 col-md-4"></div>
				</div>

				{/* Login Button */}
				<div className="row mb-3">
					<div className="col-1 col-md-4"></div>
					<div className="col-10 col-md-4">
						<button type="submit" className="form-control btn btn-primary">
							Login
						</button>
					</div>
					<div className="col-1 col-md-4"></div>
				</div>
			</form>
		</div>
	);
};

export default LoginForm;
