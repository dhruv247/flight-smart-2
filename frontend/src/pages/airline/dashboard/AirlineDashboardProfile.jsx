import React, { useState } from 'react';
import useGetUserDetails from '../../../hooks/useGetUserDetails';
import ChangePasswordModal from '../../../components/profile/ChangePasswordModal';
import ChangeProfileModal from '../../../components/profile/ChangeProfileModal';
import Loading from '../../../components/Loading';

const AirlineDashboardProfile = () => {
	const { user, isLoading } = useGetUserDetails();
	const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
	const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

	// Show loading state while checking authentication
	if (isLoading) {
		return <Loading />;
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
