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
      setLastRevealedBox(boxData);
      
      // Parse cash multiplier from content or reward details
      let multiplier = 1;
      
      // Check for multiplier in different places
      if (boxData.content) {
        const cashMatch = boxData.content.match(/(\d+(?:\.\d+)?)[×x]/i);
        if (cashMatch) {
          multiplier = parseFloat(cashMatch[1]);
        }
      }
      
      // For challenge types, check reward details
      if (boxData.itemType === 'challenge' && boxData.reward?.details?.multiplier) {
        multiplier = parseFloat(boxData.reward.details.multiplier);
      }
      
      // For direct cash rewards
      if (boxData.itemType === 'cash' && boxData.reward?.details?.multiplier) {
        multiplier = parseFloat(boxData.reward.details.multiplier);
      }
      
      
      // Auto-fill form based on revealed box
      setFormData(prev => ({
        ...prev,
        mysteryBoxReward: boxData.content || boxData.description || '',
        rewardType: boxData.itemType || 'mystery',
        cashMultiplier: multiplier,
        calculatedCashReward: prev.bidAmount ? parseFloat(prev.bidAmount) * multiplier : 0
      }));

      // Parse resources from content or reward details
      if (boxData.itemType === 'resources' || boxData.itemType === 'challenge') {
        
        if (boxData.reward?.details?.resources) {
          // Use structured resource data if available
          parseResourcesFromStructuredData(boxData.reward.details.resources);
        } else if (boxData.content) {
          // Fallback to content parsing
          parseResourcesFromContent(boxData.content);
        }
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
        setTeams(teamsData);
      } else {
        console.error('Failed to fetch teams');
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const parseResourcesFromStructuredData = (resourcesData) => {
    
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

    // Direct mapping from structured data
    Object.entries(resourcesData).forEach(([resource, amount]) => {
      const normalizedResource = resource.trim();
      
      // Find matching resource in our map
      const matchingResource = Object.keys(resourceMap).find(key => 
        key.toLowerCase() === normalizedResource.toLowerCase() ||
        normalizedResource.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(normalizedResource.toLowerCase())
      );
      
      if (matchingResource && typeof amount === 'number') {
        resourceMap[matchingResource] = amount;
      } else {
        console.log(`❌ Could not map "${normalizedResource}" (amount: ${amount}, type: ${typeof amount})`);
      }
    });


    setFormData(prev => ({
      ...prev,
      resources: resourceMap
    }));
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

    // Remove the challenge instruction part and focus on the rewards
    let rewardsText = content;
    
    // Remove common challenge prefixes
    rewardsText = rewardsText.replace(/say\s+(?:a\s+)?phrase\s+\d+\s+times?\s+to\s+(?:get|win|gain)\s+/gi, '');
    rewardsText = rewardsText.replace(/complete\s+(?:the\s+)?challenge\s+to\s+(?:get|win|gain)\s+/gi, '');
    rewardsText = rewardsText.replace(/(?:get|win|gain)\s+/gi, '');
    
    
    // Split by comma and parse each reward
    const rewardParts = rewardsText.split(',').map(part => part.trim());
    
    rewardParts.forEach(part => {
      // Look for pattern: "number resource_name"
      const match = part.match(/(\d+)\s+(.+)/);
      if (match) {
        const [, amount, resourceName] = match;
        const cleanResourceName = resourceName.trim();
        
        // Find matching resource
        const matchingResource = Object.keys(resourceMap).find(key => 
          key.toLowerCase() === cleanResourceName.toLowerCase() ||
          cleanResourceName.toLowerCase().includes(key.toLowerCase()) ||
          key.toLowerCase().includes(cleanResourceName.toLowerCase())
        );
        
        if (matchingResource) {
          resourceMap[matchingResource] = parseInt(amount);
        } else {
          console.log(`❌ Could not map "${cleanResourceName}" to any known resource`);
          console.log('Available resources:', Object.keys(resourceMap));
        }
      } else {
        console.log(`❌ Could not parse reward part: "${part}"`);
      }
    });

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
        } else {
          newData.teamName = '';
          console.log('No team found for:', value, 'Available teams:', teams);
        }
      }

      // Recalculate cash reward when bid amount changes
      if (field === 'bidAmount') {
        if (prev.rewardType === 'cash') {
          newData.calculatedCashReward = parseFloat(value || 0) * prev.cashMultiplier;
        } else if (prev.rewardType === 'challenge' && prev.cashMultiplier > 1) {
          newData.calculatedCashReward = parseFloat(value || 0) * prev.cashMultiplier;
        } else {
          newData.calculatedCashReward = 0; // No cash reward for resource-only challenges
        }
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
      
      // Only award cash if it's a direct cash reward OR a challenge with multiplier > 1
      if (formData.rewardType === 'cash') {
        finalCashReward = bidAmount * formData.cashMultiplier;
      } else if (formData.rewardType === 'challenge' && formData.cashMultiplier > 1) {
        // Challenge with cash reward (multiplier > 1)
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
        resources: formData.resources, // Include resources for all types
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
        
        // Check if resources were processed by backend
        const resourcesReceived = Object.values(formData.resources).reduce((sum, val) => sum + val, 0);
        const resourcesProcessed = Object.values(result.data?.resourcesGained || {}).reduce((sum, val) => sum + val, 0);
        
        if (resourcesReceived > 0 && resourcesProcessed === 0) {
          console.warn('⚠️ BACKEND ISSUE: Resources sent but not processed!', {
            resourcesSent: formData.resources,
            resourcesReceived: result.data?.resourcesGained || {}
          });
        }
        
        let successMessage = `Mystery box processed for ${formData.teamName}`;
        const resourceCount = Object.values(formData.resources).reduce((sum, val) => sum + val, 0);
        
        // Always show deduction
        successMessage += `\nAmount Deducted: ₹${deductionAmount.toLocaleString()}`;
        
        // Show cash reward if applicable
        if (finalCashReward > 0) {
          successMessage += `\nCash Reward: ₹${finalCashReward.toLocaleString()}\nNet Cash Change: ₹${(finalCashReward - deductionAmount).toLocaleString()}`;
        }
        
        // Show resources if applicable
        if (resourceCount > 0) {
          const resourceDetails = Object.entries(formData.resources)
            .filter(([, amount]) => amount > 0)
            .map(([resource, amount]) => `${amount} ${resource}`)
            .join(', ');
          successMessage += `\nResources Added: ${resourceDetails}`;
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
                        onWheel={(e) => e.target.blur()}
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

                    {/* Challenge Information Display */}
                    {formData.rewardType === 'challenge' && formData.mysteryBoxReward && (
                      <Box bg="orange.50" p={4} rounded="md" borderWidth={1} borderColor="orange.200">
                        <VStack spacing={2}>
                          <Text fontWeight="bold" color="orange.700">Challenge Reward:</Text>
                          <Text fontSize="sm" color="orange.600" textAlign="center">
                            {formData.mysteryBoxReward}
                          </Text>
                          <Text fontSize="sm" color="green.600" fontWeight="medium">
                            ✅ Rewards will be added directly to inventory
                          </Text>
                        </VStack>
                      </Box>
                    )}

                    {/* Cash Calculation Display */}
                    {(formData.rewardType === 'cash' || (formData.rewardType === 'challenge' && formData.cashMultiplier > 1)) && formData.bidAmount && (
                      <Box bg="green.50" p={4} rounded="md" borderWidth={1} borderColor="green.200">
                        <VStack spacing={2}>
                          <Text fontWeight="bold" color="green.700">
                            {formData.rewardType === 'challenge' ? 'Challenge Cash Reward:' : 'Cash Calculation:'}
                          </Text>
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
                              onWheel={(e) => e.target.blur()}
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