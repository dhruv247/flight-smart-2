import React, {useState} from 'react';
import AddFlight from './AddFlight';
import ViewFlights from './ViewFlightsDuplicate';

const AirlineDashboardFlights = () => {
	const [dashboardOption, setDashboardOption] = useState('addFlight');

	const handleDashboardOptionChange = (e) => {
		setDashboardOption(e.target.value);
	};

	return (
		<div className="container mt-3 text-center">
			<div className="mb-3">
				<div className="btn-group" role="group">
					<input
						type="radio"
						className="btn-check"
						name="dashboardOption"
						id="addFlight"
						value="addFlight"
						checked={dashboardOption === 'addFlight'}
						onChange={handleDashboardOptionChange}
          />
          <label htmlFor="addFlight" className='btn btn-outline-primary'>
            Add Flight
          </label>

          <input
						type="radio"
						className="btn-check"
						name="dashboardOption"
						id="viewFlights"
						value="viewFlights"
						checked={dashboardOption === 'viewFlights'}
						onChange={handleDashboardOptionChange}
          />
          <label htmlFor="viewFlights" className='btn btn-outline-primary'>
            View Flights
          </label>
				</div>
      </div>
      
      {dashboardOption === "addFlight" ? (
        <AddFlight />
      ) : (
        <ViewFlights />
      )}
		</div>
	);
};

export default AirlineDashboardFlights;
