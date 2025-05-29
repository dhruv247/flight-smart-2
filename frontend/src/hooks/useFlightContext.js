import { useContext } from 'react';
import { FlightContext } from '../context/FlightContext';

/**
 * Custom hook to use the flight context
 * @returns - The flight context
 */
export const useFlightContext = () => {
	const context = useContext(FlightContext);
	if (!context) {
		throw new Error('useFlightContext must be used within a FlightProvider');
	}
	return context;
};