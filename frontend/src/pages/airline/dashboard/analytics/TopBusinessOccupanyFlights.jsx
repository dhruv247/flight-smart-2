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

const TopBusinessOccupancyFlights = ({ startDate, endDate }) => {
	const [data, setData] = useState({});
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [numFlights, setNumFlights] = useState(5);

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false,
			},
			title: {
				display: true,
				text: 'Top Business Class Occupancy Flights',
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
					text: 'Occupancy Percentage',
				},
				ticks: {
					callback: function (value) {
						return value * 100 + '%';
					},
				},
			},
			x: {
				title: {
					display: true,
					text: 'Flight Number',
				},
			},
		},
	};

	useEffect(() => {
		const getTopBusinessOccupancyFlights = async () => {
			try {
				const response = await analyticsService.getTopBusinessOccupancyFlights(
					numFlights,
					startDate,
					endDate
				);

				const flightNumbers = response.map((item) => item.flightNo);
				const occupancyPercentages = response.map(
					(item) => item.businessOccupancyPercentage
				);

				console.log('Mapped flightNumbers:', flightNumbers);
				console.log('Mapped occupancyPercentages:', occupancyPercentages);

				setData({
					labels: flightNumbers,
					datasets: [
						{
							label: 'Occupancy Percentage',
							data: occupancyPercentages,
							backgroundColor: 'rgba(75, 192, 192, 0.5)',
							borderColor: 'rgba(75, 192, 192, 1)',
							borderWidth: 1,
						},
					],
				});

				setIsLoading(false);
			} catch (error) {
				console.error('Error fetching business occupancy flights:', error);
				setError('Failed to load business occupancy flights data');
				setIsLoading(false);
			}
		};

		getTopBusinessOccupancyFlights();
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

export default TopBusinessOccupancyFlights;
