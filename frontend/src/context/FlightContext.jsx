import { createContext, useState, useEffect } from 'react';

// Create context
export const FlightContext = createContext();

// Provider component
export const FlightProvider = ({ children }) => {
	
	// States with localStorage initialization
	const [flightSearchData, setFlightSearchData] = useState(() => {
		const saved = localStorage.getItem('flightSearchData');
		return saved ? JSON.parse(saved) : null;
	});

	const [selectedDepartureFlight, setSelectedDepartureFlight] = useState(() => {
		const saved = localStorage.getItem('selectedDepartureFlight');
		return saved ? JSON.parse(saved) : null;
	});

	const [selectedDepartureFlightArrivalTime, setSelectedDepartureFlightArrivalTime] = useState(() => {
		const saved = localStorage.getItem('selectedDepartureFlightArrivalTime');
		return saved ? JSON.parse(saved) : null;
	});
	
	const [currentBooking, setCurrentBooking] = useState(() => {
		const saved = localStorage.getItem('currentBooking');
		return saved ? JSON.parse(saved) : null;
	});

	// Update localStorage when state changes
	useEffect(() => {
		if (flightSearchData) {
			localStorage.setItem(
				'flightSearchData',
				JSON.stringify(flightSearchData)
			);
		}
	}, [flightSearchData]);

	useEffect(() => {
		if (selectedDepartureFlight) {
			localStorage.setItem(
				'selectedDepartureFlight',
				JSON.stringify(selectedDepartureFlight)
			);
		}
	}, [selectedDepartureFlight]);

	useEffect(() => {
		if (selectedDepartureFlightArrivalTime) {
			localStorage.setItem(
				'selectedDepartureFlightArrivalTime',
				JSON.stringify(selectedDepartureFlightArrivalTime)
			);
		}
	}, [selectedDepartureFlightArrivalTime]);

	useEffect(() => {
		if (currentBooking) {
			localStorage.setItem('currentBooking', JSON.stringify(currentBooking));
		}
	}, [currentBooking]);

	// Clear all flight-related data
	const clearFlightData = () => {
		setFlightSearchData(null);
		setSelectedDepartureFlight(null);
		setSelectedDepartureFlightArrivalTime(null);
		setCurrentBooking(null);
		// Also clear from localStorage
		localStorage.removeItem('flightSearchData');
		localStorage.removeItem('selectedDepartureFlight');
		localStorage.removeItem('selectedDepartureFlightArrivalTime');
		localStorage.removeItem('currentBooking');
	};

	// Context value
	const value = {
		flightSearchData,
		setFlightSearchData,
		selectedDepartureFlight,
		setSelectedDepartureFlight,
		selectedDepartureFlightArrivalTime,
		setSelectedDepartureFlightArrivalTime,
		currentBooking,
		setCurrentBooking,
		clearFlightData,
	};

	return (
		<FlightContext.Provider value={value}>{children}</FlightContext.Provider>
	);
};