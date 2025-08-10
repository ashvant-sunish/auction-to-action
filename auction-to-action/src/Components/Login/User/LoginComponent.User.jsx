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

function LoginComponentUser() {
  const [formData, setFormData] = useState({ teamName: "", teamCode: "" });
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
    if (!formData.teamName) newErrors.teamName = "Team Name is required.";
    else if (formData.teamName.length < 3)
      newErrors.teamName = "Team Name must be at least 3 characters.";

    if (!formData.teamCode) newErrors.teamCode = "Team Code is required.";
    else if (formData.teamCode.length < 4)
      newErrors.teamCode = "Team Code must be at least 4 characters.";

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

      // Mock login check
      if (
        formData.teamName.toLowerCase() === "teamalpha" &&
        formData.teamCode === "1234"
      ) {
        setMessageType("success");
        setMessage("Login Successful! Redirecting to the User Dashboard...");
        setTimeout(() => navigate("/userdashboard"), 1000);
      } else {
        setMessageType("error");
        setMessage("Invalid Team Name or Team Code.");
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
              User Portal
            </Heading>
            <Text color="gray.500" fontSize="md" mt={2}>
              Sign in to access your team dashboard
            </Text>
          </Box>
          {message && <CustomAlert status={messageType}>{message}</CustomAlert>}
          <Box as="form" w="100%" onSubmit={handleSubmit} noValidate>
            <VStack spacing={5}>
              {/* Team Name Field */}
              <FormControl isInvalid={!!errors.teamName}>
                <FormLabel
                  htmlFor="teamName"
                  color="gray.700"
                  fontWeight="semibold"
                  fontSize="sm"
                >
                  Team Name
                </FormLabel>
                <Input
                  id="teamName"
                  name="teamName"
                  type="text"
                  placeholder="e.g., Team Alpha"
                  value={formData.teamName}
                  onChange={handleInputChange}
                  focusBorderColor="purple.500"
                  bg="gray.50"
                />
                {errors.teamName && (
                  <Text color="red.500" fontSize="xs" mt={1}>
                    {errors.teamName}
                  </Text>
                )}
              </FormControl>

              {/* Team Code Field */}
              <FormControl isInvalid={!!errors.teamCode}>
                <FormLabel
                  htmlFor="teamCode"
                  color="gray.700"
                  fontWeight="semibold"
                  fontSize="sm"
                >
                  Team Code
                </FormLabel>
                <InputGroup>
                  <Input
                    id="teamCode"
                    name="teamCode"
                    type={showCode ? "text" : "password"}
                    placeholder="Enter your team code"
                    value={formData.teamCode}
                    onChange={handleInputChange}
                    focusBorderColor="purple.500"
                    bg="gray.50"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showCode ? "Hide code" : "Show code"}
                      icon={
                        <Icon
                          as={showCode ? AiOutlineEyeInvisible : AiOutlineEye}
                        />
                      }
                      size="sm"
                      variant="ghost"
                      onClick={toggleCodeVisibility}
                    />
                  </InputRightElement>
                </InputGroup>
                {errors.teamCode && (
                  <Text color="red.500" fontSize="xs" mt={1}>
                    {errors.teamCode}
                  </Text>
                )}
              </FormControl>

              {/* Submit Button */}
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

export default LoginComponentUser;
