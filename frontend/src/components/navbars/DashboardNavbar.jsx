import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useFlightContext } from '../../hooks/useFlightContext';
import { authService } from '../../services/auth.service';

const DashboardNavbar = ({ navItems = [] }) => {
	const navigate = useNavigate();
	const location = useLocation();
	const { clearFlightData } = useFlightContext();
	const [showSidebar, setShowSidebar] = useState(false);

	const logout = async () => {
		try {
			const response = await authService.logout();

			// Clear all flight data from context
			clearFlightData();

			// redirect to home page after successful logout
			navigate('/');
		} catch (error) {
			console.error('Logout error:', error);
			// still redirect to home page even if there's an error
			navigate('/');
		}
	};

	const NavButtons = ({ isMobile = false }) => (
		<div className={`${isMobile ? 'd-flex flex-column' : 'd-flex'}`}>
			{navItems.map((item) => (
				<Link
					key={item.id}
					to={item.path}
					className={`${isMobile ? 'w-100 text-start mb-2' : 'mx-2'} btn ${
						location.pathname === item.path
							? 'text-white fw-medium'
							: isMobile
							? 'btn-light'
							: ''
					}`}
					style={{
						backgroundColor:
							location.pathname === item.path ? '#2E7D32' : 'transparent',
						color: location.pathname === item.path ? '#fff' : '#5f6368',
					}}
					onClick={() => isMobile && setShowSidebar(false)}
				>
					<i className={`bi ${item.icon} me-2`}></i>
					{item.label}
				</Link>
			))}
		</div>
	);

	return (
		<>
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

						{/* Navigation Options - Desktop */}
						<div className="d-none d-lg-block">
							<NavButtons />
						</div>
					</div>

					{/* Menu Toggle - Mobile */}
					<div className="d-lg-none">
						<button
							className="btn"
							style={{ color: '#5f6368' }}
							onClick={() => setShowSidebar(true)}
						>
							<i className="bi bi-list fs-4"></i>
						</button>
					</div>

					{/* Logout Button - Desktop */}
					<button
						className="btn d-none d-lg-block"
						style={{
							backgroundColor: '#dc3545',
							color: '#fff',
							padding: '0.5rem 1.5rem',
						}}
						onClick={() => logout()}
					>
						Logout
					</button>
				</div>
			</nav>

			{/* Mobile Sidebar */}
			<div
				className={`offcanvas offcanvas-end${showSidebar ? ' show' : ''}`}
				tabIndex="-1"
				style={{
					visibility: showSidebar ? 'visible' : 'hidden',
					backgroundColor: '#fff',
				}}
			>
				<div className="offcanvas-header border-bottom">
					<h5 className="offcanvas-title" style={{ color: '#2E7D32' }}>
						Menu
					</h5>
					<button
						type="button"
						className="btn-close"
						onClick={() => setShowSidebar(false)}
					></button>
				</div>
				<div className="offcanvas-body">
					<NavButtons isMobile={true} />
					<hr />
					<button
						className="btn w-100"
						style={{
							backgroundColor: '#dc3545',
							color: '#fff',
							padding: '0.5rem 1.5rem',
						}}
						onClick={() => {
							logout();
							setShowSidebar(false);
						}}
					>
						Logout
					</button>
				</div>
			</div>

			{/* Backdrop for mobile sidebar */}
			{showSidebar && (
				<div
					className="offcanvas-backdrop fade show"
					onClick={() => setShowSidebar(false)}
				></div>
			)}
		</>
	);
};

export default DashboardNavbar;
