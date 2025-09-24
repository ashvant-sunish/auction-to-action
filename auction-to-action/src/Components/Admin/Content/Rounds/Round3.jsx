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
  Select,
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
} from "@chakra-ui/react";
import axios from "axios";
import serverUrl from './../../../../servercon';

// Function to generate MongoDB-style ObjectId
const generateObjectId = () => {
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  const randomBytes = 'xxxxxxxxxxxx'.replace(/[x]/g, () => 
    (Math.random() * 16 | 0).toString(16)
  );
  return timestamp + randomBytes;
};

function Round3() {
  const [formData, setFormData] = useState({
    tradeId: generateObjectId(), // Auto-generate trade ID
    teamOne: { teamCode: "", teamName: "", teamNumber: "" },
    teamTwo: { teamCode: "", teamName: "", teamNumber: "" },
    teamOneGives: { items: [], money: 0 },
    teamTwoGives: { items: [], money: 0 }
  });
  const [loading, setLoading] = useState(false);
  const [teamOneItems, setTeamOneItems] = useState([{ name: "", quantity: 1 }]);
  const [teamTwoItems, setTeamTwoItems] = useState([{ name: "", quantity: 1 }]);
  const [teamCodeLoading, setTeamCodeLoading] = useState({ teamOne: false, teamTwo: false });
  const toast = useToast();

  // Common resource types for dropdown
  const resourceTypes = [
    "Property",
    "Skilled Labour", 
    "Construction Material",
    "Machinery & Tools",
    "Technology",
    "Electricity Supply",
    "Utilities",
    "Office Space",
    "Transportation"
  ];

  // Auto-fetch team data when team code is entered
  const fetchTeamByCode = async (teamCode, teamType) => {
    if (!teamCode || teamCode.length < 3) return; // Only fetch for valid team codes
    
    // Check if the same team code is already used by the other team
    const otherTeamType = teamType === 'teamOne' ? 'teamTwo' : 'teamOne';
    if (formData[otherTeamType].teamCode === teamCode.toUpperCase()) {
      toast({
        title: "Duplicate Team Code",
        description: "This team code is already used by the other team. Please enter a different code.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setTeamCodeLoading(prev => ({ ...prev, [teamType]: true }));
      
      // Get admin token
      const adminToken = localStorage.getItem('adminToken');
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

      // Fetch team data by team code
      const response = await axios.get(
        `${serverUrl}/api/admin/teams?teamCode=${teamCode}`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.length > 0) {
        const teamData = response.data[0]; // Get first matching team
        
        setFormData(prev => {
          const newFormData = { ...prev };
          newFormData[teamType] = {
            teamCode: teamData.teamCode,
            teamName: teamData.teamName,
            teamNumber: teamData.teamNumber || teamData._id
          };
          return newFormData;
        });

        toast({
          title: "Team Found",
          description: `${teamData.teamName} loaded for ${teamType === 'teamOne' ? 'Team 1' : 'Team 2'}`,
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
        
        // Clear team name if team not found
        setFormData(prev => {
          const newFormData = { ...prev };
          newFormData[teamType] = {
            ...newFormData[teamType],
            teamName: "",
            teamNumber: ""
          };
          return newFormData;
        });
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
      setTeamCodeLoading(prev => ({ ...prev, [teamType]: false }));
    }
  };
  // Handle team code changes (no auto-fetch)
  const handleTeamCodeChange = (teamType, value) => {
    const upperValue = value.toUpperCase();
    
    // Check for duplicate team codes
    const otherTeamType = teamType === 'teamOne' ? 'teamTwo' : 'teamOne';
    if (upperValue && formData[otherTeamType].teamCode === upperValue) {
      toast({
        title: "Duplicate Team Code",
        description: "This team code is already used by the other team.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }
    
    // Update form data immediately
    setFormData(prev => {
      const newFormData = { ...prev };
      newFormData[teamType] = {
        ...newFormData[teamType],
        teamCode: upperValue,
        // Clear team name and number when code changes
        teamName: "",
        teamNumber: ""
      };
      return newFormData;
    });
  };

  // Handle team code blur or Enter key press
  const handleTeamCodeBlur = (teamType, value) => {
    if (value.trim().length >= 3) {
      fetchTeamByCode(value.trim().toUpperCase(), teamType);
    }
  };

  // Handle Enter key press on team code input
  const handleTeamCodeKeyPress = (e, teamType, value) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (value.trim().length >= 3) {
        fetchTeamByCode(value.trim().toUpperCase(), teamType);
      }
    }
  };

  // Handle input changes for basic form fields
  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Handle team one items changes
  const handleTeamOneItemChange = (index, field, value) => {
    const newItems = [...teamOneItems];
    newItems[index][field] = value;
    setTeamOneItems(newItems);
    
    // Update form data - only include items with both name and quantity > 0
    const validItems = newItems.filter(item => item.name && item.name.trim() !== '' && item.quantity > 0);
    
    setFormData(prev => ({
      ...prev,
      teamOneGives: {
        ...prev.teamOneGives,
        items: validItems
      }
    }));
  };

  // Handle team two items changes
  const handleTeamTwoItemChange = (index, field, value) => {
    const newItems = [...teamTwoItems];
    newItems[index][field] = value;
    setTeamTwoItems(newItems);
    
    // Update form data - only include items with both name and quantity > 0
    const validItems = newItems.filter(item => item.name && item.name.trim() !== '' && item.quantity > 0);
    
    setFormData(prev => ({
      ...prev,
      teamTwoGives: {
        ...prev.teamTwoGives,
        items: validItems
      }
    }));
  };

  // Add new item row for team one
  const addTeamOneItem = () => {
    setTeamOneItems([...teamOneItems, { name: "", quantity: 1 }]);
  };

  // Add new item row for team two
  const addTeamTwoItem = () => {
    setTeamTwoItems([...teamTwoItems, { name: "", quantity: 1 }]);
  };

  // Remove item row
  const removeTeamOneItem = (index) => {
    if (teamOneItems.length > 1) {
      const newItems = teamOneItems.filter((_, i) => i !== index);
      setTeamOneItems(newItems);
      
      const validItems = newItems.filter(item => item.name && item.name.trim() !== '' && item.quantity > 0);
      setFormData(prev => ({
        ...prev,
        teamOneGives: {
          ...prev.teamOneGives,
          items: validItems
        }
      }));
    }
  };

  const removeTeamTwoItem = (index) => {
    if (teamTwoItems.length > 1) {
      const newItems = teamTwoItems.filter((_, i) => i !== index);
      setTeamTwoItems(newItems);
      
      const validItems = newItems.filter(item => item.name && item.name.trim() !== '' && item.quantity > 0);
      setFormData(prev => ({
        ...prev,
        teamTwoGives: {
          ...prev.teamTwoGives,
          items: validItems
        }
      }));
    }
  };

  // Handle money input changes
  const handleMoneyChange = (team, value) => {
    setFormData(prev => ({
      ...prev,
      [`${team}Gives`]: {
        ...prev[`${team}Gives`],
        money: parseInt(value) || 0
      }
    }));
  };

  // Update wishlists after trade
  const updateWishlists = async (tradeData, adminToken) => {
    try {
      
      // Update Team 1's wishlist - remove items they gave
      if (tradeData.teamOneGives.items.length > 0) {
        await axios.put(
          `${serverUrl}/api/admin/update-team-wishlist`,
          {
            teamCode: tradeData.teamOne.teamCode,
            itemsToRemove: tradeData.teamOneGives.items
          },
          {
            headers: {
              'Authorization': `Bearer ${adminToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }

      // Update Team 2's wishlist - remove items they gave
      if (tradeData.teamTwoGives.items.length > 0) {
        await axios.put(
          `${serverUrl}/api/admin/update-team-wishlist`,
          {
            teamCode: tradeData.teamTwo.teamCode,
            itemsToRemove: tradeData.teamTwoGives.items
          },
          {
            headers: {
              'Authorization': `Bearer ${adminToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
    } catch (error) {
      console.error('❌ Error updating wishlists:', error);
      toast({
        title: "Wishlist Update Warning",
        description: "Trade completed but wishlist update failed. Please refresh manually.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  // Execute trade
  const handleExecuteTrade = async () => {
    try {
      setLoading(true);

      // Validate form - Trade ID is auto-generated, so only check team codes
      if (!formData.teamOne.teamCode || !formData.teamTwo.teamCode) {
        toast({
          title: "Validation Error",
          description: "Please fill in both Team Codes",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        return;
      }

      // Validate team names are fetched
      if (!formData.teamOne.teamName || !formData.teamTwo.teamName) {
        toast({
          title: "Validation Error",
          description: "Please ensure both team codes are valid and team names are loaded",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        return;
      }

      // Get admin token
      const adminToken = localStorage.getItem('adminToken');
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

      // Ensure form data is up to date with latest items before sending
      const finalTeamOneItems = teamOneItems.filter(item => item.name && item.name.trim() !== '' && item.quantity > 0);
      const finalTeamTwoItems = teamTwoItems.filter(item => item.name && item.name.trim() !== '' && item.quantity > 0);
      
      // Update formData with final items
      const updatedFormData = {
        ...formData,
        teamOneGives: {
          ...formData.teamOneGives,
          items: finalTeamOneItems
        },
        teamTwoGives: {
          ...formData.teamTwoGives,
          items: finalTeamTwoItems
        }
      };

      // Prepare trade data in the expected format
      const tradeData = {
        tradeId: updatedFormData.tradeId,
        round: 3, // Add round number for Round 3 trades
        teamOne: {
          teamCode: updatedFormData.teamOne.teamCode,
          teamName: updatedFormData.teamOne.teamName
        },
        teamTwo: {
          teamCode: updatedFormData.teamTwo.teamCode,
          teamName: updatedFormData.teamTwo.teamName
        },
        teamOneGives: {
          items: updatedFormData.teamOneGives.items || [],
          money: updatedFormData.teamOneGives.money || 0
        },
        teamTwoGives: {
          items: updatedFormData.teamTwoGives.items || [],
          money: updatedFormData.teamTwoGives.money || 0
        },
        executedBy: JSON.parse(localStorage.getItem('adminUser'))?.username || 'Admin'
      };

      // Execute trade via API
      const response = await axios.post(
        `${serverUrl}/api/trade/execute`,
        tradeData,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast({
          title: "Trade Executed Successfully",
          description: `Trade ${formData.tradeId} completed between ${formData.teamOne.teamName} and ${formData.teamTwo.teamName}`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        // Update wishlists - remove traded items from giving teams
        await updateWishlists(updatedFormData, adminToken);

        // Reset form with new auto-generated trade ID
        setFormData({
          tradeId: generateObjectId(), // Generate new trade ID for next trade
          teamOne: { teamCode: "", teamName: "", teamNumber: "" },
          teamTwo: { teamCode: "", teamName: "", teamNumber: "" },
          teamOneGives: { items: [], money: 0 },
          teamTwoGives: { items: [], money: 0 }
        });
        setTeamOneItems([{ name: "", quantity: 1 }]);
        setTeamTwoItems([{ name: "", quantity: 1 }]);
      }

    } catch (error) {
      console.error("Error executing trade:", error);
      toast({
        title: "Trade Execution Failed",
        description: error.response?.data?.message || "An error occurred while executing the trade",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Define colors based on the design image
  const bgColor = "primary.200"; // Dark teal background
  const inputBgColor = "rgba(255, 255, 255, 0.1)";
  const borderColor = "rgba(255, 255, 255, 0.2)";
  const textColor = "white";

  return (
    <Flex
      minH="100vh"
      bg={bgColor}
      align="center"
      justify="center"
      fontFamily="'Inter', sans-serif"
    >
      <Box
        bg="rgba(0,0,0,0.2)"
        p={{ base: 6, md: 10 }}
        borderRadius="2xl"
        boxShadow="xl"
        w="full"
        maxW="4xl" // Increased max width for the wider layout
        backdropFilter="blur(10px)"
      >
        <VStack spacing={6} align="stretch">
          <Heading
            color={textColor}
            textAlign="center"
            size="lg"
            textTransform="uppercase"
            letterSpacing="wider"
          >
            Round 3 Trading Data Entry
          </Heading>

          {/* Top Level Fields */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <FormControl id="trading-id">
              <FormLabel color={textColor}>Trading ID (Auto-generated)</FormLabel>
              <Flex gap={2}>
                <Input
                  placeholder="Auto-generated Trade ID"
                  bg={inputBgColor}
                  borderColor={borderColor}
                  color={textColor}
                  value={formData.tradeId}
                  isReadOnly
                  _placeholder={{ color: "gray.400" }}
                  fontFamily="monospace"
                  fontSize="sm"
                  flex={1}
                />
                <Button
                  size="sm"
                  colorScheme="green"
                  onClick={() => setFormData(prev => ({ ...prev, tradeId: generateObjectId() }))}
                  minW="70px"
                  title="Generate new Trade ID"
                >
                  Refresh
                </Button>
              </Flex>
            </FormControl>
            <FormControl id="trade-team-1" isRequired>
              <FormLabel color={textColor}>Team 1 Code</FormLabel>
              <Flex gap={2}>
                <Input
                  placeholder="Enter Team 1 Code"
                  bg={inputBgColor}
                  borderColor={borderColor}
                  color={textColor}
                  value={formData.teamOne.teamCode}
                  onChange={(e) => handleTeamCodeChange('teamOne', e.target.value)}
                  onBlur={(e) => handleTeamCodeBlur('teamOne', e.target.value)}
                  onKeyPress={(e) => handleTeamCodeKeyPress(e, 'teamOne', e.target.value)}
                  _placeholder={{ color: "gray.400" }}
                  isDisabled={teamCodeLoading.teamOne}
                  flex={1}
                />
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={() => fetchTeamByCode(formData.teamOne.teamCode, 'teamOne')}
                  isLoading={teamCodeLoading.teamOne}
                  isDisabled={!formData.teamOne.teamCode || formData.teamOne.teamCode.length < 3}
                  minW="60px"
                >
                  Get
                </Button>
              </Flex>
              {teamCodeLoading.teamOne && (
                <Text fontSize="sm" color="yellow.300" mt={1}>
                  Loading team data...
                </Text>
              )}
            </FormControl>
            <FormControl id="trade-team-2" isRequired>
              <FormLabel color={textColor}>Team 2 Code</FormLabel>
              <Flex gap={2}>
                <Input
                  placeholder="Enter Team 2 Code"
                  bg={inputBgColor}
                  borderColor={borderColor}
                  color={textColor}
                  value={formData.teamTwo.teamCode}
                  onChange={(e) => handleTeamCodeChange('teamTwo', e.target.value)}
                  onBlur={(e) => handleTeamCodeBlur('teamTwo', e.target.value)}
                  onKeyPress={(e) => handleTeamCodeKeyPress(e, 'teamTwo', e.target.value)}
                  _placeholder={{ color: "gray.400" }}
                  isDisabled={teamCodeLoading.teamTwo}
                  flex={1}
                />
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={() => fetchTeamByCode(formData.teamTwo.teamCode, 'teamTwo')}
                  isLoading={teamCodeLoading.teamTwo}
                  isDisabled={!formData.teamTwo.teamCode || formData.teamTwo.teamCode.length < 3}
                  minW="60px"
                >
                  Get
                </Button>
              </Flex>
              {teamCodeLoading.teamTwo && (
                <Text fontSize="sm" color="yellow.300" mt={1}>
                  Loading team data...
                </Text>
              )}
            </FormControl>
          </SimpleGrid>

          {/* Team Names - Auto-populated */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <FormControl>
              <FormLabel color={textColor}>Team 1 Name (Auto-filled)</FormLabel>
              <Input
                placeholder="Team name will appear here..."
                bg={inputBgColor}
                borderColor={borderColor}
                value={formData.teamOne.teamName}
                isReadOnly
                _placeholder={{ color: "gray.400" }}
                fontWeight={formData.teamOne.teamName ? "semibold" : "normal"}
                color={formData.teamOne.teamName ? "green.300" : textColor}
              />
            </FormControl>
            <FormControl>
              <FormLabel color={textColor}>Team 2 Name (Auto-filled)</FormLabel>
              <Input
                placeholder="Team name will appear here..."
                bg={inputBgColor}
                borderColor={borderColor}
                value={formData.teamTwo.teamName}
                isReadOnly
                _placeholder={{ color: "gray.400" }}
                fontWeight={formData.teamTwo.teamName ? "semibold" : "normal"}
                color={formData.teamTwo.teamName ? "green.300" : textColor}
              />
            </FormControl>
          </SimpleGrid>

          <Divider borderColor="rgba(255, 255, 255, 0.3)" />

          {/* Trade Details Section */}
          <Box>
            <Heading size="md" color={textColor} mb={4} textAlign="center">
              Trade Details
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
              {/* Team 1 Offers */}
              <Box>
                <Text fontWeight="semibold" color={textColor} mb={3}>
                  Team 1 Gives:
                </Text>
                <VStack spacing={3}>
                  {teamOneItems.map((item, index) => (
                    <Flex key={index} gap={3} w="full">
                      <Select
                        placeholder="Select Resource"
                        bg={inputBgColor}
                        borderColor={borderColor}
                        color={textColor}
                        value={item.name}
                        onChange={(e) => handleTeamOneItemChange(index, 'name', e.target.value)}
                        flex={2}
                      >
                        {resourceTypes.map((resource) => (
                          <option key={resource} value={resource} style={{color: 'black'}}>
                            {resource}
                          </option>
                        ))}
                      </Select>
                      <NumberInput
                        value={item.quantity}
                        onChange={(value) => handleTeamOneItemChange(index, 'quantity', parseInt(value) || 1)}
                        min={1}
                        flex={1}
                        bg={inputBgColor}
                        borderColor={borderColor}
                      >
                        <NumberInputField color={textColor} />
                        <NumberInputStepper>
                          <NumberIncrementStepper color={textColor} />
                          <NumberDecrementStepper color={textColor} />
                        </NumberInputStepper>
                      </NumberInput>
                      <Button
                        size="sm"
                        colorScheme="red"
                        onClick={() => removeTeamOneItem(index)}
                        isDisabled={teamOneItems.length === 1}
                      >
                        Remove
                      </Button>
                    </Flex>
                  ))}
                  <Button
                    size="sm"
                    colorScheme="green"
                    onClick={addTeamOneItem}
                    w="full"
                  >
                    Add Item
                  </Button>
                  <FormControl>
                    <FormLabel color={textColor}>Money Amount:</FormLabel>
                    <NumberInput
                      value={formData.teamOneGives.money}
                      onChange={(value) => handleMoneyChange('teamOne', value)}
                      min={0}
                      bg={inputBgColor}
                      borderColor={borderColor}
                    >
                      <NumberInputField placeholder="0" color={textColor} />
                      <NumberInputStepper>
                        <NumberIncrementStepper color={textColor} />
                        <NumberDecrementStepper color={textColor} />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </VStack>
              </Box>

              {/* Team 2 Offers */}
              <Box>
                <Text fontWeight="semibold" color={textColor} mb={3}>
                  Team 2 Gives:
                </Text>
                <VStack spacing={3}>
                  {teamTwoItems.map((item, index) => (
                    <Flex key={index} gap={3} w="full">
                      <Select
                        placeholder="Select Resource"
                        bg={inputBgColor}
                        borderColor={borderColor}
                        color={textColor}
                        value={item.name}
                        onChange={(e) => handleTeamTwoItemChange(index, 'name', e.target.value)}
                        flex={2}
                      >
                        {resourceTypes.map((resource) => (
                          <option key={resource} value={resource} style={{color: 'black'}}>
                            {resource}
                          </option>
                        ))}
                      </Select>
                      <NumberInput
                        value={item.quantity}
                        onChange={(value) => handleTeamTwoItemChange(index, 'quantity', parseInt(value) || 1)}
                        min={1}
                        flex={1}
                        bg={inputBgColor}
                        borderColor={borderColor}
                      >
                        <NumberInputField color={textColor} />
                        <NumberInputStepper>
                          <NumberIncrementStepper color={textColor} />
                          <NumberDecrementStepper color={textColor} />
                        </NumberInputStepper>
                      </NumberInput>
                      <Button
                        size="sm"
                        colorScheme="red"
                        onClick={() => removeTeamTwoItem(index)}
                        isDisabled={teamTwoItems.length === 1}
                      >
                        Remove
                      </Button>
                    </Flex>
                  ))}
                  <Button
                    size="sm"
                    colorScheme="green"
                    onClick={addTeamTwoItem}
                    w="full"
                  >
                    Add Item
                  </Button>
                  <FormControl>
                    <FormLabel color={textColor}>Money Amount:</FormLabel>
                    <NumberInput
                      value={formData.teamTwoGives.money}
                      onChange={(value) => handleMoneyChange('teamTwo', value)}
                      min={0}
                      bg={inputBgColor}
                      borderColor={borderColor}
                    >
                      <NumberInputField placeholder="0" color={textColor} />
                      <NumberInputStepper>
                        <NumberIncrementStepper color={textColor} />
                        <NumberDecrementStepper color={textColor} />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </VStack>
              </Box>
            </SimpleGrid>
          </Box>

          <Button
            colorScheme="green"
            size="lg"
            w="full"
            py={6}
            fontSize="lg"
            fontWeight="bold"
            onClick={handleExecuteTrade}
            isLoading={loading}
            loadingText="Executing Trade..."
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "lg",
            }}
            transition="all 0.2s"
          >
            Execute Trade
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
}

export default Round3;
