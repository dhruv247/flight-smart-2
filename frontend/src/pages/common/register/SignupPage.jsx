import React, { useState } from 'react';
import CustomerSignupForm from './CustomerSignupForm';
import AirlineSignupForm from './AirlineSignupForm';
import { Link } from 'react-router-dom';

/**
 * Signup Page - choose between customer and airline
 */
const SignupPage = () => {
	const [userType, setUserType] = useState('customer');

	const handleChange = (e) => {
		setUserType(e.target.value);
	};

	return (
		<div className="container mt-5 text-center">
			<div className="btn-group mb-3" role="group">
				<input
					type="radio"
					className="btn-check"
					name="userType"
					id="customerRadio"
					value="customer"
					checked={userType === 'customer'}
					onChange={handleChange}
					autoComplete="off"
				/>
				<label className="btn btn-outline-primary" htmlFor="customerRadio">
					Customer
				</label>

				<input
					type="radio"
					className="btn-check"
					name="userType"
					id="airlineRadio"
					value="airline"
					checked={userType === 'airline'}
					onChange={handleChange}
					autoComplete="off"
				/>
				<label className="btn btn-outline-primary" htmlFor="airlineRadio">
					Airline
				</label>
			</div>

			{/* Conditional form rendering */}
			{userType === 'customer' && <CustomerSignupForm />}
			{userType === 'airline' && <AirlineSignupForm />}
		</div>
	);
};

export default SignupPage;
