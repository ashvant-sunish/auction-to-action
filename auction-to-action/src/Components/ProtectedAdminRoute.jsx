import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { adminAuth } from '../utils/adminApi';
import { Spinner, Center, Box } from '@chakra-ui/react';

const ProtectedAdminRoute = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication on component mount
    const checkAuth = () => {
      const authStatus = adminAuth.isAuthenticated();
      setIsAuthenticated(authStatus);
      setIsChecking(false);
    };

    checkAuth();
  }, []);

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <Center h="100vh" bg="primary.200">
        <Box textAlign="center">
          <Spinner size="xl" color="blue.500" thickness="4px" />
        </Box>
      </Center>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace={true} />;
  }

  // Return the protected component if authenticated
  return children;
};

export default ProtectedAdminRoute;
