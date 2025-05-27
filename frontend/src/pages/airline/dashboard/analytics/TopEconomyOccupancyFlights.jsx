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

const TopEconomyOccupancyFlights = ({ startDate, endDate }) => {
	const [data, setData] = useState({});
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [numFlights, setNumFlights] = useState(5);

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		indexAxis: 'y',
		plugins: {
			legend: {
				display: false,
			},
			title: {
				display: true,
				text: 'Top Economy Class Occupancy Flights',
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
					text: 'Occupancy Percentage',
				},
				ticks: {
					callback: function (value) {
						return value * 100 + '%';
					},
				},
			},
			y: {
				title: {
					display: true,
					text: 'Flight Number',
				},
			},
		},
	};

	useEffect(() => {
		const getTopEconomyOccupancyFlights = async () => {
			try {
				const response = await analyticsService.getTopEconomyOccupancyFlights(
					numFlights,
					startDate,
					endDate
				);

				console.log('RAW API response:', response);

				const flightNumbers = response.map((item) => String(item.flightNo));
				const occupancyPercentages = response.map(
					(item) => item.economyOccupancyPercentage
				);

				console.log('Mapped flightNumbers:', flightNumbers);
				console.log('Mapped occupancyPercentages:', occupancyPercentages);

				setData({
					labels: flightNumbers,
					datasets: [
						{
							label: 'Occupancy Percentage',
							data: occupancyPercentages,
							backgroundColor: 'rgba(54, 162, 235, 0.5)',
							borderColor: 'rgba(54, 162, 235, 1)',
							borderWidth: 1,
						},
					],
				});

				setIsLoading(false);
			} catch (error) {
				console.error('Error fetching economy occupancy flights:', error);
				setError('Failed to load economy occupancy flights data');
				setIsLoading(false);
			}
		};

		getTopEconomyOccupancyFlights();
	}, [numFlights, startDate, endDate]);

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
				<Loading />
			) : (
				<div style={{ height: '400px' }}>
					<Bar data={data} options={options} />
				</div>
			)}
		</div>
	);
};

export default TopEconomyOccupancyFlights;
