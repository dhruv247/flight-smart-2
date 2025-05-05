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

const TopPlanes = ({ noOfTopPlanes }) => {
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
				const response = await axios.get(
					`http://localhost:8000/api/analytics/admin/top-planes?num=${noOfTopPlanes}`,
					{ withCredentials: true }
				);
				setTopPlanesList(response.data);

				const labels = response.data.map((plane) => plane.planeName);
				const dataset = response.data.map((plane) => plane.count);

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
	}, [noOfTopPlanes]);

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
				<p className="text-muted mt-2">Loading plane data...</p>
			</div>
		);
	}

	return (
		<div style={{ height: '400px' }}>
			<Line data={data} options={options} />
		</div>
	);
};

export default TopPlanes;
