import React, { useState } from 'react';
import CustomerSignupForm from './CustomerSignupForm';
import AirlineSignupForm from './AirlineSignupForm';
import { Link } from 'react-router-dom';

const SignupPage = () => {
	const [userType, setUserType] = useState('customer');

	const handleChange = (e) => {
		setUserType(e.target.value);
	};

	return (
		<div className="container mt-5 text-center">
			<h1>Register</h1>
			<div className="mt-5 btn-group" role="group">
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

			<p>Already a user? Login <Link to='/login'>here</Link>.</p>

		</div>
	);
};

export default SignupPage;
