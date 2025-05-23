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

const BusyDates = ({ startDate, endDate }) => {
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
				text: 'Busy Dates by Number of Flights',
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
					text: 'Date',
				},
			},
		},
	};

	useEffect(() => {
		const getBusyDates = async () => {
			try {
				const response = await analyticsService.getTopDatesByNumberOfFlights(
					startDate,
					endDate
				);

				const dates = response.map((item) =>
					new Date(item.date).toLocaleDateString()
				);
				const counts = response.map((item) => item.flightCount);

				setData({
					labels: dates,
					datasets: [
						{
							label: 'Number of Flights',
							data: counts,
							backgroundColor: 'rgba(54, 162, 235, 0.5)',
							borderColor: 'rgba(54, 162, 235, 1)',
							borderWidth: 1,
						},
					],
				});

				setIsLoading(false);
			} catch (error) {
				console.error('Error fetching busy dates:', error);
				setError('Failed to load busy dates data');
				setIsLoading(false);
			}
		};

		getBusyDates();
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

export default BusyDates;
