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
  Link,
} from "@chakra-ui/react";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineCheckCircle,
  AiOutlineExclamationCircle,
} from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import serverUrl from './../../../servercon';


function LoginComponentUser() {
  const [formData, setFormData] = useState({
    teamNumber: "",
    teamCredential: "",
  });
  const [showCode, setShowCode] = useState(false);
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

  const toggleCodeVisibility = () => setShowCode(!showCode);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.teamNumber)
      newErrors.teamNumber = "Register Number is required.";
    else if (formData.teamNumber.length < 3)
      newErrors.teamNumber = "Register Number must be at least 3 characters.";

    if (!formData.teamCredential)
      newErrors.teamCredential = "Password is required.";
    else if (formData.teamCredential.length < 4)
      newErrors.teamCredential = "Password must be at least 4 characters.";

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
        `${serverUrl}/api/team/login`,
        {
          teamCode: formData.teamNumber,
          password: formData.teamCredential,
        }
      );

      setMessageType("success");
      setMessage(response.data.message);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("rulestate", "false");
      localStorage.setItem("rulebutton", "false");
      setTimeout(() => navigate("/userdashboard"), 1000);
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
          Team Login
        </Heading>

        {message && <CustomAlert status={messageType}>{message}</CustomAlert>}
        <Box as="form" w="100%" onSubmit={handleSubmit} noValidate>
          <VStack spacing={5}>
            <FormControl isInvalid={!!errors.teamNumber}>
              <FormLabel htmlFor="teamNumber" color="gray.200">
                Team Registration Number
              </FormLabel>
              <Input
                id="teamNumber"
                name="teamNumber"
                type="text"
                placeholder="e.g: TEAM101"
                value={formData.teamNumber}
                onChange={handleInputChange}
                bg="rgba(255, 255, 255, 0.1)"
                borderColor="rgba(255, 255, 255, 0.2)"
                color="white"
                borderRadius="lg"
                size="lg"
                _placeholder={{ color: "gray.400" }}
              />
              {errors.teamNumber && (
                <Text color="red.500" fontSize="xs" mt={1}>
                  {errors.teamNumber}
                </Text>
              )}
            </FormControl>

            <FormControl isInvalid={!!errors.teamCredential}>
              <FormLabel htmlFor="teamCredential" color="gray.200">
                Password
              </FormLabel>
              <InputGroup>
                <Input
                  id="teamCredential"
                  name="teamCredential"
                  type={showCode ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.teamCredential}
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
                    aria-label={showCode ? "Hide code" : "Show code"}
                    icon={
                      <Icon
                        as={showCode ? AiOutlineEyeInvisible : AiOutlineEye}
                        color="gray.300"
                      />
                    }
                    variant="ghost"
                    onClick={toggleCodeVisibility}
                    _hover={{ bg: "transparent" }}
                  />
                </InputRightElement>
              </InputGroup>
              {errors.teamCredential && (
                <Text color="red.400" fontSize="xs" mt={1}>
                  {errors.teamCredential}
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

export default LoginComponentUser;
