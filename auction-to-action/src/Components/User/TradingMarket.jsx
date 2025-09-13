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
  Text,
  Badge,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import axios from "axios";
import { socketServerUrl } from "../../servercon";
import socketService from "../../services/socket";

function TradingMarket() {
  const [teamTrades, setTeamTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  // Get team number from localStorage
  const getTeamNumber = () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        // Decode token to get team info (assuming JWT)
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.teamNumber;
      }
    } catch (err) {
      console.error("Error getting team number:", err);
    }
    return null;
  };

  // Fetch team's trade history
  const fetchTeamTrades = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const teamNumber = getTeamNumber();
      if (!teamNumber) {
        setError("Team information not found. Please log in again.");
        return;
      }

      const response = await axios.get(`${socketServerUrl}/api/trade/team/${teamNumber}`);
      
      if (response.data.success) {
        setTeamTrades(response.data.trades);
      } else {
        setError("Failed to fetch trade history");
      }
    } catch (err) {
      console.error("Error fetching team trades:", err);
      setError("Failed to load trade history");
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time trade updates
  useEffect(() => {
    fetchTeamTrades();

    // Listen for real-time trade updates
    const handleTradeUpdate = (tradeData) => {
      const teamNumber = getTeamNumber();
      if (teamNumber && (
        tradeData.teams?.includes(teamNumber) ||
        tradeData.teamOne?.teamNumber === teamNumber ||
        tradeData.teamTwo?.teamNumber === teamNumber
      )) {
        toast({
          title: "Trade Update",
          description: "A new trade involving your team has been executed",
          status: "info",
          duration: 4000,
          isClosable: true,
        });
        // Refresh trade data
        fetchTeamTrades();
      }
    };

    // Add listener for trade updates
    if (socketService.getSocket()) {
      socketService.getSocket().on('tradeExecuted', handleTradeUpdate);
    }

    return () => {
      // Cleanup listeners
      if (socketService.getSocket()) {
        socketService.getSocket().off('tradeExecuted', handleTradeUpdate);
      }
    };
  }, [toast]);

  // Format items for display
  const formatItems = (items) => {
    if (!items || items.length === 0) return "None";
    return items.map(item => `${item.quantity}x ${item.name}`).join(", ");
  };

  // Format money for display
  const formatMoney = (amount) => {
    return amount > 0 ? `₹${amount.toLocaleString()}` : "";
  };

  // Get what team gave and received
  const getTradeDetails = (trade, teamNumber) => {
    const isTeamOne = trade.teamOne.teamNumber === teamNumber;
    const teamGives = isTeamOne ? trade.tradeDetails.teamOneGives : trade.tradeDetails.teamTwoGives;
    const teamReceives = isTeamOne ? trade.tradeDetails.teamTwoGives : trade.tradeDetails.teamOneGives;
    const otherTeam = isTeamOne ? trade.teamTwo : trade.teamOne;
    
    return { teamGives, teamReceives, otherTeam };
  };

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading trade history...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Heading mb={6} color="primary.400">
        Trading Market - Your Trade History
      </Heading>
      
      {teamTrades.length === 0 ? (
        <Text fontSize="lg" color="gray.600" textAlign="center" py={10}>
          No trades have been executed for your team yet.
        </Text>
      ) : (
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Trade ID</Th>
                <Th>Other Team</Th>
                <Th>You Gave</Th>
                <Th>You Received</Th>
                <Th>Date</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {teamTrades.map((trade) => {
                const teamNumber = getTeamNumber();
                const { teamGives, teamReceives, otherTeam } = getTradeDetails(trade, teamNumber);
                
                return (
                  <Tr key={trade._id}>
                    <Td fontWeight="bold">{trade.tradeId}</Td>
                    <Td>{otherTeam.teamName} ({otherTeam.teamCode})</Td>
                    <Td>
                      <Box>
                        {formatItems(teamGives.items)}
                        {teamGives.money > 0 && (
                          <Text fontSize="sm" color="green.600">
                            {formatMoney(teamGives.money)}
                          </Text>
                        )}
                      </Box>
                    </Td>
                    <Td>
                      <Box>
                        {formatItems(teamReceives.items)}
                        {teamReceives.money > 0 && (
                          <Text fontSize="sm" color="green.600">
                            {formatMoney(teamReceives.money)}
                          </Text>
                        )}
                      </Box>
                    </Td>
                    <Td>{new Date(trade.createdAt).toLocaleDateString()}</Td>
                    <Td>
                      <Badge 
                        colorScheme={trade.status === 'completed' ? 'green' : 'gray'}
                      >
                        {trade.status}
                      </Badge>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default TradingMarket;