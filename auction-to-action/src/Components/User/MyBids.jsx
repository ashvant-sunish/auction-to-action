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
  const [enterprisesData, setEnterprisesData] = useState([]);
  const [productsData, setProductsData] = useState([]);
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

      // Fetch bid and trade history
      const historyResponse = await fetch(`${serverUrl}/api/team/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!historyResponse.ok) {
        throw new Error("Failed to fetch transaction history");
      }

      const historyData = await historyResponse.json();
      setBidsData(historyData.bids || []);
      setTradesData(historyData.trades || []);

      // Fetch construction inventory
      const inventoryResponse = await fetch(`${serverUrl}/api/construction/inventory`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (inventoryResponse.ok) {
        const inventoryData = await inventoryResponse.json();
        setEnterprisesData(inventoryData.enterprises || []);
        setProductsData(inventoryData.products || []);
      }
      
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
    } else if (selectedRound === "enterprises") {
      return enterprisesData;
    } else if (selectedRound === "products") {
      return productsData;
    }
    return [];
  };

  const handleViewTrade = (trade) => {
    if (!trade) {
      console.error("Trade object is undefined");
      return;
    }
    setSelectedTrade(trade);
    onOpen();
  };

  const formatTradeItems = (items) => {
    if (!items || items.length === 0) return "No items";
    return items.map(item => `${item.quantity} × ${item.name}`).join(", ");
  };

  const formatBidItems = (bid) => {
    // Round 2 uses mysteryBoxReward, Round 1 uses itemName
    if (bid.round === 2) {
      return bid.mysteryBoxReward || "Mystery Box";
    } else {
      return bid.itemName || "Unknown Item";
    }
  };

  const renderBidsTable = (data) => (
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>Items</Th>
          <Th isNumeric>Amount</Th>
          <Th>Date</Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((bid) => (
          <Tr key={bid._id}>
            <Td>{formatBidItems(bid)}</Td>
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
          <Th>Teams</Th>
          <Th>Items Exchanged</Th>
          <Th>Money Exchanged</Th>
          <Th>Status</Th>
          <Th>Date</Th>
          <Th>Action</Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((trade) => (
          <Tr key={trade._id}>
            <Td>
              <Text fontSize="sm">
                <Text as="span" fontWeight="bold" color="blue.600">
                  {trade.teamOne?.teamName || 'Team 1'}
                </Text>
                {' vs '}
                <Text as="span" fontWeight="bold" color="green.600">
                  {trade.teamTwo?.teamName || 'Team 2'}
                </Text>
              </Text>
            </Td>
            <Td>
              <Text fontSize="xs">
                <Text color="blue.600">
                  {formatTradeItems(trade.teamOneGives?.items) || 'No items'}
                </Text>
                <Text color="gray.500">↔</Text>
                <Text color="green.600">
                  {formatTradeItems(trade.teamTwoGives?.items) || 'No items'}
                </Text>
              </Text>
            </Td>
            <Td>
              <Text fontSize="xs">
                <Text color="blue.600">
                  ₹{(trade.teamOneGives?.money || 0).toLocaleString()}
                </Text>
                <Text color="gray.500">↔</Text>
                <Text color="green.600">
                  ₹{(trade.teamTwoGives?.money || 0).toLocaleString()}
                </Text>
              </Text>
            </Td>
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

  const renderEnterprisesTable = (data) => (
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>Enterprise ID</Th>
          <Th>Name</Th>
          <Th isNumeric>Worth</Th>
          <Th>Constructed Date</Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((enterprise) => (
          <Tr key={enterprise.id}>
            <Td fontWeight="bold">ENT-{enterprise.id}</Td>
            <Td>{enterprise.title}</Td>
            <Td isNumeric>₹{parseInt(enterprise.worth).toLocaleString()}</Td>
            <Td>{new Date(enterprise.constructedAt).toLocaleDateString()}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );

  const renderProductsTable = (data) => (
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>Product ID</Th>
          <Th>Name</Th>
          <Th isNumeric>Worth</Th>
          <Th>Required Enterprise</Th>
          <Th>Purchased Date</Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((product) => (
          <Tr key={product.id}>
            <Td fontWeight="bold">PROD-{product.id}</Td>
            <Td>{product.title}</Td>
            <Td isNumeric>₹{parseInt(product.worth).toLocaleString()}</Td>
            <Td>ENT-{product.requiredEnterpriseId}</Td>
            <Td>{new Date(product.purchasedAt).toLocaleDateString()}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );

  const filteredData = getFilteredData();

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">My History</Heading>
        <Select 
          value={selectedRound} 
          onChange={(e) => setSelectedRound(e.target.value)}
          width="250px"
        >
          <option value="1">Round 1 - Bids</option>
          <option value="2">Round 2 - Bids</option>
          <option value="3">Round 3 - Trades</option>
          <option value="enterprises">Constructed Enterprises</option>
          <option value="products">Purchased Products</option>
        </Select>
      </Flex>

      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      {!loading && (
        <Flex wrap="wrap" gap={4} mb={6}>
          <Box bg="white" p={4} borderRadius="lg" shadow="sm" minW="200px">
            <Text fontSize="sm" color="gray.600">Total Enterprises</Text>
            <Text fontSize="2xl" fontWeight="bold" color="green.600">
              {enterprisesData.length}
            </Text>
            <Text fontSize="xs" color="gray.500">
              Worth: ₹{enterprisesData.reduce((sum, ent) => sum + parseInt(ent.worth), 0).toLocaleString()}
            </Text>
          </Box>
          <Box bg="white" p={4} borderRadius="lg" shadow="sm" minW="200px">
            <Text fontSize="sm" color="gray.600">Total Products</Text>
            <Text fontSize="2xl" fontWeight="bold" color="blue.600">
              {productsData.length}
            </Text>
            <Text fontSize="xs" color="gray.500">
              Worth: ₹{productsData.reduce((sum, prod) => sum + parseInt(prod.worth), 0).toLocaleString()}
            </Text>
          </Box>
          <Box bg="white" p={4} borderRadius="lg" shadow="sm" minW="200px">
            <Text fontSize="sm" color="gray.600">Total Portfolio Value</Text>
            <Text fontSize="2xl" fontWeight="bold" color="purple.600">
              ₹{(
                enterprisesData.reduce((sum, ent) => sum + parseInt(ent.worth), 0) +
                productsData.reduce((sum, prod) => sum + parseInt(prod.worth), 0)
              ).toLocaleString()}
            </Text>
            <Text fontSize="xs" color="gray.500">
              Enterprises + Products
            </Text>
          </Box>
        </Flex>
      )}

      <TableContainer bg="white" p={4} borderRadius="lg" shadow="md">
        {loading ? (
          <Flex justify="center" p={8}>
            <Spinner size="lg" />
          </Flex>
        ) : filteredData.length === 0 ? (
          <Text textAlign="center" py={8} color="gray.500">
            No {
              selectedRound === "3" ? "trades" : 
              selectedRound === "enterprises" ? "constructed enterprises" :
              selectedRound === "products" ? "purchased products" :
              "bids"
            } found{selectedRound === "enterprises" || selectedRound === "products" ? "" : ` for Round ${selectedRound}`}
          </Text>
        ) : selectedRound === "3" ? (
          renderTradesTable(filteredData)
        ) : selectedRound === "enterprises" ? (
          renderEnterprisesTable(filteredData)
        ) : selectedRound === "products" ? (
          renderProductsTable(filteredData)
        ) : (
          renderBidsTable(filteredData)
        )}
      </TableContainer>

      {/* Trade Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Trade Details - {selectedTrade?.tradeId || 'Unknown'}</ModalHeader>
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
                      <Text>{selectedTrade?.teamOne?.teamName || 'Unknown'} ({selectedTrade?.teamOne?.teamCode || 'N/A'})</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.600">Team Two:</Text>
                      <Text>{selectedTrade?.teamTwo?.teamName || 'Unknown'} ({selectedTrade?.teamTwo?.teamCode || 'N/A'})</Text>
                    </Box>
                  </HStack>
                </Box>

                <Divider />

                <Box>
                  <Text fontWeight="bold" mb={2}>Trade Exchange:</Text>
                  <HStack align="start" justify="space-between">
                    <Box flex={1}>
                      <Text fontSize="sm" fontWeight="semibold" color="blue.600">
                        {selectedTrade?.teamOne?.teamName || 'Team One'} gives:
                      </Text>
                      <Text fontSize="sm">
                        Items: {formatTradeItems(selectedTrade?.teamOneGives?.items)}
                      </Text>
                      {(selectedTrade?.teamOneGives?.money || 0) > 0 && (
                        <Text fontSize="sm">
                          Money: ₹{(selectedTrade?.teamOneGives?.money || 0).toLocaleString()}
                        </Text>
                      )}
                    </Box>
                    <Box flex={1}>
                      <Text fontSize="sm" fontWeight="semibold" color="green.600">
                        {selectedTrade?.teamTwo?.teamName || 'Team Two'} gives:
                      </Text>
                      <Text fontSize="sm">
                        Items: {formatTradeItems(selectedTrade?.teamTwoGives?.items)}
                      </Text>
                      {(selectedTrade?.teamTwoGives?.money || 0) > 0 && (
                        <Text fontSize="sm">
                          Money: ₹{(selectedTrade?.teamTwoGives?.money || 0).toLocaleString()}
                        </Text>
                      )}
                    </Box>
                  </HStack>
                </Box>

                <Divider />

                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    Round: {selectedTrade?.roundNumber || 'N/A'}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Date: {selectedTrade?.createdAt ? new Date(selectedTrade.createdAt).toLocaleString() : 'N/A'}
                  </Text>
                </HStack>
                
                {selectedTrade?.executedBy && (
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
