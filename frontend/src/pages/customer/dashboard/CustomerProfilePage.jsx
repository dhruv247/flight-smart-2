import useGetUserDetails from '../../../hooks/useGetUserDetails';
import Loading from '../../../components/Loading';

/**
 * Customer Profile Page
 */
const CustomerProfilePage = () => {
	const { user, isLoading } = useGetUserDetails();

	// Show loading state while checking authentication
	if (isLoading) {
		return <Loading />;
	}

	return (
		<div className="container text-center">
			<div className="row" style={{ marginTop: '75px' }}>
				<div className="col-1 col-md-4"></div>
				<div className="border rounded col-10 col-md-4 py-4">
					
						<img
							src={user.profilePicture}
							alt="Profile Picture"
							className="rounded-circle border border-2"
							style={{ width: '225px', height: '225px' }}
						/>
					

					<p className="my-3">
						<span className="fw-bold">Username:</span> {user.username}
					</p>
					<p className="my-3">
						<span className="fw-bold">Email:</span> {user.email}
					</p>
				</div>
				<div className="col-1 col-md-4"></div>
			</div>
		</div>
	);
};

export default CustomerProfilePage;