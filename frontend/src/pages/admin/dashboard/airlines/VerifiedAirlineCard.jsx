import React from 'react';

/**
 * Verified Airline Card
 */
const VerifiedAirlineCard = ({airline}) => {
  return (
    <div className="row">
			<div className="col-md-2"></div>
			<div className="col-md-8 row d-flex align-items-center border rounded p-2 m-0">
				<p className="col-12 col-md-4">{airline.username}</p>
				<p className="col-12 col-md-4">{airline.email}</p>
				<p className="col-12 col-md-4">{airline.updatedAt.split('T')[0]}</p>
			</div>
			<div className="col-md-2"></div>
		</div>
  )
}

export default VerifiedAirlineCard