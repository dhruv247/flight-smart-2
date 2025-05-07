import React, { useState, useRef } from 'react';
import axios from 'axios';
import { showSuccessToast, showErrorToast } from '../../../../utils/toast';

const AddCity = () => {
	const formRef = useRef(null);
	const [cityDetails, setCityDetails] = useState({
		name: '',
		image: '',
	});

	const handleCityNameChange = (e) => {
		const { name, value } = e.target;
		setCityDetails((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

	const handleCityImageChange = (e) => {
		const { name } = e.target;
		const file = e.target.files[0];
		if (file) {
			setCityDetails((prev) => ({
				...prev,
				[name]: file,
			}));
		}
	};

	const handleAddCity = async (event) => {
		event.preventDefault();

		const formData = new FormData();
		formData.append('image', cityDetails.image);

		try {
			const imageURLResponse = await axios.post(
				'http://localhost:8000/api/images/upload',
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				}
			);

			if (!imageURLResponse.data.success) {
				throw new Error(
					imageURLResponse.data.message || 'Failed to upload document image'
				);
			}

			const documentImageUrl = imageURLResponse.data.url;

			const city = {
				name: cityDetails.name,
				image: documentImageUrl,
			};

			const response = await axios.post(
				'http://localhost:8000/api/cities/create',
				city,
				{
					withCredentials: true,
				}
			);

			if (response.data.success) {
				showSuccessToast('City added successfully!');
				setCityDetails({
					name: '',
					image: '',
				});
				formRef.current.reset();
			}
		} catch (error) {
			console.log(error.message);
			showErrorToast(error.message);
		}
	};

	return (
		<div className="mt-5">
			<form ref={formRef} action="" onSubmit={handleAddCity}>
				<div className="row">
					<div className="col-md-4"></div>
					<div className="col-md-4 col-12">
						<div className="mb-4">
							<div className="input-group">
								<input
									type="text"
									name="name"
									className="form-control"
									placeholder="Enter City Name"
									onChange={handleCityNameChange}
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
									onChange={handleCityImageChange}
								/>
							</div>
						</div>
						<div className="mb-4">
							<div>
								<button type="submit" className="btn btn-primary">
									Add City
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

export default AddCity;
