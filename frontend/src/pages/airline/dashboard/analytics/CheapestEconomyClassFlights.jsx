import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
} from 'chart.js';
import Loading from '../../../../components/Loading';
import { analyticsService } from '../../../../services/analytics.service';

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
);

const CheapestEconomyClassFlights = ({ startDate, endDate }) => {
	const [data, setData] = useState({});
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [numFlights, setNumFlights] = useState(5);

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false,
			},
			title: {
				display: true,
				text: 'Cheapest Economy Class Flights',
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
				title: {
					display: true,
					text: 'Price ($)',
				},
			},
			x: {
				title: {
					display: true,
					text: 'Flight Number',
				},
			},
		},
	};

	useEffect(() => {
		const getCheapestEconomyFlights = async () => {
			try {
				const response = await analyticsService.getCheapestEconomyClassFlights(
					numFlights,
					startDate,
					endDate
				);

				const flightNumbers = response.map((item) => item.flightNo);
				const prices = response.map((item) => item.economyCurrentPrice);

				setData({
					labels: flightNumbers,
					datasets: [
						{
							label: 'Price',
							data: prices,
							borderColor: 'rgba(75, 192, 192, 1)',
							backgroundColor: 'rgba(75, 192, 192, 0.5)',
							tension: 0.1,
							pointRadius: 4,
							pointHoverRadius: 6,
						},
					],
				});

				setIsLoading(false);
			} catch (error) {
				console.error('Error fetching cheapest economy flights:', error);
				setError('Failed to load cheapest economy flights data');
				setIsLoading(false);
			}
		};

		getCheapestEconomyFlights();
	}, [numFlights, startDate, endDate]);

	const handleNumFlightsChange = (e) => {
		setNumFlights(parseInt(e.target.value));
		setIsLoading(true);
	};

	if (error) {
		return (
			<div className="text-center text-danger p-4">
				<i className="bi bi-exclamation-triangle me-2"></i>
				{error}
			</div>
		);
	}

	return (
		<div>
			<div className="d-flex justify-content-end mb-3">
				<select
					className="form-select form-select-sm w-auto"
					value={numFlights}
					onChange={handleNumFlightsChange}
				>
					<option value="5">Top 5 Flights</option>
					<option value="10">Top 10 Flights</option>
					<option value="15">Top 15 Flights</option>
					<option value="20">Top 20 Flights</option>
				</select>
			</div>
			{isLoading ? (
				<Loading />
			) : (
				<div style={{ height: '400px' }}>
					<Line data={data} options={options} />
				</div>
			)}
		</div>
	);
};

export default CheapestEconomyClassFlights;
