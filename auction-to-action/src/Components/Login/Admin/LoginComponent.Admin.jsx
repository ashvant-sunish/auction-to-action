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
      await new Promise((r) => setTimeout(r, 1500));
      if (
        formData.username === "admin" &&
        formData.password === "password123"
      ) {
        setMessageType("success");
        setMessage("Login Successful! Redirecting to the Admin Dashboard...");
        setTimeout(() => navigate("/admindashboard"), 1000);
      } else {
        setMessageType("error");
        setMessage("Invalid admin username or password.");
      }
    } catch {
      setMessageType("error");
      setMessage("Something went wrong. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const CustomAlert = ({ status, children }) => {
    const cfg = {
      success: {
        bg: "green.50",
        borderColor: "green.200",
        color: "green.800",
        icon: AiOutlineCheckCircle,
        iconColor: "green.500",
      },
      error: {
        bg: "red.50",
        borderColor: "red.200",
        color: "red.800",
        icon: AiOutlineExclamationCircle,
        iconColor: "red.500",
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
      <Card maxW="420px" w="100%" boxShadow="xl" bg="white" borderRadius="lg">
        <CardBody p={8}>
          <VStack spacing={6}>
            <Box textAlign="center">
              <Heading as="h1" size="lg" color="gray.800">
                Admin Portal
              </Heading>
              <Text color="gray.500" fontSize="md" mt={2}>
                Sign in to access the dashboard
              </Text>
            </Box>
            {message && (
              <CustomAlert status={messageType}>{message}</CustomAlert>
            )}
            <Box as="form" w="100%" onSubmit={handleSubmit} noValidate>
              <VStack spacing={5}>
                <FormControl isInvalid={!!errors.username}>
                  <FormLabel
                    htmlFor="username"
                    color="gray.700"
                    fontWeight="semibold"
                    fontSize="sm"
                  >
                    Username
                  </FormLabel>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="e.g., admin"
                    value={formData.username}
                    onChange={handleInputChange}
                    focusBorderColor="purple.500"
                    bg="gray.50"
                  />
                  {errors.username && (
                    <Text color="red.500" fontSize="xs" mt={1}>
                      {errors.username}
                    </Text>
                  )}
                </FormControl>
                <FormControl isInvalid={!!errors.password}>
                  <FormLabel
                    htmlFor="password"
                    color="gray.700"
                    fontWeight="semibold"
                    fontSize="sm"
                  >
                    Password
                  </FormLabel>
                  <InputGroup>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      focusBorderColor="purple.500"
                      bg="gray.50"
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        icon={
                          <Icon
                            as={
                              showPassword
                                ? AiOutlineEyeInvisible
                                : AiOutlineEye
                            }
                          />
                        }
                        size="sm"
                        variant="ghost"
                        onClick={togglePasswordVisibility}
                      />
                    </InputRightElement>
                  </InputGroup>
                  {errors.password && (
                    <Text color="red.500" fontSize="xs" mt={1}>
                      {errors.password}
                    </Text>
                  )}
                </FormControl>
                <Button
                  type="submit"
                  colorScheme="purple"
                  size="lg"
                  w="100%"
                  isLoading={isLoading}
                  loadingText="Signing in..."
                  mt={4}
                  _hover={{ bg: "purple.600" }}
                >
                  Sign In
                </Button>
              </VStack>
            </Box>
          </VStack>
        </CardBody>
      </Card>
  );
}

export default LoginComponentAdmin;