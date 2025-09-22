import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button as ChakraButton,
  Flex,
  Text,
  Spinner,
  Alert,
  AlertIcon,
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
import { FiChevronDown } from "react-icons/fi";
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

  const fetchHistory = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to view your bid history");
        setLoading(false);
        return;
      }

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

      const inventoryResponse = await fetch(
        `${serverUrl}/api/construction/inventory`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

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

  const getFilteredData = () => {
    if (selectedRound === "1" || selectedRound === "2") {
      return bidsData.filter((bid) => bid.round === parseInt(selectedRound));
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
    return items.map((item) => `${item.quantity} × ${item.name}`).join(", ");
  };

  const formatBidItems = (bid) => {
    if (bid.round === 2) {
      return bid.mysteryBoxReward || "Mystery Box";
    } else {
      return bid.itemName || "Unknown Item";
    }
  };

  const renderBidsTable = (data) => (
    <Table variant="simple" size="md" color="white">
      <Thead bg="rgba(15, 59, 61, 0.7)" position="sticky" top={0} zIndex={1}>
        <Tr>
          <Th color="gray.300" borderColor="rgba(255, 255, 255, 0.2)">
            Items
          </Th>
          <Th isNumeric color="gray.300" borderColor="rgba(255, 255, 255, 0.2)">
            Amount
          </Th>
          <Th color="gray.300" borderColor="rgba(255, 255, 255, 0.2)">
            Resources
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((bid) => (
          <Tr key={bid._id} _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}>
            <Td borderColor="rgba(255, 255, 255, 0.1)">
              {formatBidItems(bid)}
            </Td>
            <Td isNumeric borderColor="rgba(255, 255, 255, 0.1)">
              ₹{bid.bidAmount.toLocaleString()}
            </Td>
            <Td borderColor="rgba(255, 255, 255, 0.1)">
              {bid.resourcesGained ? (
                <VStack align="start" spacing={1}>
                  {Object.entries(bid.resourcesGained).map(
                    ([resource, quantity]) => (
                      <Text key={resource} fontSize="sm">
                        {resource}: {quantity}
                      </Text>
                    )
                  )}
                </VStack>
              ) : (
                "No resources"
              )}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );

  const renderTradesTable = (data) => (
    <Table variant="simple" size="md" whiteSpace="nowrap" color="white">
      <Thead bg="rgba(15, 59, 61, 0.7)" position="sticky" top={0} zIndex={1}>
        <Tr>
          <Th color="gray.300" py={4} borderColor="rgba(255, 255, 255, 0.2)">
            Teams
          </Th>
          <Th color="gray.300" py={4} borderColor="rgba(255, 255, 255, 0.2)">
            Items Exchanged
          </Th>
          <Th color="gray.300" py={4} borderColor="rgba(255, 255, 255, 0.2)">
            Money Exchanged
          </Th>
          <Th color="gray.300" py={4} borderColor="rgba(255, 255, 255, 0.2)">
            Status
          </Th>
          <Th color="gray.300" py={4} borderColor="rgba(255, 255, 255, 0.2)">
            Date
          </Th>
          <Th color="gray.300" py={4} borderColor="rgba(255, 255, 255, 0.2)">
            Action
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((trade, index) => (
          <Tr key={trade._id} _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}>
            <Td py={4} borderColor="rgba(255, 255, 255, 0.1)">
              <Text fontSize="sm">
                <Text as="span" fontWeight="bold" color="blue.300">
                  {trade.teamOne?.teamName || "Team 1"}
                </Text>
                {" vs "}
                <Text as="span" fontWeight="bold" color="green.300">
                  {trade.teamTwo?.teamName || "Team 2"}
                </Text>
              </Text>
            </Td>
            <Td py={4} borderColor="rgba(255, 255, 255, 0.1)">
              <Text fontSize="xs">
                <Text color="blue.300">
                  {formatTradeItems(trade.teamOneGives?.items) || "No items"}
                </Text>
                <Text color="gray.400">↔</Text>
                <Text color="green.300">
                  {formatTradeItems(trade.teamTwoGives?.items) || "No items"}
                </Text>
              </Text>
            </Td>
            <Td py={4} borderColor="rgba(255, 255, 255, 0.1)">
              <Text fontSize="xs">
                <Text color="blue.300">
                  ₹{(trade.teamOneGives?.money || 0).toLocaleString()}
                </Text>
                <Text color="gray.400">↔</Text>
                <Text color="green.300">
                  ₹{(trade.teamTwoGives?.money || 0).toLocaleString()}
                </Text>
              </Text>
            </Td>
            <Td py={4} borderColor="rgba(255, 255, 255, 0.1)">
              <Badge
                colorScheme={trade.status === "completed" ? "green" : "yellow"}
              >
                {trade.status}
              </Badge>
            </Td>
            <Td py={4} color="gray.400" borderColor="rgba(255, 255, 255, 0.1)">
              {new Date(trade.createdAt).toLocaleDateString()}
            </Td>
            <Td py={4} borderColor="rgba(255, 255, 255, 0.1)">
              <ChakraButton
                size="sm"
                colorScheme="blue"
                variant="outline"
                onClick={() => handleViewTrade(trade)}
                _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
              >
                View Details
              </ChakraButton>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );

  const renderEnterprisesTable = (data) => (
    <Table variant="simple" size="md" color="white">
      <Thead bg="rgba(15, 59, 61, 0.7)" position="sticky" top={0} zIndex={1}>
        <Tr>
          <Th color="gray.300" py={4} borderColor="rgba(255, 255, 255, 0.2)">
            Enterprise ID
          </Th>
          <Th color="gray.300" py={4} borderColor="rgba(255, 255, 255, 0.2)">
            Name
          </Th>
          <Th
            isNumeric
            color="gray.300"
            py={4}
            borderColor="rgba(255, 255, 255, 0.2)"
          >
            Worth
          </Th>
          <Th color="gray.300" py={4} borderColor="rgba(255, 255, 255, 0.2)">
            Constructed Date
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((enterprise, index) => (
          <Tr key={enterprise._id} _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}>
            <Td
              py={4}
              fontWeight="bold"
              color="blue.300"
              borderColor="rgba(255, 255, 255, 0.1)"
            >
              ENT-{enterprise.id}
            </Td>
            <Td
              py={4}
              fontWeight="medium"
              borderColor="rgba(255, 255, 255, 0.1)"
            >
              {enterprise.title}
            </Td>
            <Td
              py={4}
              isNumeric
              fontWeight="bold"
              color="green.300"
              borderColor="rgba(255, 255, 255, 0.1)"
            >
              ₹{Number(enterprise.worth).toLocaleString()}
            </Td>
            <Td py={4} color="gray.400" borderColor="rgba(255, 255, 255, 0.1)">
              {new Date(enterprise.constructedAt).toLocaleDateString()}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );

  const renderProductsTable = (data) => (
    <Table variant="simple" size="md" color="white">
      <Thead bg="rgba(15, 59, 61, 0.7)" position="sticky" top={0} zIndex={1}>
        <Tr>
          <Th color="gray.300" py={4} borderColor="rgba(255, 255, 255, 0.2)">
            Product ID
          </Th>
          <Th color="gray.300" py={4} borderColor="rgba(255, 255, 255, 0.2)">
            Name
          </Th>
          <Th
            isNumeric
            color="gray.300"
            py={4}
            borderColor="rgba(255, 255, 255, 0.2)"
          >
            Worth
          </Th>
          <Th color="gray.300" py={4} borderColor="rgba(255, 255, 255, 0.2)">
            Required Enterprise
          </Th>
          <Th color="gray.300" py={4} borderColor="rgba(255, 255, 255, 0.2)">
            Purchased Date
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((product, index) => (
          <Tr key={product._id} _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}>
            <Td
              py={4}
              fontWeight="bold"
              color="blue.300"
              borderColor="rgba(255, 255, 255, 0.1)"
            >
              PROD-{product.id}
            </Td>
            <Td
              py={4}
              fontWeight="medium"
              borderColor="rgba(255, 255, 255, 0.1)"
            >
              {product.title}
            </Td>
            <Td
              py={4}
              isNumeric
              fontWeight="bold"
              color="green.300"
              borderColor="rgba(255, 255, 255, 0.1)"
            >
              ₹{Number(product.worth).toLocaleString()}
            </Td>
            <Td py={4} color="gray.400" borderColor="rgba(255, 255, 255, 0.1)">
              ENT-{product.requiredEnterpriseId}
            </Td>
            <Td py={4} color="gray.400" borderColor="rgba(255, 255, 255, 0.1)">
              {new Date(product.purchasedAt).toLocaleDateString()}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );

  const filteredData = getFilteredData();

  const ROUND_OPTIONS = [
    { value: "1", label: "Round 1 - Bids" },
    { value: "2", label: "Round 2 - Bids" },
    { value: "3", label: "Round 3 - Trades" },
    { value: "enterprises", label: "Constructed Enterprises" },
    { value: "products", label: "Purchased Products" },
  ];

  return (
    <>
      <VStack spacing={6} align="stretch">
        {!loading && (
          <Flex
            wrap="nowrap"
            gap={6}
            justify="space-between"
            width="100%"
            direction={{ base: "column", md: "row" }}
          >
            <Box
              bg="rgba(15, 59, 61, 0.5)"
              backdropFilter="blur(10px)"
              p={5}
              borderRadius="lg"
              shadow="md"
              flex="1"
              minW={{ base: "100%", md: "300px" }}
              h="120px"
              border="1px solid"
              borderColor="rgba(255, 255, 255, 0.2)"
              color="white"
            >
              <VStack
                align="start"
                spacing={1}
                justifyContent="center"
                h="100%"
              >
                <Text fontSize="md" color="gray.300" fontWeight="medium">
                  Total Enterprises
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="green.300">
                  {enterprisesData.length}
                </Text>
                <Text fontSize="md" color="gray.400">
                  Worth:{" "}
                  <Text as="span" fontWeight="semibold">
                    ₹
                    {enterprisesData
                      .reduce((sum, ent) => sum + Number(ent.worth || 0), 0)
                      .toLocaleString()}
                  </Text>
                </Text>
              </VStack>
            </Box>
            <Box
              bg="rgba(15, 59, 61, 0.5)"
              backdropFilter="blur(10px)"
              p={5}
              borderRadius="lg"
              shadow="md"
              flex="1"
              minW={{ base: "100%", md: "300px" }}
              h="120px"
              border="1px solid"
              borderColor="rgba(255, 255, 255, 0.2)"
              color="white"
            >
              <VStack
                align="start"
                spacing={1}
                justifyContent="center"
                h="100%"
              >
                <Text fontSize="md" color="gray.300" fontWeight="medium">
                  Total Products
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="blue.300">
                  {productsData.length}
                </Text>
                <Text fontSize="md" color="gray.400">
                  Worth:{" "}
                  <Text as="span" fontWeight="semibold">
                    ₹
                    {productsData
                      .reduce((sum, prod) => sum + Number(prod.worth || 0), 0)
                      .toLocaleString()}
                  </Text>
                </Text>
              </VStack>
            </Box>
            <Box
              bg="rgba(15, 59, 61, 0.5)"
              backdropFilter="blur(10px)"
              p={5}
              borderRadius="lg"
              shadow="md"
              flex="1"
              minW={{ base: "100%", md: "300px" }}
              h="120px"
              border="1px solid"
              borderColor="rgba(255, 255, 255, 0.2)"
              color="white"
            >
              <VStack
                align="start"
                spacing={1}
                justifyContent="center"
                h="100%"
              >
                <Text fontSize="md" color="gray.300" fontWeight="medium">
                  Total Portfolio Value
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="purple.300">
                  ₹
                  {(
                    enterprisesData.reduce(
                      (sum, ent) => sum + Number(ent.worth || 0),
                      0
                    ) +
                    productsData.reduce(
                      (sum, prod) => sum + Number(prod.worth || 0),
                      0
                    )
                  ).toLocaleString()}
                </Text>
                <Text fontSize="md" color="gray.400">
                  <Text as="span" fontWeight="semibold">
                    Enterprises + Products
                  </Text>
                </Text>
              </VStack>
            </Box>
          </Flex>
        )}

        <Flex justify="space-between" align="center">
          <Menu gutter={0} matchWidth={true}>
            <MenuButton
              as={ChakraButton}
              rightIcon={<FiChevronDown />}
              bg="rgba(15, 59, 61, 0.5)"
              backdropFilter="blur(10px)"
              color="white"
              border="1px solid rgba(255,255,255,0.2)"
              _hover={{ bg: "rgba(15, 59, 61, 0.7)" }}
              _active={{ bg: "rgba(15, 59, 61, 0.7)" }}
              borderRadius="lg"
              width="250px" // Set a specific width
            >
              {ROUND_OPTIONS.find((o) => o.value === selectedRound)?.label ||
                "Select Round"}
            </MenuButton>
            <MenuList
              bg="rgba(15, 59, 61, 0.8)"
              backdropFilter="blur(15px)"
              borderColor="rgba(255,255,255,0.2)"
              color="white"
              borderRadius="lg"
              border="1px solid rgba(255,255,255,0.2)"
              boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
              width="250px" // Match the MenuButton width
              minWidth="250px" // Ensure minimum width
            >
              {ROUND_OPTIONS.map((opt) => (
                <MenuItem
                  key={opt.value}
                  onClick={() => setSelectedRound(opt.value)}
                  bg="transparent"
                  _hover={{
                    bg: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(10px)",
                  }}
                  _focus={{
                    bg: "rgba(255,255,255,0.1)",
                  }}
                  borderRadius="md"
                  mx={1}
                  my={0.5}
                >
                  {opt.label}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </Flex>

        {error && (
          <Alert
            status="error"
            bg="red.900"
            color="white"
            borderColor="red.700"
          >
            <AlertIcon color="white" />
            {error}
          </Alert>
        )}

        <TableContainer
          bg="rgba(15, 59, 61, 0.5)"
          backdropFilter="blur(10px)"
          borderRadius="lg"
          border="1px solid rgba(255,255,255,0.2)"
        >
          {loading ? (
            <Flex justify="center" p={12}>
              <Spinner size="xl" color="white" />
            </Flex>
          ) : filteredData.length === 0 ? (
            <Text p={12} textAlign="center" color="gray.400">
              No data available for this selection.
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
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalContent
          bg="#0f3b3d"
          color="white"
          borderColor="rgba(255,255,255,0.2)"
        >
          <ModalHeader>Trade Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedTrade && (
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text>
                    <strong>Trade ID:</strong>
                  </Text>
                  <Badge colorScheme="blue">{selectedTrade.tradeId}</Badge>
                </HStack>
                <Divider borderColor="rgba(255,255,255,0.2)" />
                <Box>
                  <Text fontWeight="bold" color="blue.300">
                    Team One: {selectedTrade.teamOne?.teamName}
                  </Text>
                  <Text ml={4}>
                    <strong>Gives:</strong>{" "}
                    {formatTradeItems(selectedTrade.teamOneGives?.items)} & ₹
                    {(selectedTrade.teamOneGives?.money || 0).toLocaleString()}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="green.300">
                    Team Two: {selectedTrade.teamTwo?.teamName}
                  </Text>
                  <Text ml={4}>
                    <strong>Gives:</strong>{" "}
                    {formatTradeItems(selectedTrade.teamTwoGives?.items)} & ₹
                    {(selectedTrade.teamTwoGives?.money || 0).toLocaleString()}
                  </Text>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <ChakraButton
              onClick={onClose}
              bg="rgba(255,255,255,0.1)"
              _hover={{ bg: "rgba(255,255,255,0.2)" }}
            >
              Close
            </ChakraButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default MyBids;
