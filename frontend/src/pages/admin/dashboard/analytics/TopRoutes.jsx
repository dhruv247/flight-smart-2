import React, { useState, useEffect } from 'react';
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
import Loading from '../../../../components/Loading';
import { analyticsService } from '../../../../services/analytics.service';

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend
);

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

const TopRoutes = ({ noOfTopRoutes, startDate, endDate }) => {
	const [routesList, setRoutesList] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [data, setData] = useState({});

	const options = {
		indexAxis: 'y', // This makes the bar chart horizontal
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false,
			},
			title: {
				display: true,
				text: 'Top Routes by Number of Flights',
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
			x: {
				beginAtZero: true,
				title: {
					display: true,
					text: 'Number of Flights',
				},
			},
			y: {
				title: {
					display: true,
					text: 'Routes',
				},
			},
		},
	};

	useEffect(() => {
		const getTopRoutes = async () => {
			try {
				const response = await analyticsService.getTopRoutesByNumberOfFlights(
					noOfTopRoutes,
					startDate,
					endDate
				);
				setRoutesList(response);

				const labels = response.map(
					(route) => `${route.departureAirport} → ${route.arrivalAirport}`
				);
				const dataset = response.map((route) => route.count);

				// Generate random colors for each route
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
				console.error('Error fetching top routes:', error);
				setError('Failed to load routes data');
				setIsLoading(false);
			}
		};

		getTopRoutes();
	}, [noOfTopRoutes, startDate, endDate]);

	if (error) {
		return (
			<div className="text-center text-danger p-4">
				<i className="bi bi-exclamation-triangle me-2"></i>
				{error}
			</div>
		);
	}

	if (isLoading) {
		return <Loading />;
	}

	return (
		<div style={{ height: '400px' }}>
			<Bar data={data} options={options} />
		</div>
	);
};

export default TopRoutes;
