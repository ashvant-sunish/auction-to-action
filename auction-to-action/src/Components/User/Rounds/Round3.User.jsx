import React, { useState, useMemo } from "react";
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
} from "@chakra-ui/react";
import { FaRupeeSign, FaSearch } from "react-icons/fa";

// This is a copy of the AvailableMaterialsTable from the dashboard
const AvailableMaterialsTable = ({ transactions }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [tradeItems, setTradeItems] = useState({});
  const toast = useToast();

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
              materialsMap.set(name, { count, totalAmount: amount });
            }
          }
        } else {
          const name = material;
          if (materialsMap.has(name)) {
            materialsMap.get(name).count += 1;
          } else {
            materialsMap.set(name, { count: 1, totalAmount: 0 });
          }
        }
      });
    });
    const sortedMaterials = Array.from(materialsMap.entries()).sort((a, b) =>
      a[0].localeCompare(b[0])
    );
    return sortedMaterials.map(([name, data]) => ({ name, ...data }));
  }, [transactions]);

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
    const totalCount =
      aggregatedMaterials.find((m) => m.name === itemName)?.count || 0;
    const newCount = Math.max(
      0,
      Math.min(parseInt(value, 10) || 0, totalCount)
    );

    setTradeItems((prev) => ({
      ...prev,
      [itemName]: { ...prev[itemName], count: newCount },
    }));
  };

  const handleSubmitTrade = () => {
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

    // Here you would typically send the data to a backend
    console.log("Submitting trade:", itemsToTrade);
    toast({
      title: "Trade Submitted!",
      description: `You are offering ${itemsToTrade
        .map((item) => `${item.count} × ${item.name}`)
        .join(", ")}.`,
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };

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
          <Icon as={FaRupeeSign} color="blue.500" boxSize={5} />
          <Heading size="md" color="gray.700" fontWeight="600">
            Available Materials for Trade
          </Heading>
        </HStack>
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
        />
      </InputGroup>
      <TableContainer
        overflowY="auto"
        flex="1"
        css={{
          "&::-webkit-scrollbar": { width: "8px" },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
            borderRadius: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#c1c1c1",
            borderRadius: "8px",
          },
          "&::-webkit-scrollbar-thumb:hover": { background: "#a8a8a8" },
        }}
      >
        <Table variant="simple" size="md">
          <Thead position="sticky" top={0} bg="gray.50" zIndex={1}>
            <Tr>
              <Th color="gray.600">Material</Th>
              <Th color="gray.600" isNumeric>
                Total Items
              </Th>
              <Th color="gray.600" isNumeric>
                No. of Items to Trade
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredHistory.map((item, index) => (
              <Tr key={index} _hover={{ bg: "blue.50" }}>
                <Td>
                  <HStack>
                    <Checkbox
                      borderColor="gray.300"
                      colorScheme="teal"
                      isChecked={tradeItems[item.name]?.isSelected || false}
                      onChange={(e) =>
                        handleCheckboxChange(item.name, e.target.checked)
                      }
                    />
                    <Text color="gray.700">{item.name}</Text>
                  </HStack>
                </Td>
                <Td isNumeric color="gray.700">
                  {item.count}
                </Td>
                <Td isNumeric>
                  <Flex justifyContent="flex-end">
                    <NumberInput
                      size="sm"
                      width="80px"
                      min={0}
                      max={item.count}
                      defaultValue={0}
                      isDisabled={!tradeItems[item.name]?.isSelected}
                      value={tradeItems[item.name]?.count || 0}
                      onChange={(value) =>
                        handleQuantityChange(item.name, value)
                      }
                      _disabled={{ opacity: 1 }}
                    >
                      <NumberInputField
                        borderColor="gray.300"
                        color="black"
                        _disabled={{ color: "black" }}
                      />
                    </NumberInput>
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      <Flex justify="flex-end" mt={4}>
        <Button colorScheme="teal" onClick={handleSubmitTrade}>
          Submit Trade
        </Button>
      </Flex>
    </Box>
  );
};

function Round3User() {
  const [showMaterials, setShowMaterials] = useState(false);
  // This state is passed to the table; it uses sample data if the array is empty.
  const [transactions, setTransactions] = useState([]);

  return (
    <Box>
      <Button
        onClick={() => setShowMaterials(!showMaterials)}
        mb={4}
        colorScheme="teal"
      >
        {showMaterials
          ? "Hide Available Materials"
          : "Show Available Materials"}
      </Button>
      <Collapse in={showMaterials}>
        <AvailableMaterialsTable transactions={transactions} />
      </Collapse>
    </Box>
  );
}

export default Round3User;
