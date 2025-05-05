import { createContext, useContext, useState } from 'react';

// Create context
const FlightContext = createContext();

// Provider component
export const FlightProvider = ({ children }) => {
	// States
	const [flightSearchData, setFlightSearchData] = useState(null);
	const [selectedDepartureFlight, setSelectedDepartureFlight] = useState(null);
	const [currentBooking, setCurrentBooking] = useState(null);

	// Clear all flight-related data
	const clearFlightData = () => {
		setFlightSearchData(null);
		setSelectedDepartureFlight(null);
		setCurrentBooking(null);
	};

	// Context value
	const value = {
		flightSearchData,
		setFlightSearchData,
		selectedDepartureFlight,
		setSelectedDepartureFlight,
		currentBooking,
		setCurrentBooking,
		clearFlightData,
	};

	return (
		<FlightContext.Provider value={value}>{children}</FlightContext.Provider>
	);
};

// Custom hook to use the flight context
export const useFlightContext = () => {
	const context = useContext(FlightContext);
	if (!context) {
		throw new Error('useFlightContext must be used within a FlightProvider');
	}
	return context;
};