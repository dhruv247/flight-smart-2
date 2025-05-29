import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import Loading from '../../../../components/Loading';
import { analyticsService } from '../../../../services/analytics.service';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

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

const TopTravelClass = ({ startDate, endDate }) => {
	const [travelClassList, setTravelClassList] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [data, setData] = useState({
		labels: [],
		datasets: [
			{
				label: 'Number of Tickets',
				data: [],
				backgroundColor: [],
				borderColor: [],
				borderWidth: 1,
			},
		],
	});

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
				text: 'Travel Class Distribution (By Tickets)',
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
		const getTopTravelClass = async () => {
			try {
				console.log('Sending dates:', { startDate, endDate });
				const response = await analyticsService.getTopTravelClass(
					startDate,
					endDate
				);
				console.log('API Response:', response);
				setTravelClassList(response);

				const labels = response.map(
					(item) =>
						item.seatType.charAt(0).toUpperCase() + item.seatType.slice(1)
				);
				const dataset = response.map((item) => item.count);

				console.log('Labels:', labels);
				console.log('Dataset:', dataset);

				// Generate random colors for each travel class
				const backgroundColors = labels.map(() => generateRandomColor());
				const borderColors = backgroundColors.map((color) =>
					generateBorderColor(color)
				);

				const newData = {
					labels: labels,
					datasets: [
						{
							label: 'Number of Tickets',
							data: dataset,
							backgroundColor: backgroundColors,
							borderColor: borderColors,
							borderWidth: 1,
						},
					],
				};

				console.log('Chart Data:', newData);
				setData(newData);
				setIsLoading(false);
			} catch (error) {
				console.error('Error fetching travel class data:', error);
				setError('Failed to load travel class data');
				setIsLoading(false);
			}
		};

		getTopTravelClass();
	}, [startDate, endDate]);

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

	console.log('Rendering with data:', data);

	return (
		<div style={{ height: '400px' }}>
			<Pie data={data} options={options} />
		</div>
	);
};

export default TopTravelClass;
