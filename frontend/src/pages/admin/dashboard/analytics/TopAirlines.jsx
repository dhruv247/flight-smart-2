import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

// Function to generate random colors
const generateRandomColor = () => {
	const hue = Math.floor(Math.random() * 360); // Random hue
	const saturation = 70 + Math.random() * 10; // High saturation (70-80)
	const lightness = 45 + Math.random() * 10; // Medium lightness (45-55)
	return `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`;
};

// Function to generate border color (darker version of background color)
const generateBorderColor = (hslaColor) => {
	return hslaColor
		.replace('0.8)', '1)')
		.replace(
			/(\d+)%,\s*(\d+)%/,
			(_, s, l) => `${s}%, ${Math.max(35, parseInt(l) - 10)}%`
		);
};

const TopAirlines = ({ noOfTopAirlines }) => {
	const [topAirlinesList, setTopAirlinesList] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [data, setData] = useState({});

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
				text: 'Top Airlines by Number of Flights',
				font: {
					size: 16,
					weight: 'normal',
				},
				padding: {
					bottom: 30,
				},
			},
		},
		cutout: '60%',
	};

	useEffect(() => {
		const getTopAirlines = async () => {
			try {
				const response = await axios.get(
					`http://localhost:8000/api/analytics/top-airlines-by-number-of-flights?num=${noOfTopAirlines}`,
					{ withCredentials: true }
				);
				setTopAirlinesList(response.data);

				const labels = response.data.map((airline) => airline.airlineName);
				const dataset = response.data.map((airline) => airline.count);

				// Generate random colors for each airline
				const backgroundColors = labels.map(() => generateRandomColor());
				const borderColors = backgroundColors.map((color) =>
					generateBorderColor(color)
				);

				setData({
					labels: labels,
					datasets: [
						{
							label: 'Number of Flights',
							data: dataset,
							backgroundColor: backgroundColors,
							borderColor: borderColors,
							borderWidth: 1,
						},
					],
				});

				setIsLoading(false);
			} catch (error) {
				console.error('Error fetching top airlines:', error);
				setError('Failed to load airline data');
				setIsLoading(false);
			}
		};

		getTopAirlines();
	}, [noOfTopAirlines]);

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
				<p className="text-muted mt-2">Loading airline data...</p>
			</div>
		);
	}

	return (
		<div style={{ height: '400px' }}>
			<Doughnut data={data} options={options} />
		</div>
	);
};

export default TopAirlines;
