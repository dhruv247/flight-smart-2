import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import { Link } from 'react-router-dom';

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
			if (userRes.data.userType === 'customer') {
				if (localStorage.getItem('flightSearchData')) {
					navigate('/customer/departureFlights');
				} else {
					navigate('/');
				}
			} else if (userRes.data.userType === 'airline') {
				navigate('/airline/dashboard');
			} else if (userRes.data.userType === 'admin') {
				navigate('/admin/dashboard');
			}
		} catch (error) {
			if (error.response) {
				showErrorToast('Error: ' + error.response.data.message);
			} else {
				showErrorToast(error.message);
			}
		}
	};

	return (
		<div className="container text-center d-flex justify-content-center align-items-center min-vh-100">
			<div
				className="card shadow-lg border-0"
				style={{ width: '400px', background: '#f8f9fa' }}
			>
				<div
					className="card-header bg-primary text-white d-flex align-items-center justify-content-center"
					style={{
						borderTopLeftRadius: '0.5rem',
						borderTopRightRadius: '0.5rem',
					}}
				>
					<i className="bi bi-box-arrow-in-right me-2 fs-4"></i>
					<h4 className="mb-0">Login</h4>
				</div>
				<div className="card-body p-4">
					<form id="loginForm" onSubmit={handleLogin}>
						{/* Email input */}
						<div className="mb-3">
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
									autoComplete="off"
								/>
							</div>
						</div>

						{/* Password Input */}
						<div className="mb-4">
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
									autoComplete="off"
								/>
							</div>
						</div>

						{/* Login Button */}
						<div className="text-center">
							<button
								type="submit"
								className="btn btn-primary btn-lg px-5 shadow-sm"
								disabled={!isFormValid}
								style={{ minWidth: 140 }}
							>
								Sign In
							</button>
						</div>

						<p className="mt-3">
							Not a user yet? Signup <Link to="/signup">here</Link>.
						</p>
						<Link to="/">
							<button className="btn btn-outline-primary mt-3">
								Back to home
							</button>
						</Link>
					</form>
				</div>
			</div>
		</div>
	);
};

export default LoginForm;
