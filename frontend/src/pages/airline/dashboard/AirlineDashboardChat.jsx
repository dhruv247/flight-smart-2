import React from 'react';
import DashboardChat from '../../../components/chat/ChatDashboard';

const AirlineDashboardChat = () => {
	return (
		<DashboardChat
			userType="airline"
			sidebarTitle="Customers"
			emptyStateText="Select a customer to start chatting"
		/>
	);
};

export default AirlineDashboardChat;
