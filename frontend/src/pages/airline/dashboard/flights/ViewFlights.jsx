import React, { useState, useEffect } from 'react';
import Loading from '../../../../components/Loading';
import { flightService } from '../../../../services/flight.service';
import Pagination from '../../../../components/Pagination';
import FlightCard from './FlightCard';
import { useAirports } from '../../../../hooks/useAirports';

const ViewFlights = () => {
	
	const [flights, setFlights] = useState([]);
	const { airports, isLoading: airportsLoading } = useAirports();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [totalPages, setTotalPages] = useState(0);
	const [currentPage, setCurrentPage] = useState(0);
	const [pageSize, setPageSize] = useState(10);

	useEffect(() => {
		const fetchFlights = async () => {
			const response = await flightService.getAllFlightsForAirline(currentPage, pageSize);
			setFlights(response.data.flights);
			setTotalPages(response.data.totalPages);
		};
		fetchFlights();
	}, [currentPage, pageSize]);

	return (
		<div>
			<h1>Flights</h1>
		</div>
	);
};

export default ViewFlights;