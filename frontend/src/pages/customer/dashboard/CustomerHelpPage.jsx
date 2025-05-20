import React from 'react';
import DashboardChat from '../../../components/chat/ChatDashboard';

const CustomerHelpPage = () => {
	return (
		<DashboardChat
			userType="customer"
			sidebarTitle="Airlines"
			emptyStateText="Select an airline to start chatting"
		/>
	);
};

export default CustomerHelpPage;
