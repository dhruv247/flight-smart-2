import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { showSuccessToast, showErrorToast } from '../../../../utils/toast';

const ViewPlane = () => {
	const [planesList, setPlanesList] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const getPlanes = async () => {
			try {
				const response = await axios.get(
					'http://localhost:8000/api/planes/get-all',
					{ withCredentials: true }
				);

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
		return (
			<div className="text-center my-5">
				<div className="spinner-border text-primary" role="status">
					<span className="visually-hidden">Loading...</span>
				</div>
				<p className="mt-2">Loading Planes...</p>
			</div>
		);
	}

	return (
		<div className="container">
			<div className="row mt-3">
				<div className="col-md-2"></div>
				<div className="col-md-8 row d-flex align-items-center p-2 m-0">
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
