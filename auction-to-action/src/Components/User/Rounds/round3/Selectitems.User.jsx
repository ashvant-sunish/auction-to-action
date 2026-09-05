import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Icon,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  HStack,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Collapse,
  Checkbox,
  NumberInput,
  NumberInputField,
  Flex,
  useToast,
  Badge,
  VStack,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  SimpleGrid,
} from "@chakra-ui/react";
import { FaRupeeSign, FaSearch, FaHandshake, FaList } from "react-icons/fa";
import { IoIosInformationCircleOutline } from "react-icons/io";
import io from "socket.io-client";
import serverUrl from "./../../../../servercon";

// Enhanced Trading Table Component
const TradingWishlistTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [tradeItems, setTradeItems] = useState({});
  const [teamData, setTeamData] = useState(null);
  const [currentWishlist, setCurrentWishlist] = useState([]); // Store current wishlist
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [socket, setSocket] = useState(null);
  const [submittedItems, setSubmittedItems] = useState([]); // Store submitted items for modal
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(serverUrl);
    setSocket(newSocket);

    // Listen for trade updates
    newSocket.on("tradeWishlistUpdated", (data) => {
      console.log("Trade wishlist updated:", data);
      toast({
        title: "Trade Wishlist Updated",
        description: `${data.teamName} updated their trade wishlist`,
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Fetch team data on component mount
  useEffect(() => {
    fetchTeamData();
    fetchCurrentWishlist();
  }, []);

  const fetchCurrentWishlist = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${serverUrl}/api/team/trade-wishlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setCurrentWishlist(result.data.itemsToTrade || []);
          console.log("Current wishlist loaded:", result.data.itemsToTrade);
        }
      }
    } catch (error) {
      console.error("Error fetching current wishlist:", error);
    }
  };

  const fetchTeamData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access trading features",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);
        return;
      }

      const response = await fetch(`${serverUrl}/api/team/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTeamData(data);
        console.log("Team data loaded:", data);
      } else {
        throw new Error("Failed to fetch team data");
      }
    } catch (error) {
      console.error("Error fetching team data:", error);
      toast({
        title: "Error",
        description: "Failed to load team data",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Convert team resources to tradeable format with commitment info
  const availableResources = useMemo(() => {
    if (!teamData?.resources) return [];

    // Create map of committed resources from current wishlist
    const committedMap = new Map();
    currentWishlist.forEach((item) => {
      committedMap.set(item.name, item.count);
    });

    return Object.entries(teamData.resources)
      .filter(([name, count]) => count > 0)
      .map(([name, count]) => {
        const committed = committedMap.get(name) || 0;
        const available = count - committed;
        return {
          name,
          totalCount: count,
          committed,
          available: Math.max(0, available),
          type: "resource",
        };
      });
  }, [teamData, currentWishlist]);

  const handleCheckboxChange = (itemName, isChecked) => {
    setTradeItems((prev) => ({
      ...prev,
      [itemName]: {
        isSelected: isChecked,
        count: isChecked ? prev[itemName]?.count || 1 : 0,
      },
    }));
  };

  const handleQuantityChange = (itemName, value) => {
    const resource = availableResources.find((r) => r.name === itemName);
    const maxAvailable = resource?.available || 0;
    const newCount = Math.max(
      0,
      Math.min(parseInt(value, 10) || 0, maxAvailable)
    );

    setTradeItems((prev) => ({
      ...prev,
      [itemName]: { ...prev[itemName], count: newCount },
    }));
  };

  const handleSubmitTrade = async () => {
    const itemsToTrade = Object.entries(tradeItems)
      .filter(([_, data]) => data.isSelected && data.count > 0)
      .map(([name, data]) => ({ name, count: data.count }));

    if (itemsToTrade.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one item and quantity to trade.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const tradeWishlistData = {
        itemsToTrade: itemsToTrade,
        totalItems: itemsToTrade.reduce((sum, item) => sum + item.count, 0),
      };

      console.log("Submitting trade wishlist:", tradeWishlistData);

      const response = await fetch(`${serverUrl}/api/team/trade-wishlist`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tradeWishlistData),
      });

      const result = await response.json();
      console.log("Backend response:", result);

      if (response.ok) {
        // Emit socket event for real-time updates
        if (socket) {
          socket.emit("tradeWishlistSubmitted", {
            teamCode: teamData.teamCode,
            teamName: teamData.teamName,
            itemsToTrade: itemsToTrade,
            totalItems: tradeWishlistData.totalItems,
          });
        }

        toast({
          title: "Items Added to Wishlist!",
          description: `Added ${itemsToTrade
            .map((item) => `${item.count} × ${item.name}`)
            .join(
              ", "
            )} to your trading wishlist. You can add more items anytime.`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        // Store submitted items for modal display
        setSubmittedItems(itemsToTrade);

        // Refresh current wishlist to show accumulated items
        fetchCurrentWishlist();

        // Open confirmation modal
        onOpen();

        // Reset form
        setTradeItems({});
      } else {
        // Handle detailed error responses
        if (result.error === "INSUFFICIENT_RESOURCES" && result.details) {
          const {
            resource,
            available,
            currentlyCommitted,
            requested,
            totalNeeded,
          } = result.details;
          toast({
            title: "Insufficient Resources",
            description: `${resource}: Available ${available}, Already committed ${currentlyCommitted}, Requesting ${requested} more. Total needed: ${totalNeeded}`,
            status: "error",
            duration: 8000,
            isClosable: true,
          });
        } else {
          throw new Error(result.message || "Failed to submit trade wishlist");
        }
      }
    } catch (error) {
      console.error("Error submitting trade wishlist:", error);

      // Try to parse detailed error from response
      if (error.response?.data?.details) {
        const {
          resource,
          available,
          currentlyCommitted,
          requested,
          totalNeeded,
        } = error.response.data.details;
        toast({
          title: "Resource Validation Failed",
          description: `${resource}: You have ${available} available, ${currentlyCommitted} already committed. Cannot commit ${requested} more (would need ${totalNeeded} total).`,
          status: "error",
          duration: 8000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to submit trade wishlist",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filteredResources = availableResources.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedItemsCount = Object.values(tradeItems).filter(
    (item) => item.isSelected
  ).length;
  const totalTradeQuantity = Object.values(tradeItems).reduce(
    (sum, item) => (item.isSelected ? sum + (item.count || 0) : sum),
    0
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minH="400px"
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color="gray.600">Loading your inventory...</Text>
        </VStack>
      </Box>
    );
  }

  if (!teamData) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Authentication Required!</AlertTitle>
        <AlertDescription>
          Please log in to access Round 3 trading features.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <VStack spacing={6} align="stretch">
        {/* Header Card */}
        <Box
          bg="rgba(15, 59, 61, 0.5)"
          backdropFilter="blur(10px)"
          p={6}
          borderRadius="xl"
          shadow="lg"
          border="1px solid"
          borderColor="rgba(255, 255, 255, 0.2)"
          color="white"
        >
          <HStack justify="space-between" align="center">
            <HStack>
              <Icon as={FaHandshake} color="blue.400" boxSize={6} />
              <VStack align="start" spacing={1}>
                <Heading size="lg" color="white">
                  Round 3: Trading Wishlist
                </Heading>
                <Text fontSize="sm" color="gray.300">
                  Select items to add to your trade wishlist. You can submit
                  multiple times to accumulate items.
                </Text>
              </VStack>
            </HStack>
            <VStack align="end" spacing={1}>
              <Box
                bg="rgba(255, 255, 255, 0.1)"
                px={3}
                py={1}
                borderRadius="full"
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.2)"
              >
                <Text fontSize="md" color="white" fontWeight="semibold">
                  {teamData.teamName}
                </Text>
              </Box>
              <Text fontSize="sm" color="gray.300">
                Balance: ₹{(teamData.credit - teamData.debit).toLocaleString()}
              </Text>
            </VStack>
          </HStack>
        </Box>

        {/* Current Wishlist Display */}
        {currentWishlist.length > 0 && (
          <Box
            bg="rgba(15, 59, 61, 0.5)"
            backdropFilter="blur(10px)"
            p={6}
            borderRadius="xl"
            shadow="lg"
            border="1px solid"
            borderColor="rgba(255, 255, 255, 0.2)"
            color="white"
          >
            <HStack justify="space-between" mb={4}>
              <HStack>
                <Icon as={FaList} color="purple.400" boxSize={5} />
                <Heading size="md" color="white">
                  Your Current Trading Wishlist
                </Heading>
              </HStack>
              <Box
                bg="rgba(255, 255, 255, 0.1)"
                px={3}
                py={1}
                borderRadius="full"
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.2)"
              >
                <Text fontSize="sm" color="white" fontWeight="semibold">
                  {currentWishlist.reduce((sum, item) => sum + item.count, 0)}{" "}
                  Total Items
                </Text>
              </Box>
            </HStack>
            <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={3}>
              {currentWishlist.map((item, index) => (
                <Box
                  key={index}
                  p={3}
                  bg="rgba(255, 255, 255, 0.1)"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="rgba(255, 255, 255, 0.2)"
                  backdropFilter="blur(5px)"
                >
                  <Text fontWeight="bold" color="purple.300" fontSize="sm">
                    {item.name}
                  </Text>
                  <Text color="purple.200" fontSize="xs">
                    {item.count} units
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
            <Text fontSize="xs" color="gray.400" mt={3}>
              These items are already in your wishlist. Adding more items below
              will accumulate with these.
            </Text>
          </Box>
        )}

        {/* Inventory Overview */}
        <Box
          bg="rgba(15, 59, 61, 0.5)"
          backdropFilter="blur(10px)"
          p={6}
          borderRadius="xl"
          shadow="lg"
          border="1px solid"
          borderColor="rgba(255, 255, 255, 0.2)"
          color="white"
          display="flex"
          flexDirection="column"
        >
          <HStack justify="space-between" mb={4}>
            <HStack>
              <Icon as={FaList} color="green.400" boxSize={5} />
              <Heading size="md" color="white">
                Your Inventory
              </Heading>
            </HStack>
            <HStack spacing={4}>
              <Box
                bg="rgba(255, 255, 255, 0.1)"
                px={3}
                py={1}
                borderRadius="full"
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.2)"
              >
                <Text fontSize="xs" color="white" fontWeight="semibold">
                  {availableResources.length} Types
                </Text>
              </Box>
              <Box
                bg="rgba(255, 255, 255, 0.1)"
                px={3}
                py={1}
                borderRadius="full"
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.2)"
              >
                <Text fontSize="xs" color="white" fontWeight="semibold">
                  {availableResources.reduce(
                    (sum, item) => sum + item.totalCount,
                    0
                  )}{" "}
                  Total
                </Text>
              </Box>
              <Box
                bg="rgba(255, 255, 255, 0.1)"
                px={3}
                py={1}
                borderRadius="full"
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.2)"
              >
                <Text fontSize="xs" color="white" fontWeight="semibold">
                  {availableResources.reduce(
                    (sum, item) => sum + item.committed,
                    0
                  )}{" "}
                  Committed
                </Text>
              </Box>
              <Box
                bg="rgba(255, 255, 255, 0.1)"
                px={3}
                py={1}
                borderRadius="full"
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.2)"
              >
                <Text fontSize="xs" color="white" fontWeight="semibold">
                  {availableResources.reduce(
                    (sum, item) => sum + item.available,
                    0
                  )}{" "}
                  Available
                </Text>
              </Box>
            </HStack>
          </HStack>

          {availableResources.length === 0 ? (
            <Box
              bg="rgba(0, 100, 200, 0.1)"
              border="1px solid"
              borderColor="rgba(0, 100, 200, 0.3)"
              borderRadius="lg"
              p={4}
              textAlign="center"
            >
              <Icon
                as={IoIosInformationCircleOutline}
                boxSize={8}
                color="blue.400"
                mb={2}
              />
              <Text fontWeight="bold" color="blue.300" mb={2}>
                No Resources Available
              </Text>
              <Text fontSize="sm" color="gray.300">
                You don't have any resources to trade yet. Complete Round 1 and
                Round 2 to gain resources.
              </Text>
            </Box>
          ) : (
            <VStack spacing={4} align="stretch" flex="1">
              <HStack justify="space-between">
                <InputGroup maxW="400px">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search your resources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="md"
                    bg="rgba(0, 0, 0, 0.2)"
                    border="1px solid"
                    borderColor="rgba(255, 255, 255, 0.2)"
                    borderRadius="lg"
                    color="white"
                    _placeholder={{ color: "gray.400" }}
                    _focus={{
                      bg: "rgba(0, 0, 0, 0.3)",
                      borderColor: "blue.300",
                      boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.6)",
                    }}
                    _hover={{
                      borderColor: "rgba(255, 255, 255, 0.3)",
                    }}
                  />
                </InputGroup>

                {selectedItemsCount > 0 && (
                  <Box
                    bg="rgba(255, 255, 255, 0.1)"
                    px={4}
                    py={2}
                    borderRadius="full"
                    border="1px solid"
                    borderColor="rgba(255, 255, 255, 0.2)"
                  >
                    <Text fontSize="md" color="white" fontWeight="semibold">
                      {selectedItemsCount} items selected ({totalTradeQuantity}{" "}
                      total)
                    </Text>
                  </Box>
                )}
              </HStack>

              {/* Trading Table */}
              <TableContainer
                borderRadius="lg"
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.2)"
                maxH="400px"
                overflowY="auto"
                bg="rgba(0, 0, 0, 0.2)"
                css={{
                  "&::-webkit-scrollbar": { width: "8px" },
                  "&::-webkit-scrollbar-track": { background: "transparent" },
                  "&::-webkit-scrollbar-thumb": {
                    background: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "8px",
                  },
                  "&::-webkit-scrollbar-thumb:hover": {
                    background: "rgba(255, 255, 255, 0.3)",
                  },
                }}
              >
                <Table variant="simple" size="md">
                  <Thead
                    position="sticky"
                    top={0}
                    bg="rgba(15, 59, 61, 0.9)"
                    zIndex={1}
                  >
                    <Tr>
                      <Th
                        color="gray.300"
                        textTransform="none"
                        borderColor="rgba(255, 255, 255, 0.2)"
                      >
                        Select
                      </Th>
                      <Th
                        color="gray.300"
                        textTransform="none"
                        borderColor="rgba(255, 255, 255, 0.2)"
                      >
                        Resource Name
                      </Th>
                      <Th
                        color="gray.300"
                        textTransform="none"
                        borderColor="rgba(255, 255, 255, 0.2)"
                        isNumeric
                      >
                        Total
                      </Th>
                      <Th
                        color="gray.300"
                        textTransform="none"
                        borderColor="rgba(255, 255, 255, 0.2)"
                        isNumeric
                      >
                        Committed
                      </Th>
                      <Th
                        color="gray.300"
                        textTransform="none"
                        borderColor="rgba(255, 255, 255, 0.2)"
                        isNumeric
                      >
                        Available
                      </Th>
                      <Th
                        color="gray.300"
                        textTransform="none"
                        borderColor="rgba(255, 255, 255, 0.2)"
                        isNumeric
                      >
                        Quantity to Trade
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredResources.map((item, index) => (
                      <Tr
                        key={index}
                        _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
                      >
                        <Td borderColor="rgba(255, 255, 255, 0.1)">
                          <Checkbox
                            borderColor="rgba(255, 255, 255, 0.3)"
                            colorScheme="blue"
                            isChecked={
                              tradeItems[item.name]?.isSelected || false
                            }
                            onChange={(e) =>
                              handleCheckboxChange(item.name, e.target.checked)
                            }
                          />
                        </Td>
                        <Td borderColor="rgba(255, 255, 255, 0.1)">
                          <HStack>
                            <Box
                              w={2}
                              h={2}
                              bg="blue.400"
                              borderRadius="full"
                            />
                            <Text color="white" fontWeight="medium">
                              {item.name}
                            </Text>
                          </HStack>
                        </Td>
                        <Td isNumeric borderColor="rgba(255, 255, 255, 0.1)">
                          <Box
                            bg="rgba(59, 130, 246, 0.2)"
                            px={2}
                            py={1}
                            borderRadius="md"
                            border="1px solid"
                            borderColor="rgba(59, 130, 246, 0.3)"
                            display="inline-block"
                          >
                            <Text
                              fontSize="sm"
                              color="blue.300"
                              fontWeight="semibold"
                            >
                              {item.totalCount}
                            </Text>
                          </Box>
                        </Td>
                        <Td isNumeric borderColor="rgba(255, 255, 255, 0.1)">
                          <Box
                            bg="rgba(147, 51, 234, 0.2)"
                            px={2}
                            py={1}
                            borderRadius="md"
                            border="1px solid"
                            borderColor="rgba(147, 51, 234, 0.3)"
                            display="inline-block"
                          >
                            <Text
                              fontSize="sm"
                              color="purple.300"
                              fontWeight="semibold"
                            >
                              {item.committed}
                            </Text>
                          </Box>
                        </Td>
                        <Td isNumeric borderColor="rgba(255, 255, 255, 0.1)">
                          <Box
                            bg={
                              item.available > 0
                                ? "rgba(34, 197, 94, 0.2)"
                                : "rgba(239, 68, 68, 0.2)"
                            }
                            px={2}
                            py={1}
                            borderRadius="md"
                            border="1px solid"
                            borderColor={
                              item.available > 0
                                ? "rgba(34, 197, 94, 0.3)"
                                : "rgba(239, 68, 68, 0.3)"
                            }
                            display="inline-block"
                          >
                            <Text
                              fontSize="sm"
                              color={
                                item.available > 0 ? "green.300" : "red.300"
                              }
                              fontWeight="semibold"
                            >
                              {item.available}
                            </Text>
                          </Box>
                        </Td>
                        <Td isNumeric borderColor="rgba(255, 255, 255, 0.1)">
                          <NumberInput
                            size="sm"
                            width="100px"
                            min={0}
                            max={item.available}
                            value={tradeItems[item.name]?.count || 0}
                            isDisabled={
                              !tradeItems[item.name]?.isSelected ||
                              item.available === 0
                            }
                            onChange={(value) =>
                              handleQuantityChange(item.name, value)
                            }
                          >
                            <NumberInputField
                              bg="rgba(0, 0, 0, 0.2)"
                              border="1px solid"
                              borderColor="rgba(255, 255, 255, 0.2)"
                              color="white"
                              _disabled={{
                                bg: "rgba(0, 0, 0, 0.1)",
                                color: "gray.500",
                              }}
                              _focus={{
                                borderColor: "blue.300",
                                boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.6)",
                              }}
                            />
                          </NumberInput>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>

              {/* Submit Button */}
              <Flex justify="center" pt={4}>
                <Button
                  colorScheme="blue"
                  size="lg"
                  leftIcon={<FaHandshake />}
                  onClick={handleSubmitTrade}
                  isLoading={submitting}
                  loadingText="Adding to Wishlist..."
                  isDisabled={selectedItemsCount === 0}
                  px={8}
                  bg="rgba(59, 130, 246, 0.8)"
                  backdropFilter="blur(10px)"
                  border="1px solid"
                  borderColor="rgba(59, 130, 246, 0.3)"
                  _hover={{
                    bg: "rgba(59, 130, 246, 0.9)",
                    borderColor: "rgba(59, 130, 246, 0.5)",
                  }}
                  _active={{
                    bg: "rgba(59, 130, 246, 0.7)",
                  }}
                >
                  Add to Trading Wishlist
                </Button>
              </Flex>
            </VStack>
          )}
        </Box>
      </VStack>

      {/* Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(10px)" />
        <ModalContent
          bg="rgba(15, 59, 61, 0.95)"
          backdropFilter="blur(20px)"
          border="1px solid"
          borderColor="rgba(255, 255, 255, 0.3)"
          color="white"
        >
          <ModalHeader color="white">Items Added to Wishlist!</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <VStack spacing={4} align="start">
              <Text color="gray.200">
                These items have been added to your trading wishlist:
              </Text>
              <Box
                bg="rgba(59, 130, 246, 0.2)"
                p={4}
                borderRadius="md"
                w="full"
                border="1px solid"
                borderColor="rgba(59, 130, 246, 0.3)"
              >
                <Text fontWeight="bold" color="blue.300" mb={2}>
                  Items Added:
                </Text>
                {submittedItems.map((item, index) => (
                  <Text key={index} fontSize="sm" color="blue.200">
                    • {item.count} × {item.name}
                  </Text>
                ))}
              </Box>
              <Text fontSize="sm" color="gray.300">
                You can continue adding more items to your wishlist by
                submitting again. Your previous items will be accumulated.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              onClick={onClose}
              bg="rgba(59, 130, 246, 0.8)"
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor="rgba(59, 130, 246, 0.3)"
              _hover={{
                bg: "rgba(59, 130, 246, 0.9)",
              }}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

function SelectitemsUser() {
  return (
    <Box maxW="1200px" mx="auto" p={6} minH="100vh">
      <TradingWishlistTable />
    </Box>
  );
}

export default SelectitemsUser;
