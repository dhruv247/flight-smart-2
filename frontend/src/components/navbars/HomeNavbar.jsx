import React from 'react';
import { Link } from 'react-router-dom';
import useGetUserDetails from '../../hooks/useGetUserDetails';

const Navbar = () => {
	const { user, isLoading } = useGetUserDetails();

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
						<h2 className="">Flight Smart</h2>
					</Link>
				</div>

				<div>
					{!isLoading && !user && (
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
					{/* Customer Dashboard Button */}
					{!isLoading && user && user.userType === 'customer' && (
						<Link to="/customer/dashboard/bookings">
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
				</div>
			</div>
		</nav>
	);
};

export default Navbar;