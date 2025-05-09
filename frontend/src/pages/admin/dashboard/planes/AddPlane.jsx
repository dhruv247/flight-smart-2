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
				<div className="row">
					<div className="col-md-4"></div>
					<div className="col-md-4 col-12">
						<div className="mb-4">
							<label htmlFor="planeName" className="form-label">
								Plane Name
							</label>
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
							<label htmlFor="businessCapacity" className="form-label">
								Business Class Capacity
								<small className="text-muted ms-2">
									(4-20, divisible by 2)
								</small>
							</label>
							<div className="input-group">
								<input
									type="number"
									className={`form-control ${
										errors.businessCapacity ? 'is-invalid' : ''
									}`}
									id="businessCapacity"
									name="businessCapacity"
									placeholder="Enter Business Capacity"
									value={planeDetails.businessCapacity}
									onChange={handlePlaneDetailsChange}
									min="4"
									max="20"
									step="2"
								/>
							</div>
							{errors.businessCapacity && (
								<div className="invalid-feedback">
									{errors.businessCapacity}
								</div>
							)}
						</div>

						<div className="mb-4">
							<label htmlFor="economyCapacity" className="form-label">
								Economy Class Capacity
								<small className="text-muted ms-2">
									(12-60, divisible by 6)
								</small>
							</label>
							<div className="input-group">
								<input
									type="number"
									className={`form-control ${
										errors.economyCapacity ? 'is-invalid' : ''
									}`}
									id="economyCapacity"
									name="economyCapacity"
									placeholder="Enter Economy Capacity"
									value={planeDetails.economyCapacity}
									onChange={handlePlaneDetailsChange}
									min="12"
									max="60"
									step="6"
								/>
							</div>
							{errors.economyCapacity && (
								<div className="invalid-feedback">{errors.economyCapacity}</div>
							)}
						</div>

						<div className="mb-4">
							<div>
								<button type="submit" className="btn btn-primary">
									Add Plane
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

export default AddPlane;
