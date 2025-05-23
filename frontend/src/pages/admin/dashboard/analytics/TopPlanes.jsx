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

const TopPlanes = ({ noOfTopPlanes, startDate, endDate }) => {
	const [topPlanesList, setTopPlanesList] = useState([]);
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
				text: 'Top Planes by Number of Flights',
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
		const getTopPlanes = async () => {
			try {
				const response = await analyticsService.getTopPlanesByNumberOfFlights(
					noOfTopPlanes,
					startDate,
					endDate
				);
				setTopPlanesList(response);

				const labels = response.map((plane) => plane.planeName);
				const dataset = response.map((plane) => plane.count);

				setData({
					labels: labels,
					datasets: [
						{
							label: 'Number of Flights',
							data: dataset,
							borderColor: 'rgba(255, 159, 64, 1)',
							backgroundColor: 'rgba(255, 159, 64, 0.1)',
							tension: 0.4,
							fill: true,
							pointBackgroundColor: 'rgba(255, 159, 64, 1)',
							pointBorderColor: '#fff',
							pointHoverBackgroundColor: '#fff',
							pointHoverBorderColor: 'rgba(255, 159, 64, 1)',
						},
					],
				});

				setIsLoading(false);
			} catch (error) {
				console.error('Error fetching top planes:', error);
				setError('Failed to load plane data');
				setIsLoading(false);
			}
		};

		getTopPlanes();
	}, [noOfTopPlanes, startDate, endDate]);

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
			<Line data={data} options={options} />
		</div>
	);
};

export default TopPlanes;
