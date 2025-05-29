import React, { useState, useEffect } from 'react';
import { showErrorToast } from '../../../../utils/toast';
import Loading from '../../../../components/Loading';
import { planeService } from '../../../../services/plane.service';

/**
 * View Planes
 */
const ViewPlane = () => {
	const [planesList, setPlanesList] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	/**
	 * Fetch planes from the database
	 */
	useEffect(() => {
		const getPlanes = async () => {
			try {
				const response = await planeService.getAllPlanes();

				if (response) {
					setPlanesList(response.data.planes);
				}

				setIsLoading(false);
			} catch (error) {
				console.log(error.message);
				showErrorToast(error.message);
				setIsLoading(false);
			} finally {
				setIsLoading(false);
			}
		};

		getPlanes();
	}, []);

	if (isLoading) {
		return <Loading />;
	}

	return (
		<div className="container">
			<div className="row mt-3">
				<div className="col-md-2"></div>
				<div className="col-md-8 row d-flex align-items-center p-2 m-0 border rounded bg-light">
					<p className="col-12 col-md-4 fw-bold">Plane Name</p>
					<p className="col-12 col-md-4 fw-bold">Business Capacity</p>
					<p className="col-12 col-md-4 fw-bold">Economy Capcity</p>
				</div>
				<div className="col-md-2"></div>
			</div>
			{planesList.map((plane) => {
				return (
					<div className="row mt-3" key={plane._id}>
						<div className="col-md-2"></div>
						<div className="col-md-8 row d-flex align-items-center border rounded p-2 m-0">
							<p className="col-12 col-md-4">{plane.planeName}</p>
							<p className="col-12 col-md-4">{plane.businessCapacity}</p>
							<p className="col-12 col-md-4">{plane.economyCapacity}</p>
						</div>
						<div className="col-md-2"></div>
					</div>
				);
			})}
		</div>
	);
};

export default ViewPlane;
