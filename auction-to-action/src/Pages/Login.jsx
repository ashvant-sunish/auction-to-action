import { Box, Button, Divider } from '@chakra-ui/react'
import React from 'react'
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  return (
    <Box className="login-container">
      <Button colorScheme='blue' onClick={() => navigate('/admindashboard')}>
        Admin Login
      </Button>
      <br /><br />
      <Divider orientation='horizontal' />
      <br /><br />
      <Button colorScheme='green' onClick={() => navigate('/userdashboard')}>
        User Login
      </Button>
    </Box>
  )
}

export default Login
