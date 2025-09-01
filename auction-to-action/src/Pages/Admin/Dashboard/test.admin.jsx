import React, { useState } from 'react'
import HeaderAdmin from '../../../Components/Admin/Header/Header.Admin';
import NavbarAdmin from '../../../Components/Admin/Navbar/Navbar.Admin';
import { Box } from '@chakra-ui/react';
import DashboardContentAdmin from '../../../Components/Admin/Content/DashboardContent.Admin';
import SettingsContentAdmin from '../../../Components/Admin/Content/SettingsContent.Admin';
import AdminManagementAdmin from '../../../Components/Admin/Content/AdminManagement.Admin';
import TeamsManagementAdmin from '../../../Components/Admin/Content/TeamsManagement.Admin';
import BidHistoryAdmin from '../../../Components/Admin/Content/BidHistory.Admin';

function TestAdmin() {
    const [file, setfile] = useState('dashboard');
    let content = <DashboardContentAdmin />;
    switch (file) {
        case 'dashboard':
            content = <DashboardContentAdmin />;
            break;
        case 'bidhistory':
            content = <BidHistoryAdmin />;
            break;
        case 'adminmanagement':
            content = <AdminManagementAdmin />;
            break;
        case 'teamsmanagement':
            content = <TeamsManagementAdmin />;
            break;
        case 'settings':
            content = <SettingsContentAdmin />;
            break;

        default:
            content = <DashboardContentAdmin />;
            break;
    }
  return (
    <Box 
      bg="primary.200" 
      minH="100vh" 
      w="100%" 
      position="relative"
      overflow="hidden"
      scrollBehavior="smooth"
    >
      <HeaderAdmin setfile={setfile} file={file} />
      <NavbarAdmin setfile={setfile} file={file} />
      <Box minH="calc(100vh - 0px)" w="100%">
        {content}
      </Box>
    </Box>
  )
}

export default TestAdmin;
