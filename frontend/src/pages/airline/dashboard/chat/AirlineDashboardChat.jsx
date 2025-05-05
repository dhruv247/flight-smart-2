import React, { useState } from 'react';
import AirlineChatBox from '../../../../components/airline/chat/AirlineChatBox';
import AirlineUserList from '../../../../components/airline/chat/AirlineUserList';

const AirlineDashboardChat = () => {
	const [selectedUser, setSelectedUser] = useState(null);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	const handleSelectUser = (user) => {
		setSelectedUser(user);
		setIsSidebarOpen(false); // Close sidebar after selection on mobile
	};

	return (
		<div className="h-100">
			<div className="d-flex h-100">
				{/* Sidebar Toggle Button - Only visible on mobile */}
				<button
					className="btn btn-primary d-lg-none position-fixed start-0 top-50 translate-middle-y rounded-end"
					onClick={() => setIsSidebarOpen(true)}
					style={{ zIndex: 1030, padding: '0.5rem' }}
				>
					<i className="bi bi-chevron-right"></i>
				</button>

				{/* Sidebar - Regular view on desktop, offcanvas on mobile */}
				<div className={`d-none d-lg-block h-100`}>
					<AirlineUserList
						onSelectUser={handleSelectUser}
						selectedUser={selectedUser}
					/>
				</div>

				{/* Offcanvas Sidebar for Mobile */}
				<div
					className={`offcanvas offcanvas-start d-lg-none ${
						isSidebarOpen ? 'show' : ''
					}`}
					tabIndex="-1"
					style={{ width: '280px' }}
				>
					<div className="offcanvas-header">
						<h5 className="offcanvas-title">Customers</h5>
						<button
							type="button"
							className="btn-close"
							onClick={() => setIsSidebarOpen(false)}
						></button>
					</div>
					<div className="offcanvas-body p-0">
						<AirlineUserList
							onSelectUser={handleSelectUser}
							selectedUser={selectedUser}
						/>
					</div>
				</div>

				{/* Main Chat Area */}
				<AirlineChatBox selectedUser={selectedUser} />
			</div>
		</div>
	);
};

export default AirlineDashboardChat;
