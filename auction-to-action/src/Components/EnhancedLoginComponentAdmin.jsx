import React, { useState } from 'react';
import { adminAuth } from '../../utils/adminApi';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  IconButton,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Card,
  CardBody,
  Icon,
  Alert,
  AlertIcon
} from "@chakra-ui/react";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineCheckCircle,
  AiOutlineExclamationCircle,
} from "react-icons/ai";
import { useNavigate } from "react-router-dom";

function EnhancedLoginComponentAdmin({ children }) {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = "Username is required.";
    else if (formData.username.length < 3)
      newErrors.username = "Username must be at least 3 characters.";
    if (!formData.password) newErrors.password = "Password is required.";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setMessage("");

    try {
      const response = await adminAuth.login({
        username: formData.username,
        password: formData.password,
      });

      setMessageType("success");
      setMessage(response.message || "Login successful!");
      
      // Navigate to admin dashboard
      setTimeout(() => navigate("/admindashboard"), 1000);
    } catch (err) {
      setMessageType("error");
      if (err.response && err.response.data && err.response.data.message) {
        setMessage(err.response.data.message);
      } else {
        setMessage("Something went wrong. Try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced version with better integration
  return (
    <Box position="relative">
      {/* Enhanced login form with backend integration */}
      {message && (
        <Alert status={messageType} mb={4} borderRadius="md">
          <AlertIcon />
          {message}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isInvalid={!!errors.username}>
            <FormLabel>Username</FormLabel>
            <Input
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter your username"
              bg="white"
            />
            {errors.username && (
              <Text color="red.500" fontSize="sm" mt={1}>
                {errors.username}
              </Text>
            )}
          </FormControl>

          <FormControl isInvalid={!!errors.password}>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                bg="white"
              />
              <InputRightElement>
                <IconButton
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  icon={showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  onClick={togglePasswordVisibility}
                  variant="ghost"
                  size="sm"
                />
              </InputRightElement>
            </InputGroup>
            {errors.password && (
              <Text color="red.500" fontSize="sm" mt={1}>
                {errors.password}
              </Text>
            )}
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            width="full"
            isLoading={isLoading}
            loadingText="Signing in..."
          >
            Sign In
          </Button>
        </VStack>
      </form>

      {/* Render the original component as fallback */}
      {children}
    </Box>
  );
}

export default EnhancedLoginComponentAdmin;
