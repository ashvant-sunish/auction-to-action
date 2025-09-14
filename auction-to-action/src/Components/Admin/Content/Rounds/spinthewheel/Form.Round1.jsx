import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  SimpleGrid,
  Button,
  VStack,
  Divider,
  Text,
  Flex,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Card,
  CardBody,
  Badge,
  Switch,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { FaRandom, FaCheck } from "react-icons/fa";
import { MdSkipNext } from "react-icons/md";
import axios from "axios";
import { socketServerUrl } from "../../../../../servercon";
import io from "socket.io-client";

function FormRound1() {
  const [formData, setFormData] = useState({
    round: 1,
    itemCode: "",
    itemName: "",
    teamCode: "",
    teamName: "",
    bidAmount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [teamCodeLoading, setTeamCodeLoading] = useState(false);
  const [liveGameState, setLiveGameState] = useState(null);
  const [wheelSelection, setWheelSelection] = useState(null);
  const [autoFillEnabled, setAutoFillEnabled] = useState(true);
  const [itemResources, setItemResources] = useState(null);
  const [socket, setSocket] = useState(null);
  const toast = useToast();

  // Initialize socket connection for live updates
  useEffect(() => {
    const newSocket = io(socketServerUrl);
    setSocket(newSocket);

    // Listen for live bid selections
    newSocket.on("bidSelected", (data) => {
      console.log("🔴 Live bid selected:", data);
      if (data.round === 1) {
        setLiveGameState(data);
        toast({
          title: "🔴 LIVE: New Bid Selected!",
          description: `${data.item.name} won by ${data.winner.teamName} for ₹${data.winner.bidAmount}`,
          status: "info",
          duration: 5000,
          isClosable: true,
        });
      }
    });

    // Listen for wheel random selections
    newSocket.on("wheelRandomSelection", (data) => {
      console.log("🎯 Wheel random selection:", data);
      if (data.round === 1) {
        setWheelSelection({
          ...data,
          status: "SELECTED",
          timestamp: new Date(data.timestamp),
        });

        // Fetch resources for the selected item
        fetchItemResources(data.itemDetails?.itemCode);

        if (autoFillEnabled) {
          setFormData((prev) => ({
            ...prev,
            itemCode: data.itemDetails.itemCode || "",
            itemName: data.itemDetails.title || "",
            bidAmount: data.itemDetails.basePrice || 0,
          }));
        }

        toast({
          title: "🎯 Item Selected from Wheel",
          description: `${data.itemDetails.title} selected`,
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      }
    });

    // Listen for wheel confirmations
    newSocket.on("wheelConfirmation", (data) => {
      console.log("✅ Wheel confirmation:", data);
      if (data.round === 1) {
        setWheelSelection({
          ...data,
          status: "CONFIRMED",
          timestamp: new Date(data.timestamp),
        });

        // Fetch resources for the confirmed item
        fetchItemResources(data.itemDetails?.itemCode);

        toast({
          title: "✅ Item Confirmed",
          description: `${data.itemDetails.title} confirmed`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    });

    // Listen for wheel skips
    newSocket.on("wheelSkip", (data) => {
      console.log("⏭️ Wheel skip:", data);
      if (data.round === 1) {
        setWheelSelection({
          ...data,
          status: "SKIPPED",
          timestamp: new Date(data.timestamp),
        });

        // Clear resources when item is skipped
        setItemResources(null);

        toast({
          title: "⏭️ Item Skipped",
          description: `${data.itemDetails.title} skipped`,
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
      }
    });

    // Fetch initial game state and wheel state
    fetchGameState();
    fetchLatestWheelSelection();

    return () => {
      newSocket.disconnect();
    };
  }, [autoFillEnabled]);

  // Fetch current game state
  const fetchGameState = async () => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      const response = await axios.get(
        `${socketServerUrl}/api/admin/game-state`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (
        response.data &&
        response.data.currentRound === 1 &&
        response.data.isAuctionLive
      ) {
        setLiveGameState({
          item: response.data.currentItemUpForBidding,
          liveMessage: response.data.liveMessage,
        });
      }
    } catch (error) {
      console.error("Error fetching game state:", error);
    }
  };

  // Fetch latest wheel selection
  const fetchLatestWheelSelection = async () => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      const response = await axios.get(
        `${socketServerUrl}/api/wheel/wheel-selection/1`, // Round 1
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.latestSelection) {
        const selection = response.data.latestSelection;
        setWheelSelection({
          ...selection,
          status: "SELECTED",
          timestamp: new Date(selection.timestamp),
        });

        // Auto-fill form if enabled and there's an active selection
        if (autoFillEnabled && selection.eventType === "RANDOM_SELECTED") {
          setFormData((prev) => ({
            ...prev,
            itemCode: selection.itemDetails.itemCode || "",
            itemName: selection.itemDetails.title || "",
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching latest wheel selection:", error);
    }
  };

  // Fetch item details including resources
  const fetchItemResources = async (itemCode) => {
    if (!itemCode) {
      setItemResources(null);
      return;
    }

    try {
      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken) return;

      const response = await axios.get(
        `${socketServerUrl}/api/admin/game-items/round/1?itemCode=${itemCode}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.length > 0) {
        const item = response.data.find((item) => item.itemCode === itemCode);
        if (item) {
          setItemResources(item.resources);
        }
      }
    } catch (error) {
      console.error("Error fetching item resources:", error);
      setItemResources(null);
    }
  };

  // Auto-fill form with wheel selection data
  const autoFillFromWheelSelection = () => {
    if (wheelSelection && wheelSelection.itemDetails) {
      const itemCode = wheelSelection.itemDetails.itemCode || "";
      setFormData((prev) => ({
        ...prev,
        itemCode: itemCode,
        itemName: wheelSelection.itemDetails.title || "",
        // Don't auto-fill team data - user needs to enter manually
        teamCode: "",
        teamName: "",
        bidAmount: wheelSelection.itemDetails.basePrice || 0,
      }));

      // Fetch resources for this item
      fetchItemResources(itemCode);

      toast({
        title: "Form Auto-Filled",
        description: "Item details have been filled from wheel selection",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  // Auto-fetch team data when team code is entered
  const fetchTeamByCode = async (teamCode) => {
    if (!teamCode || teamCode.length < 3) return;

    try {
      setTeamCodeLoading(true);

      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken) {
        toast({
          title: "Authorization Error",
          description: "Admin token not found. Please login again.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        return;
      }

      const response = await axios.get(
        `${socketServerUrl}/api/admin/teams?teamCode=${teamCode}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.length > 0) {
        const teamData = response.data[0];

        setFormData((prev) => ({
          ...prev,
          teamCode: teamData.teamCode,
          teamName: teamData.teamName,
        }));

        toast({
          title: "Team Found",
          description: `${teamData.teamName} loaded successfully`,
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Team Not Found",
          description: `No team found with code: ${teamCode}`,
          status: "warning",
          duration: 3000,
          isClosable: true,
        });

        setFormData((prev) => ({
          ...prev,
          teamName: "",
        }));
      }
    } catch (error) {
      console.error("Error fetching team data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch team data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setTeamCodeLoading(false);
    }
  };

  // Handle team code changes
  const handleTeamCodeChange = (value) => {
    const upperValue = value.toUpperCase();
    setFormData((prev) => ({
      ...prev,
      teamCode: upperValue,
      teamName: "",
    }));
  };

  // Handle team code blur or Enter key press
  const handleTeamCodeBlur = (value) => {
    if (value.trim().length >= 3) {
      fetchTeamByCode(value.trim().toUpperCase());
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validation
    if (!formData.itemCode.trim()) {
      toast({
        title: "Item Code Required",
        status: "error",
        duration: 2000,
      });
      return;
    }

    if (!formData.itemName.trim()) {
      toast({
        title: "Item Name Required",
        status: "error",
        duration: 2000,
      });
      return;
    }

    if (!formData.teamCode.trim()) {
      toast({
        title: "Team Code Required",
        status: "error",
        duration: 2000,
      });
      return;
    }

    if (!formData.teamName.trim()) {
      toast({
        title: "Invalid Team Code",
        description: "Please enter a valid team code",
        status: "error",
        duration: 2000,
      });
      return;
    }

    if (formData.bidAmount <= 0) {
      toast({
        title: "Invalid Bid Amount",
        status: "error",
        duration: 2000,
      });
      return;
    }

    try {
      setLoading(true);

      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken) {
        toast({
          title: "Authorization Error",
          status: "error",
          duration: 3000,
        });
        return;
      }

      // Create comprehensive trade entry with inventory and account updates
      const tradeData = {
        round: formData.round,
        itemCode: formData.itemCode,
        itemName: formData.itemName,
        teamCode: formData.teamCode,
        teamName: formData.teamName,
        bidAmount: formData.bidAmount,
        tradeType: "AUCTION_WIN",
        actionType: "BUY",
        updateInventory: true,
        updateAccount: true,
      };

      const response = await axios.post(
        `${socketServerUrl}/api/admin/complete-trade`,
        tradeData,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        toast({
          title: "✅ Trade Completed Successfully",
          description: `${formData.itemName} added to ${formData.teamName}'s inventory`,
          status: "success",
          duration: 4000,
        });

        // Reset form
        setFormData({
          round: 1,
          itemCode: "",
          itemName: "",
          teamCode: "",
          teamName: "",
          bidAmount: 0,
        });

        // Clear wheel selection
        setWheelSelection(null);
      }
    } catch (error) {
      console.error("Error completing trade:", error);
      toast({
        title: "Trade Failed",
        description:
          error.response?.data?.message || "Failed to complete trade",
        status: "error",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="800px" mx="auto" p={6}>
      <Heading size="lg" mb={6} textAlign="center" color="blue.600">
        Round 1 Bid Data Entry
      </Heading>

      {/* Wheel Selection Display Card */}
      {wheelSelection && (
        <Card
          mb={6}
          bg={
            wheelSelection.status === "CONFIRMED"
              ? "green.50"
              : wheelSelection.status === "SKIPPED"
              ? "orange.50"
              : "blue.50"
          }
          borderColor={
            wheelSelection.status === "CONFIRMED"
              ? "green.200"
              : wheelSelection.status === "SKIPPED"
              ? "orange.200"
              : "blue.200"
          }
          borderWidth="2px"
        >
          <CardBody>
            <Flex align="center" justify="space-between" mb={2}>
              <HStack>
                <Icon
                  as={
                    wheelSelection.status === "CONFIRMED"
                      ? FaCheck
                      : wheelSelection.status === "SKIPPED"
                      ? MdSkipNext
                      : FaRandom
                  }
                  color={
                    wheelSelection.status === "CONFIRMED"
                      ? "green.600"
                      : wheelSelection.status === "SKIPPED"
                      ? "orange.600"
                      : "blue.600"
                  }
                />
                <Heading
                  size="sm"
                  color={
                    wheelSelection.status === "CONFIRMED"
                      ? "green.600"
                      : wheelSelection.status === "SKIPPED"
                      ? "orange.600"
                      : "blue.600"
                  }
                >
                  {wheelSelection.status === "CONFIRMED"
                    ? "✅ Wheel: Item Confirmed"
                    : wheelSelection.status === "SKIPPED"
                    ? "⏭️ Wheel: Item Skipped"
                    : "🎯 Wheel: Item Selected"}
                </Heading>
              </HStack>
              <Badge
                colorScheme={
                  wheelSelection.status === "CONFIRMED"
                    ? "green"
                    : wheelSelection.status === "SKIPPED"
                    ? "orange"
                    : "blue"
                }
                fontSize="xs"
              >
                {wheelSelection.status}
              </Badge>
            </Flex>
            <Text fontSize="lg" fontWeight="bold" mb={1}>
              {wheelSelection.itemDetails?.title || "Unknown Item"}
            </Text>
            <Text fontSize="sm" color="gray.600" mb={2}>
              Bid #{wheelSelection.itemDetails?.bidNumber} | Code:{" "}
              {wheelSelection.itemDetails?.itemCode}
            </Text>
            {wheelSelection.itemDetails?.basePrice && (
              <Text fontSize="sm" color="green.600" mb={2}>
                Base Price: ₹
                {wheelSelection.itemDetails.basePrice.toLocaleString()}
              </Text>
            )}
            {wheelSelection.itemDetails?.resources &&
              Object.keys(wheelSelection.itemDetails.resources).length > 0 && (
                <Box
                  mt={2}
                  p={2}
                  bg="green.50"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="green.200"
                >
                  <Text
                    fontSize="xs"
                    color="green.700"
                    fontWeight="semibold"
                    mb={1}
                  >
                    📦 Resources:
                  </Text>
                  <HStack spacing={2} flexWrap="wrap">
                    {Object.entries(wheelSelection.itemDetails.resources).map(
                      ([type, qty]) => (
                        <Badge key={type} colorScheme="green" fontSize="xs">
                          {type}: +{qty}
                        </Badge>
                      )
                    )}
                  </HStack>
                </Box>
              )}
            <Text fontSize="xs" color="gray.500">
              {wheelSelection.timestamp?.toLocaleString()}
            </Text>
            {wheelSelection.status === "SELECTED" && autoFillEnabled && (
              <Button
                size="sm"
                mt={2}
                colorScheme="blue"
                onClick={autoFillFromWheelSelection}
              >
                Auto-Fill Form
              </Button>
            )}
          </CardBody>
        </Card>
      )}

      {/* Auto-Fill Settings */}
      <Card mb={6} bg="gray.50" borderColor="gray.200" borderWidth="1px">
        <CardBody py={3}>
          <HStack justify="space-between">
            <Box>
              <Text fontWeight="semibold" fontSize="sm">
                Auto-Fill from Wheel Selections
              </Text>
              <Text fontSize="xs" color="gray.600">
                Automatically populate item details when wheel selects an item
              </Text>
            </Box>
            <Switch
              isChecked={autoFillEnabled}
              onChange={(e) => setAutoFillEnabled(e.target.checked)}
              colorScheme="blue"
            />
          </HStack>
        </CardBody>
      </Card>

      <Alert status="info" mb={6}>
        <AlertIcon />
        <Box>
          <AlertTitle>Round 1 Bid Entry</AlertTitle>
          <AlertDescription>
            Enter the details of bids won by teams in Round 1. Team information
            will be auto-fetched when you enter a valid team code.
            {wheelSelection && (
              <Text mt={2} color="blue.600" fontWeight="bold">
                🎯 Connected to spinning wheel! Item details can be auto-filled
                from wheel selections.
              </Text>
            )}
            {liveGameState && (
              <Text mt={2} color="red.600" fontWeight="bold">
                🔴 Live spinning wheel is active! New bids are being selected in
                real-time.
              </Text>
            )}
          </AlertDescription>
        </Box>
      </Alert>

      <VStack spacing={6} align="stretch">
        {/* Item Details Section */}
        <Box>
          <Heading size="md" mb={4} color="gray.700">
            Item Details
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isRequired>
              <FormLabel>Item Code</FormLabel>
              <Input
                placeholder="e.g., R1I001"
                value={formData.itemCode}
                onChange={(e) => {
                  const newItemCode = e.target.value.toUpperCase();
                  setFormData((prev) => ({ ...prev, itemCode: newItemCode }));
                  fetchItemResources(newItemCode);
                }}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Item Name</FormLabel>
              <Input
                placeholder="e.g., Property Deed - Downtown"
                value={formData.itemName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, itemName: e.target.value }))
                }
              />
            </FormControl>
          </SimpleGrid>
        </Box>

        {/* Resources Section */}
        {itemResources && Object.keys(itemResources).length > 0 && (
          <>
            <Divider />
            <Box>
              <Heading size="md" mb={4} color="gray.700">
                Resources to Add to Team Inventory
              </Heading>
              <Card bg="green.50" borderColor="green.200" borderWidth="1px">
                <CardBody>
                  <Text
                    fontSize="sm"
                    color="green.700"
                    fontWeight="semibold"
                    mb={3}
                  >
                    📦 This item will add the following resources to the team:
                  </Text>
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                    {Object.entries(itemResources).map(
                      ([resourceType, quantity]) => (
                        <Box
                          key={resourceType}
                          textAlign="center"
                          p={2}
                          bg="white"
                          borderRadius="md"
                          border="1px solid"
                          borderColor="green.200"
                        >
                          <Text
                            fontSize="xs"
                            color="gray.600"
                            textTransform="uppercase"
                            letterSpacing="wide"
                          >
                            {resourceType}
                          </Text>
                          <Text
                            fontSize="lg"
                            fontWeight="bold"
                            color="green.600"
                          >
                            +{quantity}
                          </Text>
                        </Box>
                      )
                    )}
                  </SimpleGrid>
                  <Text
                    fontSize="xs"
                    color="gray.600"
                    mt={3}
                    textAlign="center"
                  >
                    These resources will be automatically added to the team's
                    inventory when the trade is completed.
                  </Text>
                </CardBody>
              </Card>
            </Box>
          </>
        )}

        <Divider />

        {/* Team Details Section */}
        <Box>
          <Heading size="md" mb={4} color="gray.700">
            Winning Team Details
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isRequired>
              <FormLabel>Team Code</FormLabel>
              <Input
                placeholder="Enter team code"
                value={formData.teamCode}
                onChange={(e) => handleTeamCodeChange(e.target.value)}
                onBlur={(e) => handleTeamCodeBlur(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleTeamCodeBlur(e.target.value);
                  }
                }}
                isDisabled={teamCodeLoading}
                bg={teamCodeLoading ? "gray.100" : "white"}
                color="gray.700"
                _placeholder={{ color: "gray.400" }}
                _disabled={{ color: "gray.500", bg: "gray.100", opacity: 1 }}
              />
              {teamCodeLoading && (
                <Text fontSize="sm" color="blue.500" mt={1}>
                  Fetching team data...
                </Text>
              )}
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Team Name</FormLabel>
              <Input
                placeholder="Auto-filled when team code is entered"
                value={formData.teamName}
                isReadOnly
                bg="gray.50"
                color="gray.600"
              />
            </FormControl>
          </SimpleGrid>
        </Box>

        <Divider />

        {/* Bid Amount Section */}
        <Box>
          <Heading size="md" mb={4} color="gray.700">
            Bid Details
          </Heading>
          <FormControl isRequired maxW="300px">
            <FormLabel>Winning Bid Amount (₹)</FormLabel>
            <NumberInput
              value={formData.bidAmount}
              onChange={(valueString, valueNumber) =>
                setFormData((prev) => ({
                  ...prev,
                  bidAmount: valueNumber || 0,
                }))
              }
              min={0}
              step={100}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        </Box>

        <Divider />

        {/* Submit Button */}
        <Flex justify="center" pt={4}>
          <Button
            colorScheme="blue"
            size="lg"
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="Creating Bid Entry..."
            minW="200px"
          >
            Create Bid Entry
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
}

export default FormRound1;
