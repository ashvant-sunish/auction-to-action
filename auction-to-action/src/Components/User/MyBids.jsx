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
        },
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
      return tradesData.filter((trade) => trade.round === 3);
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
      <Thead bg="theme.surfaceContainer" position="sticky" top={0} zIndex={1}>
        <Tr>
          <Th color="theme.textSecondary" borderColor="theme.outline">
            Items
          </Th>
          <Th isNumeric color="theme.textSecondary" borderColor="theme.outline">
            Amount
          </Th>
          <Th color="theme.textSecondary" borderColor="theme.outline">
            Resources
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((bid) => (
          <Tr key={bid._id} _hover={{ bg: "theme.surfaceHigh" }}>
            <Td borderColor="theme.outline">{formatBidItems(bid)}</Td>
            <Td isNumeric borderColor="theme.outline" color="green.300">
              <Text fontWeight="bold">₹{bid.bidAmount.toLocaleString()}</Text>
            </Td>
            <Td borderColor="theme.outline">
              {bid.resourcesGained ? (
                <VStack align="start" spacing={1}>
                  {Object.entries(bid.resourcesGained).map(
                    ([resource, quantity]) => (
                      <Text key={resource} fontSize="sm">
                        {resource}: {quantity}
                      </Text>
                    ),
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
      <Thead bg="theme.surfaceContainer" position="sticky" top={0} zIndex={1}>
        <Tr>
          <Th color="theme.textSecondary" py={4} borderColor="theme.outline">
            Teams
          </Th>
          <Th color="theme.textSecondary" py={4} borderColor="theme.outline">
            Items Exchanged
          </Th>
          <Th color="theme.textSecondary" py={4} borderColor="theme.outline">
            Money Exchanged
          </Th>
          <Th color="theme.textSecondary" py={4} borderColor="theme.outline">
            Status
          </Th>
          <Th color="theme.textSecondary" py={4} borderColor="theme.outline">
            Date
          </Th>
          <Th color="theme.textSecondary" py={4} borderColor="theme.outline">
            Action
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((trade, index) => (
          <Tr key={trade._id} _hover={{ bg: "theme.surfaceHigh" }}>
            <Td py={4} borderColor="theme.outline">
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
            <Td py={4} borderColor="theme.outline">
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
            <Td py={4} borderColor="theme.outline">
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
            <Td py={4} borderColor="theme.outline">
              <Badge
                colorScheme={trade.status === "completed" ? "green" : "yellow"}
              >
                {trade.status}
              </Badge>
            </Td>
            <Td py={4} color="gray.400" borderColor="theme.outline">
              {new Date(trade.createdAt).toLocaleDateString()}
            </Td>
            <Td py={4} borderColor="theme.outline">
              <ChakraButton
                size="sm"
                colorScheme="blue"
                variant="outline"
                onClick={() => handleViewTrade(trade)}
                _hover={{ bg: "theme.surfaceHigh" }}
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
      <Thead bg="theme.surfaceContainer" position="sticky" top={0} zIndex={1}>
        <Tr>
          <Th color="theme.textSecondary" py={4} borderColor="theme.outline">
            Enterprise ID
          </Th>
          <Th color="theme.textSecondary" py={4} borderColor="theme.outline">
            Name
          </Th>
          <Th
            isNumeric
            color="theme.textSecondary"
            py={4}
            borderColor="theme.outline"
          >
            Worth
          </Th>
          <Th color="theme.textSecondary" py={4} borderColor="theme.outline">
            Constructed Date
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((enterprise, index) => (
          <Tr key={enterprise._id} _hover={{ bg: "theme.surfaceHigh" }}>
            <Td
              py={4}
              fontWeight="bold"
              color="blue.300"
              borderColor="theme.outline"
            >
              ENT-{enterprise.id}
            </Td>
            <Td py={4} fontWeight="medium" borderColor="theme.outline">
              {enterprise.title}
            </Td>
            <Td
              py={4}
              isNumeric
              fontWeight="bold"
              color="green.300"
              borderColor="theme.outline"
            >
              ₹{Number(enterprise.worth).toLocaleString()}
            </Td>
            <Td py={4} color="gray.400" borderColor="theme.outline">
              {new Date(enterprise.constructedAt).toLocaleDateString()}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );

  const renderProductsTable = (data) => (
    <Table variant="simple" size="md" color="white">
      <Thead bg="theme.surfaceContainer" position="sticky" top={0} zIndex={1}>
        <Tr>
          <Th color="theme.textSecondary" py={4} borderColor="theme.outline">
            Product ID
          </Th>
          <Th color="theme.textSecondary" py={4} borderColor="theme.outline">
            Name
          </Th>
          <Th
            isNumeric
            color="theme.textSecondary"
            py={4}
            borderColor="theme.outline"
          >
            Worth
          </Th>
          <Th color="theme.textSecondary" py={4} borderColor="theme.outline">
            Required Enterprise
          </Th>
          <Th color="theme.textSecondary" py={4} borderColor="theme.outline">
            Purchased Date
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((product, index) => (
          <Tr key={product._id} _hover={{ bg: "theme.surfaceHigh" }}>
            <Td
              py={4}
              fontWeight="bold"
              color="blue.300"
              borderColor="theme.outline"
            >
              PROD-{product.id}
            </Td>
            <Td py={4} fontWeight="medium" borderColor="theme.outline">
              {product.title}
            </Td>
            <Td
              py={4}
              isNumeric
              fontWeight="bold"
              color="green.300"
              borderColor="theme.outline"
            >
              ₹{Number(product.worth).toLocaleString()}
            </Td>
            <Td py={4} color="gray.400" borderColor="theme.outline">
              ENT-{product.requiredEnterpriseId}
            </Td>
            <Td py={4} color="gray.400" borderColor="theme.outline">
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
            {/*
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
            */}
          </Flex>
        )}

        <Flex justify="space-between" align="center">
          <Menu gutter={0} matchWidth={true}>
            <MenuButton
              as={ChakraButton}
              rightIcon={<FiChevronDown />}
              bg="theme.surfaceContainer"
              backdropFilter="blur(10px)"
              color="theme.textPrimary"
              border="1px solid"
              borderColor="theme.outline"
              _hover={{ bg: "theme.surfaceHigh", borderColor: "theme.outline" }}
              _active={{ bg: "theme.surfaceHigh" }}
              borderRadius="lg"
              width="350px"
            >
              {ROUND_OPTIONS.find((o) => o.value === selectedRound)?.label ||
                "Select Round"}
            </MenuButton>
            <MenuList
              bg="theme.surface"
              backdropFilter="blur(15px)"
              borderColor="theme.outline"
              color="theme.textPrimary"
              borderRadius="lg"
              border="1px solid"
              boxShadow="0 8px 32px rgba(0, 0, 0, 0.4)"
              width="250px"
              minWidth="250px"
            >
              {ROUND_OPTIONS.map((opt) => (
                <MenuItem
                  key={opt.value}
                  onClick={() => setSelectedRound(opt.value)}
                  bg="transparent"
                  color="theme.textSecondary"
                  _hover={{
                    bg: "theme.surfaceHigh",
                    color: "theme.textPrimary",
                  }}
                  _focus={{
                    bg: "theme.surfaceHigh",
                    color: "theme.textPrimary",
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
          bg="theme.surface"
          backdropFilter="blur(10px)"
          borderRadius="lg"
          border="1px solid"
          borderColor="theme.outline"
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
          bg="rgb(15, 59, 61)"
          color="white"
          border="1px solid"
          borderColor="theme.outline"
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
            <box width="20px"></box>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default MyBids;
