import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import Loading from '../../../../components/Loading';
import { analyticsService } from '../../../../services/analytics.service';

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

const TopCities = ({ noOfTopCities, startDate, endDate }) => {
	const [topCitiesList, setTopCitiesList] = useState([]);
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
				text: 'Top Cities (Destinations) by Number of Flights',
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
		const getTopCities = async () => {
			try {
				const response = await analyticsService.getTopCitiesByNumberOfFlights(
					noOfTopCities,
					startDate,
					endDate
				);
				setTopCitiesList(response);

				const labels = response.map((city) => city.city);
				const dataset = response.map((city) => city.count);

				// Generate random colors for each city
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
				console.error('Error fetching top cities:', error);
				setError('Failed to load city data');
				setIsLoading(false);
			}
		};

		getTopCities();
	}, [noOfTopCities, startDate, endDate]);

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
			<Pie data={data} options={options} />
		</div>
	);
};

export default TopCities;
