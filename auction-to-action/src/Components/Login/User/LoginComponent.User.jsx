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
  Image,
} from "@chakra-ui/react";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineCheckCircle,
  AiOutlineExclamationCircle,
} from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import serverUrl from "./../../../servercon";
import csedLogo from "../../../assets/images/csed.png";

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
      const response = await axios.post(`${serverUrl}/api/team/login`, {
        teamCode: formData.teamNumber,
        password: formData.teamCredential,
      });

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
        bg: "rgba(13, 17, 23, 0.95)",
        borderColor: "#e8ff00",
        color: "white",
        icon: AiOutlineCheckCircle,
        iconColor: "#e8ff00",
      },
      error: {
        bg: "rgba(13, 17, 23, 0.95)",
        borderColor: "red.500",
        color: "white",
        icon: AiOutlineExclamationCircle,
        iconColor: "red.400",
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
    <>
      <Image
        src={csedLogo}
        alt="CSED Logo"
        position="absolute"
        top="20px"
        left="20px"
        maxH="60px"
        objectFit="contain"
        zIndex={10}
      />
      <Box w="100%">
        <VStack spacing={6}>
          <Heading
            as="h2"
            size="xl"
            color="white"
            fontWeight="300"
            fontFamily="'Inter', sans-serif"
            mb={6}
            letterSpacing="wider"
          >
            Authenticate <Text as="span" color="#e8ff00" fontWeight="bold">Session</Text>
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
                  bg="transparent"
                  border="none"
                  borderBottom="2px solid rgba(255, 255, 255, 0.2)"
                  borderRadius="0"
                  _hover={{ borderColor: "rgba(255, 255, 255, 0.5)" }}
                  _focus={{ borderColor: "#e8ff00", boxShadow: "none", bg: "rgba(255,255,255,0.02)" }}
                  color="white"
                  size="lg"
                  px={2}
                  _placeholder={{ color: "gray.500", letterSpacing: "wide" }}
                  transition="all 0.3s"
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
                    bg="transparent"
                    border="none"
                    borderBottom="2px solid rgba(255, 255, 255, 0.2)"
                    borderRadius="0"
                    _hover={{ borderColor: "rgba(255, 255, 255, 0.5)" }}
                    _focus={{ borderColor: "#e8ff00", boxShadow: "none", bg: "rgba(255,255,255,0.02)" }}
                    color="white"
                    size="lg"
                    px={2}
                    _placeholder={{ color: "gray.500", letterSpacing: "wide" }}
                    transition="all 0.3s"
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
                bg="transparent"
                color="#e8ff00"
                border="1px solid #e8ff00"
                fontWeight="600"
                letterSpacing="widest"
                textTransform="uppercase"
                size="lg"
                w="100%"
                isLoading={isLoading}
                loadingText="INITIALIZING..."
                mt={8}
                borderRadius="0"
                transition="all 0.3s"
                _hover={{ bg: "rgba(232, 255, 0, 0.1)", transform: "translateY(-2px)", boxShadow: "0 10px 20px rgba(232,255,0,0.15)" }}
                _active={{ bg: "rgba(232, 255, 0, 0.2)", transform: "translateY(0)" }}
              >
                ACCESS TERMINAL
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Box>
    </>
  );
}

export default LoginComponentUser;
