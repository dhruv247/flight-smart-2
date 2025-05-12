import { useEffect, useState } from 'react';
import axios from 'axios';
import { useChat } from '../../context/ChatContext';

const UserList = ({ onSelectUser, selectedUser, userType, title }) => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const { user, unreadMessages, setActiveChat } = useChat();

	useEffect(() => {
		const fetchUsers = async () => {
			if (!user) return;

			try {
				const endpoint =
					userType === 'airline'
						? 'http://localhost:8000/api/messages/get-customers-for-airline'
						: 'http://localhost:8000/api/messages/get-airlines-for-customer';

				const response = await axios.get(endpoint, { withCredentials: true });
				setUsers(response.data);
				setLoading(false);
			} catch (error) {
				setError('Failed to load users');
				setLoading(false);
			}
		};

		if (user) {
			fetchUsers();
		}
	}, [user, userType]);

	const handleSelectUser = (u) => {
		onSelectUser(u);
		setActiveChat(u._id);
	};

	return (
		<div className="h-100" style={{ width: '280px' }}>
			<div className="d-flex flex-column h-100 bg-white border-end">
				<div className="d-lg-block d-none p-3 border-bottom">
					<h5 className="mb-0 fw-bold">{title}</h5>
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
						{users.map((u) => (
							<button
								key={u._id}
								className={`list-group-item list-group-item-action py-3 border-bottom position-relative ${
									selectedUser && selectedUser._id === u._id ? 'active' : ''
								}`}
								onClick={() => handleSelectUser(u)}
							>
								<div className="d-flex align-items-center">
									<img
										src={u.profilePicture}
										alt="Profile"
										className="rounded-circle me-2"
										style={{ width: '30px', height: '30px' }}
									/>
									<span>{u.username}</span>

									{unreadMessages[u._id] > 0 && (
										<span className="position-absolute top-50 end-0 translate-middle-y badge rounded-pill bg-danger me-2">
											{unreadMessages[u._id]}
										</span>
									)}
								</div>
							</button>
						))}

						{!loading && users.length === 0 && (
							<div className="text-center text-muted p-3">
								No {title.toLowerCase()} available
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default UserList;
