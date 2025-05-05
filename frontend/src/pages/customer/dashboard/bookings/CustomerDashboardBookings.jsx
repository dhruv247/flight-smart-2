import React, { useState, useEffect } from 'react';
import BookingCard from './BookingCard';
import axios from 'axios';

const BookingPage = () => {
	const [bookingsList, setBookingsList] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const getBookingsFromDB = async () => {
			try {
				const bookings = await axios.get(
					'http://localhost:8000/api/bookings/getBookings',
					{
						withCredentials: true,
					}
				);

				setBookingsList(bookings.data.bookings);
				setLoading(false);
			} catch (error) {
				setError(error.message);
				setLoading(false);
			}
		};

		getBookingsFromDB();
	}, []);

	// console.log(bookingsList);

	if (loading)
		return (
			<div className="text-center my-5">
				<div className="spinner-border text-primary" role="status">
					<span className="visually-hidden">Loading...</span>
				</div>
				<p className="mt-2">Loading your bookings...</p>
			</div>
		);
	if (error) return <div>Error: {error}</div>;
	if (bookingsList.length === 0) return <div>No bookings found</div>;

	return (
		<div className="">
			{bookingsList.map((booking) => {
				return <BookingCard key={booking._id} booking={booking} />;
			})}
		</div>
	);
};

export default BookingPage;
