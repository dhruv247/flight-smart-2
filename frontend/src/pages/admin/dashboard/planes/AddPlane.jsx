import React, { useState } from 'react';
import axios from 'axios';
import { showSuccessToast, showErrorToast } from '../../../../utils/toast';

const AddPlane = () => {
	const [planeDetails, setPlaneDetails] = useState({
		planeName: '',
		economyCapacity: '',
		businessCapacity: '',
	});

	const [errors, setErrors] = useState({
		planeName: '',
		economyCapacity: '',
		businessCapacity: '',
	});

	const validateForm = () => {
		const newErrors = {};
		let isValid = true;

		if (!planeDetails.planeName.trim()) {
			newErrors.planeName = 'Plane name is required';
			isValid = false;
		}

		if (!planeDetails.businessCapacity) {
			newErrors.businessCapacity = 'Business capacity is required';
			isValid = false;
		} else {
			const businessCap = parseInt(planeDetails.businessCapacity);
			if (businessCap < 4 || businessCap > 20) {
				newErrors.businessCapacity =
					'Business capacity must be between 4 and 20';
				isValid = false;
			} else if (businessCap % 2 !== 0) {
				newErrors.businessCapacity = 'Business capacity must be divisible by 2';
				isValid = false;
			}
		}

		if (!planeDetails.economyCapacity) {
			newErrors.economyCapacity = 'Economy capacity is required';
			isValid = false;
		} else {
			const economyCap = parseInt(planeDetails.economyCapacity);
			if (economyCap < 12 || economyCap > 60) {
				newErrors.economyCapacity =
					'Economy capacity must be between 12 and 60';
				isValid = false;
			} else if (economyCap % 6 !== 0) {
				newErrors.economyCapacity = 'Economy capacity must be divisible by 6';
				isValid = false;
			}
		}

		setErrors(newErrors);
		return isValid;
	};

	const handlePlaneDetailsChange = (e) => {
		const { name, value } = e.target;
		setPlaneDetails((prevData) => ({
			...prevData,
			[name]: value,
		}));
		// Clear error when user starts typing
		setErrors((prevErrors) => ({
			...prevErrors,
			[name]: '',
		}));
	};

	const handleAddPlane = async (event) => {
		event.preventDefault();

		if (!validateForm()) {
			return;
		}

		try {
			const response = await axios.post(
				'http://localhost:8000/api/planes/add-plane',
				planeDetails,
				{
					withCredentials: true,
				}
			);

			if (response.status === 201) {
				showSuccessToast('Plane added successfully!');
				// Reset form fields
				setPlaneDetails({
					planeName: '',
					economyCapacity: '',
					businessCapacity: '',
				});
				setErrors({});
			}
		} catch (error) {
			showErrorToast(error.response?.data?.message || 'Failed to add plane');
		}
	};

	return (
		<div className="mt-5">
			<form onSubmit={handleAddPlane}>
				<div className="d-flex flex-column gap-4 justify-content-center">
					<div className="mb-4">
						<p className="text-start fw-bold">Plane Name</p>
						<div className="input-group">
							<input
								type="text"
								className={`form-control ${
									errors.planeName ? 'is-invalid' : ''
								}`}
								id="planeName"
								name="planeName"
								placeholder="Enter Plane Name"
								value={planeDetails.planeName}
								onChange={handlePlaneDetailsChange}
							/>
						</div>
						{errors.planeName && (
							<div className="invalid-feedback">{errors.planeName}</div>
						)}
					</div>

					<div className="mb-4">
						<p className="text-start fw-bold">Business Class Capacity</p>
						<div className="input-group">
							<select
								name="businessCapacity"
								id="businessCapacity"
								className="form-select"
								required
								onChange={handlePlaneDetailsChange}
								value={planeDetails.businessCapacity}
							>
								<option value="">Select Business Capacity</option>

								<option value="6">6</option>

								<option value="12">12</option>

								<option value="18">18</option>

								<option value="24">24</option>
							</select>
						</div>
						{errors.businessCapacity && (
							<div className="invalid-feedback">{errors.businessCapacity}</div>
						)}
					</div>

					<div className="mb-4">
						<p className="text-start fw-bold">Economy Class Capacity</p>
						<div className="input-group">
							<select
								name="economyCapacity"
								id="economyCapacity"
								className="form-select"
								required
								onChange={handlePlaneDetailsChange}
								value={planeDetails.economyCapacity}
							>
								<option value="">Select Economy Capacity</option>

								<option value="18">18</option>

								<option value="36">36</option>

								<option value="54">54</option>

								<option value="72">72</option>
							</select>
						</div>
						{errors.economyCapacity && (
							<div className="invalid-feedback">{errors.economyCapacity}</div>
						)}
					</div>

					<div>
						<button type="submit" className="btn btn-primary px-5 py-3">
							Add Plane
						</button>
					</div>
				</div>
			</form>
		</div>
	);
};

export default AddPlane;
