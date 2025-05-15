import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlightContext } from '../../../hooks/useFlightContext';
import Navbar from '../../../components/navbars/HomeNavbar';
import FlightSearchForm from '../../customer/flightSearch/FlightSearchForm';
import PopularDestinations from './PopularDestinations';

const HomePage = () => {
	const navigate = useNavigate();

	const { setFlightSearchData } = useFlightContext();

	const handleSearch = (formData) => {
		// Format dates before storing in context
		const formatDate = (date) => {
			if (!date) return null;

			// If already a string in YYYY-MM-DD format, use it directly
			if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
				return date;
			}

			// Convert Date object to YYYY-MM-DD string
			const dateObj = new Date(date);
			const year = dateObj.getFullYear();
			const month = String(dateObj.getMonth() + 1).padStart(2, '0');
			const day = String(dateObj.getDate()).padStart(2, '0');
			return `${year}-${month}-${day}`;
		};

		// Create a normalized copy with properly formatted dates
		const normalizedData = {
			...formData,
			departureDate: formatDate(formData.departureDate),
			returnDate: formData.returnDate ? formatDate(formData.returnDate) : null,
		};

		setFlightSearchData(normalizedData);
		navigate('/customer/departureFlights');
	};

	return (
		<div className="bg-light min-vh-100">
			{/* Navbar */}
			<Navbar />

			<FlightSearchForm onSubmit={handleSearch} />

			<PopularDestinations />
		</div>
	);
};

export default HomePage;
