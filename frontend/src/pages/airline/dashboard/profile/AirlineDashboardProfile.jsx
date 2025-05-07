import React, { useEffect, useState } from 'react';
import getUserDetails from '../../../../utils/getUserDetails';
import ChangePasswordModal from '../../../../components/common/ChangePasswordModal';
import ChangeProfileModal from '../../../../components/common/ChangeProfileModal';

const AirlineDashboardProfile = () => {
	const [user, setUser] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
	const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const user = await getUserDetails();
				setUser(user);
				setIsLoading(false);
			} catch (error) {
				setIsLoading(false);
			}
		};

		fetchUser();
	}, []);

	// Show loading state while checking authentication
	if (isLoading) {
		return (
			<div className="text-center my-5">
				<div className="spinner-border text-primary" role="status"></div>
				<p className="mt-2">Loading Profile...</p>
			</div>
		);
	}

	return (
		<div className="container text-center mt-5">
			<div className="row">
				<div className="col-1 col-md-4"></div>
				<div className="border rounded col-10 col-md-4 py-4">
					<button
						className="rounded-circle bg-light border p-2"
						onClick={() => setIsProfileModalOpen(true)}
					>
						<img
							src={user.profilePicture}
							alt="Profile Picture"
							className="rounded-circle"
							style={{ width: '225px', height: '225px' }}
						/>
					</button>

					<p className="my-3">
						<span className="fw-bold">Airline Name:</span> {user.username}
					</p>
					<p className="my-3">
						<span className="fw-bold">Email:</span> {user.email}
					</p>
					<button
						className="btn btn-primary"
						onClick={() => setIsPasswordModalOpen(true)}
					>
						Change Password
					</button>
				</div>
				<div className="col-1 col-md-4"></div>
			</div>

			<ChangePasswordModal
				isOpen={isPasswordModalOpen}
				onClose={() => setIsPasswordModalOpen(false)}
			/>
			<ChangeProfileModal
				isOpen={isProfileModalOpen}
				onClose={() => setIsProfileModalOpen(false)}
			/>
		</div>
	);
};

export default AirlineDashboardProfile;
