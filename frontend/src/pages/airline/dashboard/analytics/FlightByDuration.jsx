import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const generateRandomColor = () => {
	const hue = Math.floor(Math.random() * 360);
	const saturation = 70 + Math.random() * 10;
	const lightness = 45 + Math.random() * 10;
	return `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`;
};

const generateBorderColor = (hslaColor) => {
	return hslaColor
		.replace('0.8)', '1)')
		.replace(
			/(\d+)%,\s*(\d+)%/,
			(_, s, l) => `${s}%, ${Math.max(35, parseInt(l) - 10)}%`
		);
};

const FlightByDuration = () => {
	const [data, setData] = useState({});
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: 'right',
				labels: {
					boxWidth: 10,
					usePointStyle: true,
					pointStyle: 'circle',
					padding: 20,
				},
			},
			title: {
				display: true,
				text: 'Flights by Duration',
				font: {
					size: 16,
					weight: 'normal',
				},
				padding: {
					bottom: 30,
				},
			},
		},
	};

	useEffect(() => {
		const getFlightsByDuration = async () => {
			try {
				const response = await axios.get(
					'http://localhost:8000/api/analytics/airline/flights-by-duration',
					{
						withCredentials: true,
					}
				);

				const labels = response.data.map((item) => item.durationRange);
				const counts = response.data.map((item) => item.flightCount);

				const backgroundColors = labels.map(() => generateRandomColor());
				const borderColors = backgroundColors.map((color) =>
					generateBorderColor(color)
				);

				setData({
					labels: labels,
					datasets: [
						{
							label: 'Number of Flights',
							data: counts,
							backgroundColor: backgroundColors,
							borderColor: borderColors,
							borderWidth: 1,
						},
					],
				});

				setIsLoading(false);
			} catch (error) {
				console.error('Error fetching flights by duration:', error);
				setError('Failed to load flights by duration data');
				setIsLoading(false);
			}
		};

		getFlightsByDuration();
	}, []);

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
				<p className="text-muted mt-2">Loading flights by duration data...</p>
			</div>
		);
	}

	return (
		<div style={{ height: '400px' }}>
			<Pie data={data} options={options} />
		</div>
	);
};

export default FlightByDuration;
