import React, { useState, useEffect } from 'react'
import { Box, Spinner, Text, Alert, AlertIcon } from '@chakra-ui/react'
import RevealBoxRound2 from './mysterybox/revealbox.Round2';
import FormRound2 from './mysterybox/Form.Round2';
import serverUrl from '../../../../servercon';

function Round2() {
  const [adminInfo, setAdminInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch admin info to determine role
  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          setError('No admin token found. Please log in.');
          setLoading(false);
          return;
        }

        const response = await fetch(`${serverUrl}/api/admin/verify-role`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Transform the role data to match what we need
          const adminInfo = {
            role: data.role,
            userId: data.userId,
            canReveal: data.role === 'superadmin'
          };
          setAdminInfo(adminInfo);
          console.log('Admin info loaded:', adminInfo);
        } else if (response.status === 401) {
          setError('Invalid or expired token. Please log in again.');
        } else {
          setError('Failed to fetch admin information');
        }
      } catch (error) {
        console.error('Error fetching admin info:', error);
        setError('Error loading admin information');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminInfo();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="300px">
        <Spinner size="xl" color="blue.500" />
        <Text ml={4}>Loading admin information...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <Box>
          <Text fontWeight="bold">Authentication Error</Text>
          <Text>{error}</Text>
        </Box>
      </Alert>
    );
  }

  if (!adminInfo) {
    return (
      <Alert status="warning">
        <AlertIcon />
        <Box>
          <Text fontWeight="bold">Access Denied</Text>
          <Text>Unable to verify admin permissions.</Text>
        </Box>
      </Alert>
    );
  }

  return (
    <div>
      {adminInfo.canReveal ? (
        <RevealBoxRound2 />
      ) : (
        <FormRound2 />
      )}
    </div>
  )
}

export default Round2
