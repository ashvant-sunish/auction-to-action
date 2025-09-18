import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  Text,
  useToast,
  Divider,
  Badge,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Flex,
  IconButton,
  Tooltip
} from '@chakra-ui/react';
import { FaPlus, FaMinus } from 'react-icons/fa';
import io from 'socket.io-client';
import serverUrl from './../../../../../servercon';

const FormRound2 = () => {
  const [formData, setFormData] = useState({
    teamName: '',
    teamId: '',
    bidAmount: '',
    mysteryBoxReward: '',
    rewardType: '',
    cashMultiplier: 1,
    calculatedCashReward: 0,
    resources: {
      'Technology': 0,
      'Transportation': 0,
      'Property': 0,
      'Skilled Labour': 0,
      'Machinery & Tools': 0,
      'Utilities': 0,
      'Electricity Supply': 0,
      'Office Space': 0,
      'Construction Material': 0
    }
  });

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [lastRevealedBox, setLastRevealedBox] = useState(null);
  const toast = useToast();

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(serverUrl);
    setSocket(newSocket);

    // Listen for mystery box reveals
    newSocket.on('mysteryBoxRevealed', (boxData) => {
      console.log('Mystery box revealed:', boxData);
      setLastRevealedBox(boxData);
      
      // Parse cash multiplier from content
      let multiplier = 1;
      if (boxData.content && boxData.itemType === 'cash') {
        const cashMatch = boxData.content.match(/(\d+(?:\.\d+)?)[×x]/i);
        if (cashMatch) {
          multiplier = parseFloat(cashMatch[1]);
        }
      }
      
      // Auto-fill form based on revealed box
      setFormData(prev => ({
        ...prev,
        mysteryBoxReward: boxData.content || boxData.description || '',
        rewardType: boxData.itemType || 'mystery',
        cashMultiplier: multiplier,
        calculatedCashReward: prev.bidAmount ? parseFloat(prev.bidAmount) * multiplier : 0
      }));

      // Parse resources from content if it's a resource type or challenge type
      if ((boxData.itemType === 'resources' || boxData.itemType === 'challenge') && boxData.content) {
        parseResourcesFromContent(boxData.content);
      }

      toast({
        title: 'Mystery Box Revealed',
        description: `Box ${boxData.boxId}: ${boxData.itemName}`,
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    });

    // Listen for reset events
    newSocket.on('mysteryBoxReset', () => {
      handleReset();
      toast({
        title: 'Mystery Boxes Reset',
        description: 'All mystery boxes have been reset',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    });

    // Listen for undo events
    newSocket.on('mysteryBoxUndo', () => {
      toast({
        title: 'Action Undone',
        description: 'Last action has been undone',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Fetch teams for autocomplete
  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${serverUrl}/api/admin/teams`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const teamsData = await response.json();
        console.log('Fetched teams data:', teamsData);
        setTeams(teamsData);
      } else {
        console.error('Failed to fetch teams');
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const parseResourcesFromContent = (content) => {
    const resourceMap = {
      'Technology': 0,
      'Transportation': 0,
      'Property': 0,
      'Skilled Labour': 0,
      'Machinery & Tools': 0,
      'Utilities': 0,
      'Electricity Supply': 0,
      'Office Space': 0,
      'Construction Material': 0
    };

    // Parse content like "Gain 6 Technology, 2 Utilities" or "Say phrase 5 times to get 5 Property, 3 Skilled Labour"
    const matches = content.match(/(\d+)\s+([^,]+)/g);
    if (matches) {
      matches.forEach(match => {
        const [, amount, resource] = match.match(/(\d+)\s+(.+)/);
        const cleanResource = resource.trim();
        
        // Check if this resource exists in our map
        const matchingResource = Object.keys(resourceMap).find(key => 
          cleanResource.toLowerCase().includes(key.toLowerCase()) ||
          key.toLowerCase().includes(cleanResource.toLowerCase())
        );
        
        if (matchingResource) {
          resourceMap[matchingResource] = parseInt(amount);
        }
      });
    }

    setFormData(prev => ({
      ...prev,
      resources: resourceMap
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };

      // Auto-fill team name when team ID is entered
      if (field === 'teamId') {
        // Try to find team by teamId, teamCode, or both
        const selectedTeam = teams.find(team => {
          const teamIdMatch = team.teamId && team.teamId.toString().toLowerCase() === value.toLowerCase();
          const teamCodeMatch = team.teamCode && team.teamCode.toString().toLowerCase() === value.toLowerCase();
          const idMatch = team._id && team._id.toString().toLowerCase() === value.toLowerCase();
          return teamIdMatch || teamCodeMatch || idMatch;
        });
        
        if (selectedTeam) {
          newData.teamName = selectedTeam.teamName;
          console.log('Found team:', selectedTeam);
        } else {
          newData.teamName = '';
          console.log('No team found for:', value, 'Available teams:', teams);
        }
      }

      // Recalculate cash reward when bid amount changes
      if (field === 'bidAmount' && prev.rewardType === 'cash') {
        newData.calculatedCashReward = parseFloat(value || 0) * prev.cashMultiplier;
      }

      return newData;
    });
  };

  const handleResourceChange = (resource, value) => {
    setFormData(prev => ({
      ...prev,
      resources: {
        ...prev.resources,
        [resource]: Math.max(0, parseInt(value) || 0)
      }
    }));
  };

  const incrementResource = (resource) => {
    setFormData(prev => ({
      ...prev,
      resources: {
        ...prev.resources,
        [resource]: prev.resources[resource] + 1
      }
    }));
  };

  const decrementResource = (resource) => {
    setFormData(prev => ({
      ...prev,
      resources: {
        ...prev.resources,
        [resource]: Math.max(0, prev.resources[resource] - 1)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.teamName || !formData.teamId) {
      toast({
        title: 'Error',
        description: 'Please enter a valid team ID',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.bidAmount || parseFloat(formData.bidAmount) <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid bid amount',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      const bidAmount = parseFloat(formData.bidAmount);
      
      // Calculate final amounts based on reward type
      let finalCashReward = 0;
      let deductionAmount = bidAmount; // Always deduct the bid amount
      
      if (formData.rewardType === 'cash') {
        finalCashReward = bidAmount * formData.cashMultiplier;
      }
      
      const tradeData = {
        teamId: formData.teamId,
        teamName: formData.teamName,
        bidAmount: bidAmount,
        deductionAmount: deductionAmount, // Amount to deduct from team account
        cashReward: finalCashReward, // Amount to add to team account
        cashMultiplier: formData.cashMultiplier,
        mysteryBoxReward: formData.mysteryBoxReward,
        rewardType: formData.rewardType,
        resources: formData.resources,
        round: 2,
        tradeType: 'mystery_box_reward'
      };

      const response = await fetch(`${serverUrl}/api/trade/submit-trade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tradeData)
      });

      if (response.ok) {
        const result = await response.json();
        
        let successMessage = `Mystery box processed for ${formData.teamName}`;
        if (formData.rewardType === 'cash') {
          successMessage += `\nDeducted: ₹${deductionAmount.toLocaleString()}\nReward: ₹${finalCashReward.toLocaleString()}\nNet Gain: ₹${(finalCashReward - deductionAmount).toLocaleString()}`;
        }
        if (result.data && result.data.newBalance !== undefined) {
          successMessage += `\nNew Balance: ₹${result.data.newBalance.toLocaleString()}`;
        }
        
        toast({
          title: 'Trade Submitted Successfully',
          description: successMessage,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Reset form
        handleReset();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit trade');
      }
    } catch (error) {
      console.error('Error submitting trade:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit trade',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      teamName: '',
      teamId: '',
      bidAmount: '',
      mysteryBoxReward: '',
      rewardType: '',
      cashMultiplier: 1,
      calculatedCashReward: 0,
      resources: {
        'Technology': 0,
        'Transportation': 0,
        'Property': 0,
        'Skilled Labour': 0,
        'Machinery & Tools': 0,
        'Utilities': 0,
        'Electricity Supply': 0,
        'Office Space': 0,
        'Construction Material': 0
      }
    });
    setLastRevealedBox(null);
  };

  const getRewardTypeColor = (type) => {
    switch (type) {
      case 'cash': return 'green';
      case 'resources': return 'blue';
      case 'challenge': return 'orange';
      case 'nothing': return 'gray';
      default: return 'purple';
    }
  };

  const totalResources = Object.values(formData.resources).reduce((sum, val) => sum + val, 0);

  return (
    <Box maxW="1200px" mx="auto" p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Card>
          <CardHeader>
            <Flex justify="space-between" align="center">
              <Heading size="lg" color="blue.600">Round 2: Mystery Box Form</Heading>
              {lastRevealedBox && (
                <Badge colorScheme={getRewardTypeColor(lastRevealedBox.itemType)} fontSize="md" p={2}>
                  Last Revealed: Box {lastRevealedBox.boxId}
                </Badge>
              )}
            </Flex>
          </CardHeader>
        </Card>

        <form onSubmit={handleSubmit}>
          <Grid templateColumns="repeat(12, 1fr)" gap={6}>
            {/* Team Selection */}
            <GridItem colSpan={6}>
              <Card>
                <CardHeader>
                  <Heading size="md">Team Information</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Team ID</FormLabel>
                      <Input
                        placeholder="Enter team code (e.g., T001, TEAM001)"
                        value={formData.teamId}
                        onChange={(e) => handleInputChange('teamId', e.target.value)}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Team Name</FormLabel>
                      <Input
                        value={formData.teamName}
                        readOnly
                        bg="gray.50"
                        placeholder="Auto-filled when team ID is entered"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Bid Amount (₹)</FormLabel>
                      <Input
                        type="number"
                        value={formData.bidAmount}
                        onChange={(e) => handleInputChange('bidAmount', e.target.value)}
                        placeholder="Enter bid amount"
                      />
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>

            {/* Mystery Box Reward */}
            <GridItem colSpan={6}>
              <Card>
                <CardHeader>
                  <Heading size="md">Mystery Box Reward</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel>Reward Type</FormLabel>
                      <Select
                        value={formData.rewardType}
                        onChange={(e) => handleInputChange('rewardType', e.target.value)}
                      >
                        <option value="">Select type</option>
                        <option value="cash">Cash</option>
                        <option value="resources">Resources</option>
                        <option value="challenge">Challenge</option>
                        <option value="nothing">Nothing</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Reward Description</FormLabel>
                      <Input
                        value={formData.mysteryBoxReward}
                        onChange={(e) => handleInputChange('mysteryBoxReward', e.target.value)}
                        placeholder="Auto-filled from mystery box reveal"
                        bg={formData.mysteryBoxReward ? "green.50" : "white"}
                      />
                    </FormControl>

                    {formData.rewardType && (
                      <Badge 
                        colorScheme={getRewardTypeColor(formData.rewardType)} 
                        fontSize="sm" 
                        p={2}
                        rounded="md"
                      >
                        {formData.rewardType.toUpperCase()} REWARD
                      </Badge>
                    )}

                    {/* Cash Calculation Display */}
                    {formData.rewardType === 'cash' && formData.bidAmount && (
                      <Box bg="green.50" p={4} rounded="md" borderWidth={1} borderColor="green.200">
                        <VStack spacing={2}>
                          <Text fontWeight="bold" color="green.700">Cash Calculation:</Text>
                          <HStack spacing={4} justify="space-between" w="full">
                            <Text>Bid Amount:</Text>
                            <Text fontWeight="bold">₹{parseFloat(formData.bidAmount).toLocaleString()}</Text>
                          </HStack>
                          <HStack spacing={4} justify="space-between" w="full">
                            <Text>Multiplier:</Text>
                            <Text fontWeight="bold">{formData.cashMultiplier}×</Text>
                          </HStack>
                          <Divider />
                          <HStack spacing={4} justify="space-between" w="full">
                            <Text color="red.600">Amount Deducted:</Text>
                            <Text fontWeight="bold" color="red.600">-₹{parseFloat(formData.bidAmount).toLocaleString()}</Text>
                          </HStack>
                          <HStack spacing={4} justify="space-between" w="full">
                            <Text color="green.600">Cash Reward:</Text>
                            <Text fontWeight="bold" color="green.600">+₹{formData.calculatedCashReward.toLocaleString()}</Text>
                          </HStack>
                          <HStack spacing={4} justify="space-between" w="full">
                            <Text fontWeight="bold" color="blue.600">Net Gain:</Text>
                            <Text fontWeight="bold" color="blue.600">
                              +₹{(formData.calculatedCashReward - parseFloat(formData.bidAmount)).toLocaleString()}
                            </Text>
                          </HStack>
                        </VStack>
                      </Box>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>

            {/* Resources */}
            <GridItem colSpan={12}>
              <Card>
                <CardHeader>
                  <Flex justify="space-between" align="center">
                    <Heading size="md">Resources</Heading>
                    <Badge colorScheme="blue" fontSize="sm">
                      Total: {totalResources} items
                    </Badge>
                  </Flex>
                </CardHeader>
                <CardBody>
                  <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                    {Object.entries(formData.resources).map(([resource, amount]) => (
                      <GridItem key={resource}>
                        <FormControl>
                          <FormLabel fontSize="sm">{resource}</FormLabel>
                          <HStack>
                            <IconButton
                              icon={<FaMinus />}
                              size="sm"
                              onClick={() => decrementResource(resource)}
                              colorScheme="red"
                              variant="outline"
                            />
                            <Input
                              type="number"
                              value={amount}
                              onChange={(e) => handleResourceChange(resource, e.target.value)}
                              textAlign="center"
                              min="0"
                              size="sm"
                            />
                            <IconButton
                              icon={<FaPlus />}
                              size="sm"
                              onClick={() => incrementResource(resource)}
                              colorScheme="green"
                              variant="outline"
                            />
                          </HStack>
                        </FormControl>
                      </GridItem>
                    ))}
                  </Grid>
                </CardBody>
              </Card>
            </GridItem>

            {/* Action Buttons */}
            <GridItem colSpan={12}>
              <Card>
                <CardBody>
                  <HStack spacing={4} justify="center">
                    <Button
                      type="submit"
                      colorScheme="blue"
                      size="lg"
                      isLoading={loading}
                      loadingText="Submitting..."
                      px={8}
                    >
                      Submit Mystery Box Reward
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={handleReset}
                      px={8}
                    >
                      Reset Form
                    </Button>
                  </HStack>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        </form>

        {/* Real-time Status */}
        {lastRevealedBox && (
          <Card bg="blue.50" borderColor="blue.200" borderWidth={2}>
            <CardBody>
              <VStack spacing={2} align="start">
                <Text fontWeight="bold" color="blue.700">
                  Last Revealed Mystery Box:
                </Text>
                <HStack spacing={4}>
                  <Badge colorScheme="blue">Box {lastRevealedBox.boxId}</Badge>
                  <Text>{lastRevealedBox.itemName}</Text>
                  <Badge colorScheme={getRewardTypeColor(lastRevealedBox.itemType)}>
                    {lastRevealedBox.itemType}
                  </Badge>
                </HStack>
                <Text fontSize="sm" color="gray.600">
                  {lastRevealedBox.content || lastRevealedBox.description}
                </Text>
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Box>
  );
};

export default FormRound2;