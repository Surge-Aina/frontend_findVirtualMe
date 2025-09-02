import React from 'react';
import ProjectUploadForm from '../components/ProjectUploadForm'; 

const DashboardPage = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Your Dashboard</h1>
      <p>Manage your portfolio content here.</p>
      
      <hr style={{ margin: '2rem 0' }} />

      <ProjectUploadForm />
    </div>
  );
};

export default DashboardPage;
