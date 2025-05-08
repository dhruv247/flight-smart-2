import React, { useState } from 'react';
import CustomerChatBox from '../../../../components/customer/chat/CustomerChatBox';
import CustomerUserList from '../../../../components/customer/chat/CustomerUserList';

const CustomerDashboardChat = () => {
	const [selectedUser, setSelectedUser] = useState(null);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	const handleSelectUser = (user) => {
		setSelectedUser(user);
		setIsSidebarOpen(false); // Close sidebar after selection on mobile
	};

	return (
		<div className="h-100">
			<div className="d-flex h-100">
				{/* Sidebar Toggle Button */}
				<button
					className="btn btn-primary d-lg-none position-fixed start-0 top-50 translate-middle-y rounded-end"
					onClick={() => setIsSidebarOpen(true)}
					style={{ zIndex: 1030, padding: '0.5rem' }}
				>
					<i className="bi bi-chevron-right"></i>
				</button>

				{/* Sidebar - Regular view on desktop, offcanvas on mobile */}
				<div className={`d-none d-lg-block h-100`}>
					<CustomerUserList
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
						<h5 className="offcanvas-title">Airlines</h5>
						<button
							type="button"
							className="btn-close"
							onClick={() => setIsSidebarOpen(false)}
						></button>
					</div>
					<div className="offcanvas-body p-0">
						<CustomerUserList
							onSelectUser={handleSelectUser}
							selectedUser={selectedUser}
						/>
					</div>
				</div>

				{/* Main Chat Area */}
				<CustomerChatBox selectedUser={selectedUser} />
			</div>
		</div>
	);
};

export default CustomerDashboardChat;
