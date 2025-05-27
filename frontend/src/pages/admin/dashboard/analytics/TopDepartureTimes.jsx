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

const TopDepartureTimes = ({ startDate, endDate }) => {
	const [data, setData] = useState({});
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false,
			},
			title: {
				display: true,
				text: 'Top Departure Times',
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
					text: 'Number of Flights',
				},
			},
			x: {
				title: {
					display: true,
					text: 'Time Period',
				},
			},
		},
	};

	useEffect(() => {
		const getTopDepartureTimes = async () => {
			try {
				const response = await analyticsService.getTopDepartureTimes(
					startDate,
					endDate
				);

				const labels = response.map((item) => item._id);
				const counts = response.map((item) => item.count);

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
				console.error('Error fetching top departure times:', error);
				setError('Failed to load top departure times data');
				setIsLoading(false);
			}
		};

		getTopDepartureTimes();
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

	return (
		<div style={{ height: '400px' }}>
			<Bar data={data} options={options} />
		</div>
	);
};

export default TopDepartureTimes;
