import React, {useState} from 'react';
import AddPlane from './AddPlane';
import ViewPlane from './ViewPlane';

/**
 * Admin Dashboard Planes - dashboard to add and view planes
 */
const AdminDashboardPlanes = () => {

  const [dashboardOption, setDashboardOption] = useState('addPlane');

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
            id="addPlane"
            value="addPlane"
            checked={dashboardOption === 'addPlane'}
            onChange={handleDashboardOptionChange}
          />
          <label htmlFor="addPlane" className="btn btn-outline-primary">
            Add Plane
          </label>

          <input
            type="radio"
            className="btn-check"
            name="dashboardOption"
            id="viewPlanes"
            value="viewPlanes"
            checked={dashboardOption === 'viewPlanes'}
            onChange={handleDashboardOptionChange}
          />
          <label htmlFor="viewPlanes" className="btn btn-outline-primary">
            View Planes
          </label>
        </div>
      </div>

      {dashboardOption === "addPlane" ? (
        <AddPlane />
      ) : (
        <ViewPlane />
      )}
    </div>
  )
}

export default AdminDashboardPlanes;