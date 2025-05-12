import React, { useState, useRef } from 'react';
import axios from 'axios';
import { showSuccessToast, showErrorToast } from '../../../../utils/toast';

const AddAirport = () => {
	const formRef = useRef(null);
	const [airportDetails, setAirportDetails] = useState({
		airportName: '',
		airportCode: '',
		city: '',
		image: '',
	});

	const handleAirportChange = (e) => {
		const { name, value } = e.target;
		setAirportDetails((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

	const handleAirportImageChange = (e) => {
		const { name } = e.target;
		const file = e.target.files[0];
		if (file) {
			setAirportDetails((prev) => ({
				...prev,
				[name]: file,
			}));
		}
	};

	const handleAddAirport = async (event) => {
		event.preventDefault();

		const formData = new FormData();
		formData.append('image', airportDetails.image);

		try {
			const imageURLResponse = await axios.post(
				'http://localhost:8000/api/images/upload-image',
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				}
			);

			if (!imageURLResponse.data.url) {
				throw new Error(
					imageURLResponse.data.message || 'Failed to upload airport image'
				);
			}

			const airportImageUrl = imageURLResponse.data.url;

			const airport = {
				airportName: airportDetails.airportName,
				airportCode: airportDetails.airportCode,
				city: airportDetails.city,
				image: airportImageUrl,
			};

			const response = await axios.post(
				'http://localhost:8000/api/airports/add-airport',
				airport,
				{
					withCredentials: true,
				}
			);

			if (response.data.message === 'Airport created successfully') {
				showSuccessToast('Airport added successfully!');
				setAirportDetails({
					airportName: '',
					airportCode: '',
					city: '',
					image: '',
				});
				formRef.current.reset();
			}
		} catch (error) {
			const errorMessage = error.response?.data?.message || error.message;
			showErrorToast(errorMessage);
		}
	};

	return (
		<div className="mt-5">
			<form ref={formRef} action="" onSubmit={handleAddAirport}>
				<div className="row">
					<div className="col-md-4"></div>
					<div className="col-md-4 col-12">
						<div className="mb-4">
							<div className="input-group">
								<input
									type="text"
									name="airportName"
									className="form-control"
									placeholder="Enter Airport Name"
									onChange={handleAirportChange}
								/>
							</div>
						</div>
						<div className="mb-4">
							<div className="input-group">
								<input
									type="text"
									name="airportCode"
									className="form-control"
									placeholder="Enter Airport Code"
									onChange={handleAirportChange}
								/>
							</div>
						</div>
						<div className="mb-4">
							<div className="input-group">
								<input
									type="text"
									name="city"
									className="form-control"
									placeholder="Enter City"
									onChange={handleAirportChange}
								/>
							</div>
						</div>
						<div className="mb-4">
							<div className="input-group">
								<input
									type="file"
									name="image"
									className="form-control"
									accept="image/*"
									onChange={handleAirportImageChange}
								/>
							</div>
						</div>
						<div className="mb-4">
							<div>
								<button type="submit" className="btn btn-primary">
									Add Airport
								</button>
							</div>
						</div>
					</div>
					<div className="col-md-4"></div>
				</div>
			</form>
		</div>
	);
};

export default AddAirport;
