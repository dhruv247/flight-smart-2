import { useContext } from 'react';
import { FlightContext } from '../context/FlightContext';

export const useFlightContext = () => {
	const context = useContext(FlightContext);
	if (!context) {
		throw new Error('useFlightContext must be used within a FlightProvider');
	}
	return context;
};
