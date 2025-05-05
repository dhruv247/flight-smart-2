import React, {useState} from 'react';
import AddCity from './AddCity';
import ViewCities from './ViewCities';

const CitiesDashboard = () => {
	const [dashboardOption, setDashboardOption] = useState('addCity');

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
						id="addCity"
						value="addCity"
						checked={dashboardOption === 'addCity'}
						onChange={handleDashboardOptionChange}
          />
          <label htmlFor="addCity" className='btn btn-outline-primary'>
            Add City
          </label>

          <input
						type="radio"
						className="btn-check"
						name="dashboardOption"
						id="viewCities"
						value="viewCities"
						checked={dashboardOption === 'viewCities'}
						onChange={handleDashboardOptionChange}
          />
          <label htmlFor="viewCities" className='btn btn-outline-primary'>
            View Cities
          </label>
				</div>
      </div>
      
      {dashboardOption === "addCity" ? (
        <AddCity />
      ) : (
        <ViewCities />
      )}
		</div>
	);
};

export default CitiesDashboard;
