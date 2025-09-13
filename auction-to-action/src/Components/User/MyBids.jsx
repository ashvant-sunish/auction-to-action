import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Select,
  Flex,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Badge,
  VStack,
  HStack,
  Divider,
} from "@chakra-ui/react";
import serverUrl from "../../servercon";

function MyBids() {
  const [selectedRound, setSelectedRound] = useState("1");
  const [bidsData, setBidsData] = useState([]);
  const [tradesData, setTradesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTrade, setSelectedTrade] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Fetch data from backend
  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to view your bid history");
        return;
      }

      const response = await fetch(`${serverUrl}/api/team/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch transaction history");
      }

      const data = await response.json();
      setBidsData(data.bids || []);
      setTradesData(data.trades || []);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError(err.message || "Failed to fetch transaction history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Filter data based on selected round
  const getFilteredData = () => {
    if (selectedRound === "1" || selectedRound === "2") {
      return bidsData.filter(bid => bid.round === parseInt(selectedRound));
    } else if (selectedRound === "3") {
      return tradesData;
    }
    return [];
  };

  const handleViewTrade = (trade) => {
    setSelectedTrade(trade);
    onOpen();
  };

  const formatTradeItems = (items) => {
    if (!items || items.length === 0) return "No items";
    return items.map(item => `${item.quantity} × ${item.name}`).join(", ");
  };

  const formatBidItems = (itemName) => {
    // If itemName contains bid details, format it nicely
    return itemName;
  };

  const renderBidsTable = (data) => (
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>Bid No.</Th>
          <Th>Items</Th>
          <Th isNumeric>Amount</Th>
          <Th>Date</Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((bid) => (
          <Tr key={bid._id}>
            <Td fontWeight="bold">{bid.itemCode}</Td>
            <Td>{formatBidItems(bid.itemName)}</Td>
            <Td isNumeric>₹{bid.bidAmount.toLocaleString()}</Td>
            <Td>{new Date(bid.createdAt).toLocaleDateString()}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );

  const renderTradesTable = (data) => (
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>Trade ID</Th>
          <Th>Status</Th>
          <Th>Date</Th>
          <Th>Action</Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((trade) => (
          <Tr key={trade._id}>
            <Td fontWeight="bold">{trade.tradeId}</Td>
            <Td>
              <Badge 
                colorScheme={
                  trade.status === 'completed' ? 'green' : 
                  trade.status === 'pending' ? 'yellow' : 'red'
                }
              >
                {trade.status}
              </Badge>
            </Td>
            <Td>{new Date(trade.createdAt).toLocaleDateString()}</Td>
            <Td>
              <Button size="sm" colorScheme="blue" onClick={() => handleViewTrade(trade)}>
                View Details
              </Button>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );

  const filteredData = getFilteredData();

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">My Transaction History</Heading>
        <Select 
          value={selectedRound} 
          onChange={(e) => setSelectedRound(e.target.value)}
          width="200px"
        >
          <option value="1">Round 1 - Bids</option>
          <option value="2">Round 2 - Bids</option>
          <option value="3">Round 3 - Trades</option>
        </Select>
      </Flex>

      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      <TableContainer bg="white" p={4} borderRadius="lg" shadow="md">
        {loading ? (
          <Flex justify="center" p={8}>
            <Spinner size="lg" />
          </Flex>
        ) : filteredData.length === 0 ? (
          <Text textAlign="center" py={8} color="gray.500">
            No {selectedRound === "3" ? "trades" : "bids"} found for Round {selectedRound}
          </Text>
        ) : selectedRound === "3" ? (
          renderTradesTable(filteredData)
        ) : (
          renderBidsTable(filteredData)
        )}
      </TableContainer>

      {/* Trade Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Trade Details - {selectedTrade?.tradeId}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedTrade && (
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text fontWeight="bold">Status:</Text>
                  <Badge 
                    colorScheme={
                      selectedTrade.status === 'completed' ? 'green' : 
                      selectedTrade.status === 'pending' ? 'yellow' : 'red'
                    }
                  >
                    {selectedTrade.status}
                  </Badge>
                </HStack>
                
                <Divider />
                
                <Box>
                  <Text fontWeight="bold" mb={2}>Team Details:</Text>
                  <HStack justify="space-between" mb={2}>
                    <Box>
                      <Text fontSize="sm" color="gray.600">Team One:</Text>
                      <Text>{selectedTrade.teamOne.teamName} ({selectedTrade.teamOne.teamCode})</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.600">Team Two:</Text>
                      <Text>{selectedTrade.teamTwo.teamName} ({selectedTrade.teamTwo.teamCode})</Text>
                    </Box>
                  </HStack>
                </Box>

                <Divider />

                <Box>
                  <Text fontWeight="bold" mb={2}>Trade Exchange:</Text>
                  <HStack align="start" justify="space-between">
                    <Box flex={1}>
                      <Text fontSize="sm" fontWeight="semibold" color="blue.600">
                        {selectedTrade.teamOne.teamName} gives:
                      </Text>
                      <Text fontSize="sm">
                        Items: {formatTradeItems(selectedTrade.tradeDetails.teamOneGives.items)}
                      </Text>
                      {selectedTrade.tradeDetails.teamOneGives.money > 0 && (
                        <Text fontSize="sm">
                          Money: ₹{selectedTrade.tradeDetails.teamOneGives.money.toLocaleString()}
                        </Text>
                      )}
                    </Box>
                    <Box flex={1}>
                      <Text fontSize="sm" fontWeight="semibold" color="green.600">
                        {selectedTrade.teamTwo.teamName} gives:
                      </Text>
                      <Text fontSize="sm">
                        Items: {formatTradeItems(selectedTrade.tradeDetails.teamTwoGives.items)}
                      </Text>
                      {selectedTrade.tradeDetails.teamTwoGives.money > 0 && (
                        <Text fontSize="sm">
                          Money: ₹{selectedTrade.tradeDetails.teamTwoGives.money.toLocaleString()}
                        </Text>
                      )}
                    </Box>
                  </HStack>
                </Box>

                <Divider />

                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    Round: {selectedTrade.roundNumber}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Date: {new Date(selectedTrade.createdAt).toLocaleString()}
                  </Text>
                </HStack>
                
                {selectedTrade.executedBy && (
                  <Text fontSize="sm" color="gray.600">
                    Executed by: {selectedTrade.executedBy}
                  </Text>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default MyBids;
