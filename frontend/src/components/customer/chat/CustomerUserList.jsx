import { useEffect, useState } from 'react';
import axios from 'axios';
import getUserDetails from '../../../utils/getUserDetails';

const CustomerUserList = ({ onSelectUser, selectedUser }) => {
	const [airlines, setAirlines] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [user, setUser] = useState(null);

	useEffect(() => {
		const fetchUser = async () => {
			const user = await getUserDetails();
			setUser(user);
		};

		fetchUser();
	}, []);

	useEffect(() => {
		const fetchAirlines = async () => {
			try {
				const response = await axios.get(
					'http://localhost:8000/api/messages/get-airlines',
					{ withCredentials: true }
				);
				setAirlines(response.data);
				setLoading(false);
			} catch (error) {
				setError('Failed to load users');
				setLoading(false);
			}
		};

		if (user) {
			fetchAirlines();
		}
	}, [user]);

	return (
		<div className="h-100" style={{ width: '280px' }}>
			<div className="d-flex flex-column h-100 bg-white border-end">
				<div className="d-lg-block d-none p-3 border-bottom">
					<h5 className="mb-0 fw-bold">Airlines</h5>
				</div>

				<div className="overflow-auto flex-grow-1">
					{loading && (
						<div className="text-center p-3">
							<div
								className="spinner-border spinner-border-sm text-primary"
								role="status"
							>
								<span className="visually-hidden">Loading users...</span>
							</div>
						</div>
					)}

					{error && (
						<div className="alert alert-danger m-2 py-2" role="alert">
							{error}
						</div>
					)}

					<div className="list-group list-group-flush">
						{airlines.map((u) => (
							<button
								key={u._id}
								className={`list-group-item list-group-item-action py-3 border-bottom ${
									selectedUser && selectedUser._id === u._id ? 'active' : ''
								}`}
								onClick={() => onSelectUser(u)}
							>
								<img
									src={u.profilePicture}
									alt="Profile"
									className="rounded-circle me-2"
									style={{ width: '30px', height: '30px' }}
								/>
								{u.airlineName}
							</button>
						))}

						{!loading && airlines.length === 0 && (
							<div className="text-center text-muted p-3">
								No airlines available
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default CustomerUserList;
