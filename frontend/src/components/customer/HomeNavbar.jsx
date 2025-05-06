import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import getUserDetails from '../../utils/getUserDetails';

const Navbar = () => {
	// user details used for type of dashboard (admin, customer, admin)
	const [userDetails, setUserDetails] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	// for checking if a user if logged in and then saving user details to a variable
	useEffect(() => {
		const checkAuthStatus = async () => {
			try {
				const details = await getUserDetails();
				setUserDetails(details);
			} catch (error) {
				setUserDetails(null);
			} finally {
				setIsLoading(false);
			}
		};
		checkAuthStatus();
	}, []);

	return (
		<nav
			className="navbar sticky-top"
			style={{
				backgroundColor: '#fff',
				boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
				borderBottom: '1px solid #e5e7eb',
			}}
		>
			<div className="container">
				<div className="d-flex align-items-center flex-grow-1">
					{/* Brand */}
					<Link
						className="navbar-brand me-4 text-decoration-none"
						to="/"
						style={{ color: '#2E7D32' }}
					>
						<h2 className="">FlyEasy</h2>
					</Link>
				</div>

				<div>
					{!isLoading && !userDetails && (
						<Link to="/signup">
							<button
								className="btn px-4 py-2"
								style={{
									backgroundColor: '#2E7D32',
									color: '#fff',
								}}
							>
								Sign Up
							</button>
						</Link>
					)}
					{/* Admin Dashboard Button */}
					{/* {!isLoading && userDetails && userDetails.userType === 'admin' && (
						<Link to="/admin/dashboard">
							<button
								className="btn px-4 py-2"
								style={{
									backgroundColor: '#2E7D32',
									color: '#fff',
								}}
							>
								Dashboard
							</button>
						</Link>
					)} */}
					{/* Customer Dashboard Button */}
					{!isLoading && userDetails && userDetails.userType === 'customer' && (
						<Link to="/customer/dashboard">
							<button
								className="btn px-4 py-2"
								style={{
									backgroundColor: '#2E7D32',
									color: '#fff',
								}}
							>
								Dashboard
							</button>
						</Link>
					)}
					{/* User Dashboard Button */}
					{/* {!isLoading && userDetails && userDetails.userType === 'airline' && (
						<Link to="/airline/dashboard">
							<button
								className="btn px-4 py-2"
								style={{
									backgroundColor: '#2E7D32',
									color: '#fff',
								}}
							>
								Dashboard
							</button>
						</Link>
					)} */}
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
