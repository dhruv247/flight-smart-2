import React from 'react';
import {
	verifyAirline,
	deleteAirline,
} from '../../../../services/auth.service';
import { showSuccessToast, showErrorToast } from '../../../../utils/toast';

const UnverifiedAirlineCard = ({ airline }) => {
	const handleVerify = async () => {
		try {
			await verifyAirline(airline._id);
			showSuccessToast('Airline verified successfully!');
			window.location.reload(); // refresh needed to fetch new list
		} catch (error) {
			console.error('Error verifying airline:', error);
			showErrorToast('Failed to verify airline. Please try again.');
		}
	};

	const handleReject = async () => {
		try {
			await deleteAirline(airline._id);
			showSuccessToast('Airline rejected successfully!');
			// Refresh the page to update the list
			window.location.reload();
		} catch (error) {
			console.error('Error rejecting airline:', error);
			showErrorToast('Failed to reject airline. Please try again.');
		}
	};

	return (
		<div className="row">
			<div className="col-md-2"></div>
			<div className="col-md-8 row d-flex align-items-center border rounded p-2 m-0">
				<p className="col-12 col-md-3">{airline.username}</p>
				<p className="col-12 col-md-5">{airline.email}</p>
				<div className="col-12 col-md-4 d-flex gap-2 justify-content-center">
					<button className="btn btn-success" onClick={handleVerify}>
						Verify
					</button>
					<button className="btn btn-danger" onClick={handleReject}>
						Reject
					</button>
				</div>
			</div>
			<div className="col-md-2"></div>
		</div>
	);
};

export default UnverifiedAirlineCard;
