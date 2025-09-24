import React from 'react';
import SpinningCardWheel from './spinthewheel/SpinningCardWheel';
import FormRound1 from './spinthewheel/Form.Round1';

function Round1() {
  // Get admin user data from localStorage
  const getAdminUser = () => {
    try {
      const userData = localStorage.getItem('adminUser');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  };

  const adminUser = getAdminUser();
  const adminRole = adminUser?.role;

  return (
    <div>
      { adminRole === "superadmin" ? <SpinningCardWheel /> : <FormRound1 /> }
    </div>
  )
}

export default Round1;