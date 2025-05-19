import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { showSuccessToast, showErrorToast } from '../../../utils/toast';

const LoginForm = () => {
	const navigate = useNavigate();
	const [isFormValid, setIsFormValid] = useState(false);
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});

	useEffect(() => {
		const isEmailValid = formData.email.trim() !== '';
		const isPasswordValid = formData.password.trim() !== '';
		setIsFormValid(isEmailValid && isPasswordValid);
	}, [formData.email, formData.password]);

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleLogin = async (event) => {
		event.preventDefault();
			try {
				const userRes = await axios.post(
					'http://localhost:8000/api/auth/login',
					formData,
					{
						withCredentials: true,
					}
				);
				showSuccessToast('Login successful!');
				// console.log('User Login Successful!', userRes.data);
				if (userRes.data.userType === 'customer') {
					navigate('/');
				} else if (userRes.data.userType === 'airline') {
					navigate('/airline/dashboard');
				} else if (userRes.data.userType === 'admin') {
					navigate('/admin/dashboard');
				}
			} catch (error) {
				if (error.response) {
					showErrorToast('Error: ' + error.response.data.message);
				// console.log('Error Message', error.response.data.message);
			} else {
				showErrorToast(error.message);
				// console.log('Error Message', error.message);
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
						<button
							type="submit"
							className="form-control btn btn-primary"
							disabled={!isFormValid}
						>
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