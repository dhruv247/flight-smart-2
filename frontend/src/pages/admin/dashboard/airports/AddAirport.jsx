import React, { useState, useRef } from 'react';
import { imageService } from '../../../../services/image.service';
import { showSuccessToast, showErrorToast } from '../../../../utils/toast';
import { airportsService } from '../../../../services/airport.service';

const AddAirport = () => {
	// form ref to reset form
	const formRef = useRef(null);

	const [isLoading, setIsLoading] = useState(false);

	const [airportDetails, setAirportDetails] = useState({
		airportName: '',
		airportCode: '',
		city: '',
		image: '',
	});

	const [errors, setErrors] = useState({
		airportName: '',
		airportCode: '',
	});

	const validateAirportName = (name) => {
		if (/\d/.test(name)) {
			return 'Airport name cannot contain numbers';
		}
		return '';
	};

	const validateAirportCode = (code) => {
		if (!/^[A-Za-z]{3}$/.test(code)) {
			return 'Airport code must be exactly 3 letters';
		}
		return '';
	};

	const handleAirportChange = (e) => {
		const { name, value } = e.target;
		setAirportDetails((prevData) => ({
			...prevData,
			[name]: value,
		}));

		// Validate fields
		if (name === 'airportName') {
			setErrors((prev) => ({
				...prev,
				airportName: validateAirportName(value),
			}));
		} else if (name === 'airportCode') {
			setErrors((prev) => ({
				...prev,
				airportCode: validateAirportCode(value),
			}));
		}
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
		setIsLoading(true);

		event.preventDefault();

		// Validate all fields before submission
		const nameError = validateAirportName(airportDetails.airportName);
		const codeError = validateAirportCode(airportDetails.airportCode);

		if (nameError || codeError) {
			setErrors({
				airportName: nameError,
				airportCode: codeError,
			});
			showErrorToast('Please fix the validation errors before submitting');
			return;
		}

		const formData = new FormData();
		formData.append('image', airportDetails.image);

		try {
			const imageURLResponse = await imageService.uploadImage(formData);

			if (!imageURLResponse.data.url) {
				throw new Error(
					imageURLResponse.data.message || 'Failed to upload airport image'
				);
			}

			const airportImageUrl = imageURLResponse.data.url;

			const airport = {
				airportName: airportDetails.airportName,
				airportCode: airportDetails.airportCode.toUpperCase(),
				city: airportDetails.city,
				image: airportImageUrl,
			};

			const response = await airportsService.addAirport(airport);

			if (response.data.message === 'Airport created successfully') {
				showSuccessToast('Airport added successfully!');
				setAirportDetails({
					airportName: '',
					airportCode: '',
					city: '',
					image: '',
				});
				setErrors({
					airportName: '',
					airportCode: '',
				});
				formRef.current.reset();
			}
		} catch (error) {
			showErrorToast(error.response.data.message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="mt-5">
			<form ref={formRef} action="" onSubmit={handleAddAirport}>
				<div className="d-flex flex-column gap-4 justify-content-center mb-3">
					<div>
						<p className="text-start fw-bold">Airport Name</p>
						<input
							type="text"
							name="airportName"
							className={`form-control ${
								errors.airportName ? 'is-invalid' : ''
							}`}
							placeholder="Enter Airport Name"
							onChange={handleAirportChange}
							value={airportDetails.airportName}
							required
						/>
						{errors.airportName && (
							<div className="invalid-feedback">{errors.airportName}</div>
						)}
					</div>

					<div>
						<p className="text-start fw-bold">Airport Code</p>
						<input
							type="text"
							name="airportCode"
							className={`form-control ${
								errors.airportCode ? 'is-invalid' : ''
							}`}
							placeholder="Enter 3 Letter (XYZ) Airport Code"
							onChange={handleAirportChange}
							value={airportDetails.airportCode}
							maxLength={3}
							required
						/>
						{errors.airportCode && (
							<div className="invalid-feedback">{errors.airportCode}</div>
						)}
					</div>

					<div>
						<p className="text-start fw-bold">City</p>
						<select
							className="form-select"
							name="city"
							onChange={handleAirportChange}
							value={airportDetails.city}
							required
						>
							<option value="">Select City</option>
							<option value="Pune">Pune</option>
							<option value="Ahmedabad">Ahmedabad</option>
							<option value="Cochin">Cochin</option>
							<option value="Dabolim">Dabolim</option>
							<option value="Lucknow">Lucknow</option>
							<option value="Varanasi">Varanasi</option>
							<option value="Jaipur">Jaipur</option>
							<option value="Bhubaneswar">Bhubaneswar</option>
							<option value="Guwahati">Guwahati</option>
							<option value="Nagpur">Nagpur</option>
							<option value="Patna">Patna</option>
							<option value="Raipur">Raipur</option>
							<option value="Bhopal">Bhopal</option>
							<option value="Indore">Indore</option>
							<option value="Chandigarh">Chandigarh</option>
							<option value="Srinagar">Srinagar</option>
							<option value="Mumbai">Mumbai</option>
							<option value="New Delhi">New Delhi</option>
							<option value="Kolkata">Kolkata</option>
							<option value="Bengaluru">Bengaluru</option>
							<option value="Chennai">Chennai</option>
							<option value="Hyderabad">Hyderabad</option>
						</select>
					</div>

					<div>
						<p className="text-start fw-bold">City Image</p>
						<input
							type="file"
							name="image"
							className="form-control"
							accept="image/*"
							onChange={handleAirportImageChange}
							required
						/>
					</div>

					<div>
						<button
							type="submit"
							className="btn btn-primary px-5 py-3"
							disabled={errors.airportName || errors.airportCode}
						>
							{isLoading ? (
								<div className="spinner-border spinner-border-sm" role="status">
									{/* <span className="visually-hidden">Loading...</span> */}
								</div>
							) : (
								'Add Airport'
							)}
						</button>
					</div>
				</div>
			</form>
		</div>
	);
};

export default AddAirport;
