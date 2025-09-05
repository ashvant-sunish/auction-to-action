import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Flex,
  SimpleGrid,
  Icon,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  VStack,
  HStack,
  Text,
  useToast,
  Spinner,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  IconButton,
} from "@chakra-ui/react";
import { MdTrendingDown, MdTrendingUp } from "react-icons/md";
import { FaGavel, FaRupeeSign } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import { FiMaximize, FiMinimize } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import serverUrl from "../../servercon";

const AvailableMaterialsTable = ({
  transactions,
  isFullScreen,
  toggleFullScreen,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const aggregatedMaterials = useMemo(() => {
    const sampleHistory = [
      { material: "2 × Property, 3 × Skilled Labour", amount: "5,000" },
      {
        material: "1 × Property, 2 × Machinery & Tools, 1 × Utilities",
        amount: "4,000",
      },
      { material: "3 × Technology", amount: "5,250" },
    ];

    const history =
      transactions?.length > 0
        ? transactions.map((transaction) => ({
            material: transaction.itemId?.name || "Unknown Item",
            amount: transaction.price?.toString() || "0",
          }))
        : sampleHistory;

    const materialsMap = new Map();

    history.forEach((item) => {
      const materials = item.material.split(",").map((m) => m.trim());
      materials.forEach((material) => {
        const parts = material.split("×").map((p) => p.trim());
        if (parts.length === 2) {
          const count = parseInt(parts[0], 10);
          const name = parts[1];
          const amount =
            (parseInt(item.amount.replace(/,/g, ""), 10) / materials.length) *
            count;

          if (!isNaN(count)) {
            if (materialsMap.has(name)) {
              const existing = materialsMap.get(name);
              materialsMap.set(name, {
                count: existing.count + count,
                totalAmount: existing.totalAmount + amount,
              });
            } else {
              materialsMap.set(name, {
                count: count,
                totalAmount: amount,
              });
            }
          }
        } else {
          // Handle single items
          const name = material;
          const amount = parseInt(item.amount.replace(/,/g, ""), 10);
          if (materialsMap.has(name)) {
            const existing = materialsMap.get(name);
            materialsMap.set(name, {
              count: existing.count + 1,
              totalAmount: existing.totalAmount + amount,
            });
          } else {
            materialsMap.set(name, {
              count: 1,
              totalAmount: amount,
            });
          }
        }
      });
    });

    const sortedMaterials = Array.from(materialsMap.entries()).sort((a, b) =>
      a[0].localeCompare(b[0])
    );

    return sortedMaterials.map(([name, data]) => ({
      name,
      ...data,
    }));
  }, [transactions]);

  const filteredHistory = aggregatedMaterials.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box
      bg="white"
      p={6}
      borderRadius="xl"
      shadow="lg"
      h="full"
      display="flex"
      flexDirection="column"
      border="1px solid"
      borderColor="gray.100"
    >
      <HStack justify="space-between" align="center" mb={4}>
        <HStack>
          <Heading size="md" color="gray.700" fontWeight="600">
            Inventory
          </Heading>
        </HStack>
        <HStack>
          <Box
            bg="blue.50"
            px={3}
            py={1}
            borderRadius="full"
            border="1px solid"
            borderColor="blue.200"
          >
            <Text fontSize="xs" color="blue.600" fontWeight="semibold">
              {filteredHistory.length} Types
            </Text>
          </Box>
          <IconButton
            icon={isFullScreen ? <FiMinimize /> : <FiMaximize />}
            onClick={toggleFullScreen}
            aria-label="Toggle fullscreen"
            variant="ghost"
            size="sm"
          />
        </HStack>
      </HStack>

      <InputGroup mb={4}>
        <InputLeftElement pointerEvents="none">
          <Icon as={FaSearch} color="gray.400" />
        </InputLeftElement>
        <Input
          placeholder="Search materials..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="md"
          bg="gray.50"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="lg"
          _focus={{
            bg: "white",
            borderColor: "blue.300",
            boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.6)",
          }}
          _hover={{
            borderColor: "gray.300",
          }}
        />
      </InputGroup>

      <TableContainer
        overflowY="auto"
        flex="1"
        css={{
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
            borderRadius: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#c1c1c1",
            borderRadius: "8px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#a8a8a8",
          },
        }}
      >
        <Table variant="simple" size="md">
          <Thead position="sticky" top={0} bg="gray.50" zIndex={1}>
            <Tr>
              <Th
                color="gray.600"
                fontWeight="600"
                fontSize="sm"
                textTransform="none"
                borderColor="gray.200"
                py={4}
              >
                Material
              </Th>
              <Th
                isNumeric
                color="gray.600"
                fontWeight="600"
                fontSize="sm"
                textTransform="none"
                borderColor="gray.200"
                py={4}
              >
                Total Items
              </Th>
              <Th
                isNumeric
                color="gray.600"
                fontWeight="600"
                fontSize="sm"
                textTransform="none"
                borderColor="gray.200"
                py={4}
              >
                Approx. Value
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredHistory.map((item, index) => (
              <Tr
                key={index}
                _hover={{ bg: "blue.50" }}
                transition="background-color 0.2s"
              >
                <Td
                  borderColor="gray.100"
                  py={4}
                  fontWeight="500"
                  color="gray.700"
                >
                  <HStack>
                    <Box w={2} h={2} bg="blue.400" borderRadius="full" />
                    <Text>{item.name}</Text>
                  </HStack>
                </Td>
                <Td
                  isNumeric
                  borderColor="gray.100"
                  py={4}
                  fontWeight="500"
                  color="gray.700"
                >
                  {item.count}
                </Td>
                <Td isNumeric borderColor="gray.100" py={4}>
                  <Text fontWeight="600" color="green.600">
                    ₹{Math.round(item.totalAmount).toLocaleString()}
                  </Text>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        {filteredHistory.length === 0 && (
          <Box textAlign="center" py={8} color="gray.500">
            <Icon as={FaSearch} boxSize={8} mb={2} />
            <Text fontSize="sm">No materials found</Text>
            <Text fontSize="xs" color="gray.400">
              Try adjusting your search terms
            </Text>
          </Box>
        )}
      </TableContainer>
    </Box>
  );
};

function DashboardContent({ teamData, balance }) {
  const [budget, setBudget] = useState("₹0");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMaterialsFullScreen, setMaterialsFullScreen] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const toggleMaterialsFullScreen = () =>
    setMaterialsFullScreen(!isMaterialsFullScreen);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await fetch(`${serverUrl}/api/team/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            navigate("/");
          }
          throw new Error("Failed to fetch");
        }
        const data = await response.json();
        setBudget(`₹${data.budget?.toLocaleString() || 0}`);
      } catch (error) {
        toast({
          title: "Error fetching data",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate, toast]);

  const calculateDebit = () => {
    const totalDebit = transactions.reduce(
      (sum, transaction) => sum + (transaction.price || 0),
      0
    );
    return `₹${totalDebit.toLocaleString()}`;
  };

  if (loading) {
    return (
      <Flex h="100%" align="center" justify="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <>
      <Box
        p={6}
        h="calc(100vh - 72px)"
        display="flex"
        flexDirection="column"
        gap={4}
        overflow="hidden"
      >
        <Flex gap={4} flexWrap="wrap">
          <Box flex="1" minW="200px">
            <Box
              p={4}
              shadow="md"
              borderWidth="1px"
              borderRadius="lg"
              bg="white"
              mb={4}
            >
              <Flex>
                <Box
                  pl={4}
                  pr={4}
                  mr={4}
                  bg="green.100"
                  borderRadius="full"
                  justifyContent={"center"}
                  alignItems="center"
                  display="flex"
                >
                  <Icon as={MdTrendingUp} color="green.500" w={8} h={10} />
                </Box>
                <Box>
                  <Text color="gray.500" fontSize="sm">
                    Current Balance
                  </Text>
                  <Text fontWeight="bold" fontSize="2xl">
                    {balance ? `₹${balance.toLocaleString()}` : "₹0"}
                  </Text>
                </Box>
              </Flex>
            </Box>
          </Box>
          <Box flex="1" minW="200px">
            <Box
              p={4}
              shadow="md"
              borderWidth="1px"
              borderRadius="lg"
              bg="white"
              mb={4}
            >
              <Flex>
                <Box
                  pl={4}
                  pr={4}
                  mr={4}
                  bg="red.100"
                  borderRadius="full"
                  justifyContent={"center"}
                  alignItems="center"
                  display="flex"
                >
                  <Icon as={MdTrendingDown} color="red.500" w={8} h={10} />
                </Box>
                <Box>
                  <Text color="gray.500" fontSize="sm">
                    Spended
                  </Text>
                  <Text fontWeight="bold" fontSize="2xl">
                    {calculateDebit()}
                  </Text>
                </Box>
              </Flex>
            </Box>
          </Box>
        </Flex>
        <Box w="100%" flex="1" minH="0">
          <AvailableMaterialsTable
            transactions={transactions}
            isFullScreen={isMaterialsFullScreen}
            toggleFullScreen={toggleMaterialsFullScreen}
          />
        </Box>
      </Box>

      <Modal
        isOpen={isMaterialsFullScreen}
        onClose={toggleMaterialsFullScreen}
        size="full"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalBody p={6} h="100vh" display="flex" flexDirection="column">
            <AvailableMaterialsTable
              transactions={transactions}
              isFullScreen={isMaterialsFullScreen}
              toggleFullScreen={toggleMaterialsFullScreen}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default DashboardContent;
