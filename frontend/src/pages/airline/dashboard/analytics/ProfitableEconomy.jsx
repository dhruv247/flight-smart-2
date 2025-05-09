import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
);

const ProfitableEconomy = () => {
	const [data, setData] = useState({});
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [numFlights, setNumFlights] = useState(10);

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false,
			},
			title: {
				display: true,
				text: 'Most Profitable Economy Class Flights (Economy Current Price / Duration)',
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
					text: 'Profit Score',
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
		const getProfitableEconomyFlights = async () => {
			try {
				const response = await axios.get(
					`http://localhost:8000/api/analytics/profitable-economy-flights?limit=${numFlights}`,
					{
						withCredentials: true,
					}
				);

				const flightNumbers = response.data.map((item) => item.flightNo);
				const profitScores = response.data.map((item) => item.profitScore);

				setData({
					labels: flightNumbers,
					datasets: [
						{
							label: 'Profit Score',
							data: profitScores,
							borderColor: 'rgba(255, 99, 132, 1)',
							backgroundColor: 'rgba(255, 99, 132, 0.5)',
							tension: 0.1,
							pointRadius: 4,
							pointHoverRadius: 6,
						},
					],
				});

				setIsLoading(false);
			} catch (error) {
				console.error('Error fetching profitable economy flights:', error);
				setError('Failed to load profitable economy flights data');
				setIsLoading(false);
			}
		};

		getProfitableEconomyFlights();
	}, [numFlights]);

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
				<div className="text-center p-4">
					<div className="spinner-border text-primary" role="status">
						<span className="visually-hidden">Loading...</span>
					</div>
					<p className="text-muted mt-2">
						Loading profitable economy flights data...
					</p>
				</div>
			) : (
				<div style={{ height: '400px' }}>
					<Line data={data} options={options} />
				</div>
			)}
		</div>
	);
};

export default ProfitableEconomy;
