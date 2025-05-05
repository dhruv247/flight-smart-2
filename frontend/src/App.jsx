import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { FlightProvider } from './context/FlightContext';
import AppRoutes from './routes/AppRoutes';
import ToastProvider from './components/common/ToastProvider';

const App = () => {
	return (
		<ToastProvider>
			<FlightProvider>
				<Router>
					<AppRoutes />
				</Router>
			</FlightProvider>
		</ToastProvider>
	);
};

export default App;
