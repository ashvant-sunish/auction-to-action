import React, { useState } from "react";
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
} from "@chakra-ui/react";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineCheckCircle,
  AiOutlineExclamationCircle,
} from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import serverUrl from "../../../servercon";


function LoginComponentAdmin() {
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
      const response = await axios.post(
        `${serverUrl}/api/admin/login`,
        {
          username: formData.username,
          password: formData.password,
        }
      );

      // Store token and user data for authentication
      console.log('🔑 Storing admin token:', response.data.token);
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminUser', JSON.stringify({
        username: formData.username,
        role: 'admin'
      }));
      console.log('✅ Token stored successfully');

      setMessageType("success");
      setMessage(response.data.message);
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

  const CustomAlert = ({ status, children }) => {
    const cfg = {
      success: {
        bg: "green.900",
        borderColor: "green.700",
        color: "green.100",
        icon: AiOutlineCheckCircle,
        iconColor: "green.300",
      },
      error: {
        bg: "red.900",
        borderColor: "red.700",
        color: "red.100",
        icon: AiOutlineExclamationCircle,
        iconColor: "red.300",
      },
    }[status];
    if (!cfg) return null;
    return (
      <Box
        p={3}
        bg={cfg.bg}
        border="1px solid"
        borderColor={cfg.borderColor}
        borderRadius="md"
        display="flex"
        alignItems="center"
        gap={3}
        w="100%"
      >
        <Icon as={cfg.icon} color={cfg.iconColor} w={5} h={5} />
        <Text color={cfg.color} fontSize="sm" fontWeight="medium">
          {children}
        </Text>
      </Box>
    );
  };

  return (
    <Box
      bg="rgba(255,255,255,0.15)"
      borderRadius="2xl"
      p={{ base: 10, md: 12 }}
    >
      <VStack spacing={6}>
        <Heading
          as="h1"
          size="2xl"
          color="white"
          fontFamily="'Inter', sans-serif"
          p={{ base: 5 }}
        >
          Admin Login
        </Heading>
        {message && <CustomAlert status={messageType}>{message}</CustomAlert>}
        <Box as="form" w="100%" onSubmit={handleSubmit} noValidate>
          <VStack spacing={5}>
            <FormControl isInvalid={!!errors.username}>
              <FormLabel htmlFor="username" color="gray.200">
                Username
              </FormLabel>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="admin"
                value={formData.username}
                onChange={handleInputChange}
                bg="rgba(255, 255, 255, 0.1)"
                borderColor="rgba(255, 255, 255, 0.2)"
                color="white"
                borderRadius="lg"
                size="lg"
                _placeholder={{ color: "gray.400" }}
              />
              {errors.username && (
                <Text color="red.400" fontSize="xs" mt={1}>
                  {errors.username}
                </Text>
              )}
            </FormControl>
            <FormControl isInvalid={!!errors.password}>
              <FormLabel htmlFor="password" color="gray.200">
                Password
              </FormLabel>
              <InputGroup>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  bg="rgba(255, 255, 255, 0.1)"
                  borderColor="rgba(255, 255, 255, 0.2)"
                  color="white"
                  borderRadius="lg"
                  size="lg"
                  _placeholder={{ color: "gray.400" }}
                />
                <InputRightElement h="full">
                  <IconButton
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    icon={
                      <Icon
                        as={showPassword ? AiOutlineEyeInvisible : AiOutlineEye}
                        color="gray.300"
                      />
                    }
                    variant="ghost"
                    onClick={togglePasswordVisibility}
                    _hover={{ bg: "transparent" }}
                  />
                </InputRightElement>
              </InputGroup>
              {errors.password && (
                <Text color="red.400" fontSize="xs" mt={1}>
                  {errors.password}
                </Text>
              )}
            </FormControl>
            <Button
              type="submit"
              bg="gray.50"
              color="gray.900"
              size="lg"
              w="100%"
              isLoading={isLoading}
              loadingText="Signing in..."
              mt={4}
              borderRadius="xl"
              _hover={{ bg: "gray.200" }}
            >
              Login
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}

export default LoginComponentAdmin;
