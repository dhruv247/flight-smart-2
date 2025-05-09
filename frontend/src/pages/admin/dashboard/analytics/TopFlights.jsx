import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend
);

const TopFlights = ({ noOfTopFlights }) => {
	const [topFlightsList, setTopFlightList] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [data, setData] = useState({});

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: 'top',
				labels: {
					boxWidth: 10,
					usePointStyle: true,
					pointStyle: 'circle',
				},
			},
			title: {
				display: true,
				text: 'Most Booked Departure Flights',
				font: {
					size: 16,
					weight: 'normal',
				},
				padding: {
					bottom: 30,
				},
			},
		},
		scales: {
			y: {
				beginAtZero: true,
				ticks: {
					stepSize: 1,
				},
				grid: {
					display: false,
				},
			},
			x: {
				grid: {
					display: false,
				},
			},
		},
	};

	useEffect(() => {
		const getTopFlights = async (noOfTopFlights) => {
			try {
				const response = await axios.get(
					`http://localhost:8000/api/analytics/top-departure-flights-by-number-of-tickets?num=${noOfTopFlights}`,
					{ withCredentials: true }
				);
				setTopFlightList(response.data);

				// Process data for chart
				const labels = response.data.map((flight) => flight.flightNo);
				const dataset = response.data.map((flight) => flight.count);
				setData({
					labels: labels,
					datasets: [
						{
							label: 'Number of Bookings',
							data: dataset,
							backgroundColor: 'rgba(54, 162, 235, 0.5)',
							borderColor: 'rgba(54, 162, 235, 1)',
							borderWidth: 1,
							borderRadius: 5,
						},
					],
				});

				setIsLoading(false);
			} catch (error) {
				console.error('Error fetching top flights:', error);
				setError('Failed to load flight data');
				setIsLoading(false);
			}
		};

		getTopFlights(noOfTopFlights);
	}, [noOfTopFlights]);

	if (error) {
		return (
			<div className="text-center text-danger p-4">
				<i className="bi bi-exclamation-triangle me-2"></i>
				{error}
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="text-center p-4">
				<div className="spinner-border text-primary" role="status">
					<span className="visually-hidden">Loading...</span>
				</div>
				<p className="text-muted mt-2">Loading flight data...</p>
			</div>
		);
	}

	return (
		<div style={{ height: '400px' }}>
			<Bar data={data} options={options} />
		</div>
	);
};

export default TopFlights;
