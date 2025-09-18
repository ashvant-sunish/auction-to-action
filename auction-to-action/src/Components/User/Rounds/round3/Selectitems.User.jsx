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
import io from 'socket.io-client';
import serverUrl from './../../../../servercon';

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
    newSocket.on('tradeWishlistUpdated', (data) => {
      console.log('Trade wishlist updated:', data);
      toast({
        title: 'Trade Wishlist Updated',
        description: `${data.teamName} updated their trade wishlist`,
        status: 'info',
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
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${serverUrl}/api/team/trade-wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setCurrentWishlist(result.data.itemsToTrade || []);
          console.log('Current wishlist loaded:', result.data.itemsToTrade);
        }
      }
    } catch (error) {
      console.error('Error fetching current wishlist:', error);
    }
  };

  const fetchTeamData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to access trading features',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);
        return;
      }

      const response = await fetch(`${serverUrl}/api/team/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTeamData(data);
        console.log('Team data loaded:', data);
      } else {
        throw new Error('Failed to fetch team data');
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load team data',
        status: 'error',
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
    currentWishlist.forEach(item => {
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
          type: 'resource'
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
    const newCount = Math.max(0, Math.min(parseInt(value, 10) || 0, maxAvailable));

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
      const token = localStorage.getItem('token');
      const tradeWishlistData = {
        itemsToTrade: itemsToTrade,
        totalItems: itemsToTrade.reduce((sum, item) => sum + item.count, 0)
      };

      console.log('Submitting trade wishlist:', tradeWishlistData);

      const response = await fetch(`${serverUrl}/api/team/trade-wishlist`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tradeWishlistData)
      });

      const result = await response.json();
      console.log('Backend response:', result);

      if (response.ok) {
        // Emit socket event for real-time updates
        if (socket) {
          socket.emit('tradeWishlistSubmitted', {
            teamCode: teamData.teamCode,
            teamName: teamData.teamName,
            itemsToTrade: itemsToTrade,
            totalItems: tradeWishlistData.totalItems
          });
        }

        toast({
          title: "Items Added to Wishlist!",
          description: `Added ${itemsToTrade
            .map((item) => `${item.count} × ${item.name}`)
            .join(", ")} to your trading wishlist. You can add more items anytime.`,
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
        if (result.error === 'INSUFFICIENT_RESOURCES' && result.details) {
          const { resource, available, currentlyCommitted, requested, totalNeeded } = result.details;
          toast({
            title: 'Insufficient Resources',
            description: `${resource}: Available ${available}, Already committed ${currentlyCommitted}, Requesting ${requested} more. Total needed: ${totalNeeded}`,
            status: 'error',
            duration: 8000,
            isClosable: true,
          });
        } else {
          throw new Error(result.message || 'Failed to submit trade wishlist');
        }
      }
    } catch (error) {
      console.error('Error submitting trade wishlist:', error);
      
      // Try to parse detailed error from response
      if (error.response?.data?.details) {
        const { resource, available, currentlyCommitted, requested, totalNeeded } = error.response.data.details;
        toast({
          title: 'Resource Validation Failed',
          description: `${resource}: You have ${available} available, ${currentlyCommitted} already committed. Cannot commit ${requested} more (would need ${totalNeeded} total).`,
          status: 'error',
          duration: 8000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: error.message || 'Failed to submit trade wishlist',
          status: 'error',
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

  const selectedItemsCount = Object.values(tradeItems).filter(item => item.isSelected).length;
  const totalTradeQuantity = Object.values(tradeItems).reduce((sum, item) => 
    item.isSelected ? sum + (item.count || 0) : sum, 0
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
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
        <Card>
          <CardHeader>
            <HStack justify="space-between" align="center">
              <HStack>
                <Icon as={FaHandshake} color="blue.500" boxSize={6} />
                <VStack align="start" spacing={1}>
                  <Heading size="lg" color="gray.700">Round 3: Trading Wishlist</Heading>
                  <Text fontSize="sm" color="gray.500">
                    Select items to add to your trade wishlist. You can submit multiple times to accumulate items.
                  </Text>
                </VStack>
              </HStack>
              <VStack align="end" spacing={1}>
                <Badge colorScheme="blue" fontSize="md" p={2}>
                  {teamData.teamName}
                </Badge>
                <Text fontSize="sm" color="gray.500">
                  Balance: ₹{(teamData.credit - teamData.debit).toLocaleString()}
                </Text>
              </VStack>
            </HStack>
          </CardHeader>
        </Card>

        {/* Current Wishlist Display */}
        {currentWishlist.length > 0 && (
          <Card>
            <CardHeader>
              <HStack justify="space-between">
                <HStack>
                  <Icon as={FaList} color="purple.500" boxSize={5} />
                  <Heading size="md" color="gray.700">Your Current Trading Wishlist</Heading>
                </HStack>
                <Badge colorScheme="purple" fontSize="sm">
                  {currentWishlist.reduce((sum, item) => sum + item.count, 0)} Total Items
                </Badge>
              </HStack>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={3}>
                {currentWishlist.map((item, index) => (
                  <Box key={index} p={3} bg="purple.50" borderRadius="md" border="1px solid" borderColor="purple.200">
                    <Text fontWeight="bold" color="purple.700" fontSize="sm">{item.name}</Text>
                    <Text color="purple.600" fontSize="xs">{item.count} units</Text>
                  </Box>
                ))}
              </SimpleGrid>
              <Text fontSize="xs" color="gray.500" mt={3}>
                These items are already in your wishlist. Adding more items below will accumulate with these.
              </Text>
            </CardBody>
          </Card>
        )}

        {/* Inventory Overview */}
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <HStack>
                <Icon as={FaList} color="green.500" boxSize={5} />
                <Heading size="md" color="gray.700">Your Inventory</Heading>
              </HStack>
              <HStack spacing={4}>
                <Badge colorScheme="green" fontSize="sm">
                  {availableResources.length} Resource Types
                </Badge>
                <Badge colorScheme="orange" fontSize="sm">
                  {availableResources.reduce((sum, item) => sum + item.totalCount, 0)} Total Items
                </Badge>
                <Badge colorScheme="purple" fontSize="sm">
                  {availableResources.reduce((sum, item) => sum + item.committed, 0)} Committed
                </Badge>
                <Badge colorScheme="green" fontSize="sm">
                  {availableResources.reduce((sum, item) => sum + item.available, 0)} Available
                </Badge>
              </HStack>
            </HStack>
          </CardHeader>
          <CardBody>
            {availableResources.length === 0 ? (
              <Alert status="info">
                <AlertIcon />
                <AlertTitle>No Resources Available</AlertTitle>
                <AlertDescription>
                  You don't have any resources to trade yet. Complete Round 1 and Round 2 to gain resources.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {/* Search and Stats */}
                <VStack spacing={4} align="stretch">
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
                        bg="gray.50"
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="lg"
                      />
                    </InputGroup>
                    
                    {selectedItemsCount > 0 && (
                      <Badge colorScheme="blue" fontSize="md" p={2} borderRadius="full">
                        {selectedItemsCount} items selected ({totalTradeQuantity} total)
                      </Badge>
                    )}
                  </HStack>

                  {/* Trading Table */}
                  <TableContainer
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="gray.200"
                    maxH="400px"
                    overflowY="auto"
                  >
                    <Table variant="simple" size="md">
                      <Thead position="sticky" top={0} bg="gray.50" zIndex={1}>
                        <Tr>
                          <Th color="gray.600">Select</Th>
                          <Th color="gray.600">Resource Name</Th>
                          <Th color="gray.600" isNumeric>Total</Th>
                          <Th color="gray.600" isNumeric>Committed</Th>
                          <Th color="gray.600" isNumeric>Available</Th>
                          <Th color="gray.600" isNumeric>Quantity to Trade</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filteredResources.map((item, index) => (
                          <Tr key={index} _hover={{ bg: "blue.50" }}>
                            <Td>
                              <Checkbox
                                borderColor="gray.300"
                                colorScheme="blue"
                                isChecked={tradeItems[item.name]?.isSelected || false}
                                onChange={(e) =>
                                  handleCheckboxChange(item.name, e.target.checked)
                                }
                              />
                            </Td>
                            <Td>
                              <Text color="gray.700" fontWeight="medium">{item.name}</Text>
                            </Td>
                            <Td isNumeric>
                              <Badge colorScheme="blue" variant="subtle">
                                {item.totalCount}
                              </Badge>
                            </Td>
                            <Td isNumeric>
                              <Badge colorScheme="purple" variant="subtle">
                                {item.committed}
                              </Badge>
                            </Td>
                            <Td isNumeric>
                              <Badge colorScheme={item.available > 0 ? "green" : "red"} variant="subtle">
                                {item.available}
                              </Badge>
                            </Td>
                            <Td isNumeric>
                              <NumberInput
                                size="sm"
                                width="100px"
                                min={0}
                                max={item.available}
                                value={tradeItems[item.name]?.count || 0}
                                isDisabled={!tradeItems[item.name]?.isSelected || item.available === 0}
                                onChange={(value) =>
                                  handleQuantityChange(item.name, value)
                                }
                              >
                                <NumberInputField
                                  borderColor="gray.300"
                                  _disabled={{ bg: "gray.100" }}
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
                    >
                      Add to Trading Wishlist
                    </Button>
                  </Flex>
                </VStack>
              </>
            )}
          </CardBody>
        </Card>
      </VStack>

      {/* Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Items Added to Wishlist!</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="start">
              <Text>These items have been added to your trading wishlist:</Text>
              <Box bg="blue.50" p={4} borderRadius="md" w="full">
                <Text fontWeight="bold" color="blue.700" mb={2}>Items Added:</Text>
                {submittedItems.map((item, index) => (
                  <Text key={index} fontSize="sm" color="blue.600">
                    • {item.count} × {item.name}
                  </Text>
                ))}
              </Box>
              <Text fontSize="sm" color="gray.600">
                You can continue adding more items to your wishlist by submitting again. Your previous items will be accumulated.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
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
    <Box maxW="1200px" mx="auto" p={6}>
      <TradingWishlistTable />
    </Box>
  );
}

export default SelectitemsUser