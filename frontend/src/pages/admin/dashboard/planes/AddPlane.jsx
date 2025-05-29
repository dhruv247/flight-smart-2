import React, { useState } from 'react';
import { showSuccessToast, showErrorToast } from '../../../../utils/toast';
import { planeService } from '../../../../services/plane.service';

/**
 * Add Plane
 */
const AddPlane = () => {
	const [planeDetails, setPlaneDetails] = useState({
		planeName: '',
		economyCapacity: '',
		businessCapacity: '',
	});

	const [errors, setErrors] = useState({
		planeName: '',
		economyCapacity: '',
	});

	const [isLoading, setIsLoading] = useState(false);

	/**
	 * Validate the form (frontend validation)
	 * @returns {boolean} - Whether the form is valid
	 */
	const validateForm = () => {
		const newErrors = {};
		let isValid = true;

		if (!planeDetails.planeName.trim()) {
			newErrors.planeName = 'Plane name is required';
			isValid = false;
		}

		// Convert to numbers and check if they exist before comparing
		const economyCap = Number(planeDetails.economyCapacity);
		const businessCap = Number(planeDetails.businessCapacity);

		if (economyCap && businessCap && economyCap <= businessCap) {
			newErrors.economyCapacity =
				'Economy capacity must be greater than business capacity';
			isValid = false;
		}

		setErrors(newErrors);
		return isValid;
	};

	/**
	 * Handle plane details change
	 * @param {Object} e - The event object
	 */
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

	/**
	 * Handle add plane
	 * @param {Object} event - The event object
	 */
	const handleAddPlane = async (event) => {
		event.preventDefault();

		setIsLoading(true);

		if (!validateForm()) {
			showErrorToast(errors.planeName || errors.economyCapacity);
			setIsLoading(false);
			return;
		}

		try {
			const response = await planeService.addPlane(planeDetails);

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
			showErrorToast(error.response.data.message);
		} finally {
			setIsLoading(false);
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
						<p className="text-start fw-bold">Business Class Capacity (Less than Economy Capacity)</p>
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
						<p className="text-start fw-bold">Economy Class Capacity (Greater than Business Capacity)</p>
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
							{isLoading ? (
								<div className="spinner-border spinner-border-sm" role="status">
									{/* <span className="visually-hidden">Loading...</span> */}
								</div>
							) : (
								'Add Plane'
							)}
						</button>
					</div>
				</div>
			</form>
		</div>
	);
};

export default AddPlane;
