import React, { useState } from 'react';
import LoginForm from './LoginForm';
import { Link } from 'react-router-dom';

const LoginPage = () => {
	return (
		<div className="container text-center mt-5">
			<h1>Login</h1>
			<LoginForm />
			<p>
				Not a user yet? Signup <Link to="/signup">here</Link>.
			</p>
			<Link to="/">
				<button className="btn btn-outline-primary mt-3">Back to home</button>
			</Link>
		</div>
	);
};

export default LoginPage;
