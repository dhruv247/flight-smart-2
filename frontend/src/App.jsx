import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { FlightProvider } from './context/FlightContext';
import { ChatProvider } from './context/ChatContext';
import AppRoutes from './routes/AppRoutes';
import ToastProvider from './components/ToastProvider';

const App = () => {
	return (
		<ToastProvider>
			<FlightProvider>
				<ChatProvider>
					<Router>
						<AppRoutes />
					</Router>
				</ChatProvider>
			</FlightProvider>
		</ToastProvider>
	);
};

export default App;
