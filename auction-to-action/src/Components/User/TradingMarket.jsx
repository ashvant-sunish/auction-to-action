import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  Text,
  VStack,
  HStack,
  Grid,
  Button,
  Collapse,
  Spinner,
  Alert,
  AlertIcon,
  IconButton,
} from "@chakra-ui/react";
import { FaSearch, FaChevronDown, FaChevronUp, FaSync } from "react-icons/fa";
import axios from "axios";
import socketService from "../../services/socket";
import serverUrl from "./../../servercon";

const TradingMarket = () => {
  const [teams, setTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleDetails, setVisibleDetails] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Get current user's team code to exclude from the list
  const getCurrentTeamCode = () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.teamCode;
      }
    } catch (err) {
      console.error("Error getting team code:", err);
    }
    return null;
  };

  const fetchTeamsData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Fetch all teams with their trade wishlists
      const response = await axios.get(
        `${serverUrl}/api/team/all-trade-offers?t=${Date.now()}`, // Add cache-busting timestamp
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        const currentTeamCode = getCurrentTeamCode();
        // Filter out current team from the list
        const otherTeams = response.data.teams.filter(
          (team) => team.teamCode !== currentTeamCode
        );
        
        // Log detailed wishlist data for debugging
        otherTeams.forEach(team => {
          if (team.tradeWishlist && team.tradeWishlist.length > 0) {
            console.log(`📋 ${team.teamCode} (${team.teamName}) wishlist:`, 
              team.tradeWishlist.map(item => `${item.name}: ${item.count}`).join(', '));
          }
        });
        setTeams(otherTeams);
      } else {
        setError("Failed to fetch teams data");
      }
    } catch (err) {
      console.error("Error fetching teams data:", err);
      setError("Failed to load trading offers");
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchTeamsData();

    // Ensure socket is connected
    const initializeSocket = () => {
      try {
        // Check if socket is already connected
        if (!socketService.isSocketConnected()) {
          socketService.connect();
        }
        
        // Wait a bit for connection to establish
        setTimeout(() => {
          if (socketService.isSocketConnected()) {
            console.log("✅ Socket connection confirmed for TradingMarket");
          } else {
            console.log("⚠️ Socket connection not established, but will still try to listen");
          }
        }, 1000);
      } catch (error) {
        console.error("❌ Error initializing socket:", error);
      }
    };

    initializeSocket();

    // Listen for real-time trade wishlist updates
    const handleWishlistUpdate = (data) => {
      // Add a small delay to ensure backend processing is complete
      setTimeout(() => fetchTeamsData(true), 500);
    };

    const handleWishlistUpdatedAfterTrade = (data) => {
      // Refresh teams data when wishlists are updated after a trade
      setTimeout(() => fetchTeamsData(true), 500);
    };

    const handleWishlistRefresh = (data) => {
      setTimeout(() => fetchTeamsData(true), 300);
    };

    const handleTeamDataUpdated = (data) => {
      setTimeout(() => fetchTeamsData(true), 300);
    };

    const handleForceWishlistReload = (data) => {
      setTimeout(() => fetchTeamsData(true), 300);
    };

    const handleTradeExecuted = (data) => {
      // Immediate refresh plus a delayed one to catch any async updates
      fetchTeamsData(true);
      setTimeout(() => fetchTeamsData(true), 1000);
    };

    // Set up socket listeners with retry logic
    const setupSocketListeners = () => {
      const socket = socketService.getSocket();
      if (socket) {
        socket.on("tradeWishlistSubmitted", handleWishlistUpdate);
        socket.on("tradeWishlistUpdated", handleWishlistUpdatedAfterTrade);
        socket.on("wishlistRefresh", handleWishlistRefresh);
        socket.on("teamDataUpdated", handleTeamDataUpdated);
        socket.on("forceWishlistReload", handleForceWishlistReload);
        socket.on("tradeExecuted", handleTradeExecuted);
        
        return true;
      } else {
        console.log("❌ Socket service not available");
        return false;
      }
    };

    // Try to set up listeners, with retry
    if (!setupSocketListeners()) {
      console.log("🔄 Retrying socket listener setup in 2 seconds...");
      setTimeout(() => {
        setupSocketListeners();
      }, 2000);
    }

    return () => {
      const socket = socketService.getSocket();
      if (socket) {
        socket.off("tradeWishlistSubmitted", handleWishlistUpdate);
        socket.off("tradeWishlistUpdated", handleWishlistUpdatedAfterTrade);
        socket.off("wishlistRefresh", handleWishlistRefresh);
        socket.off("teamDataUpdated", handleTeamDataUpdated);
        socket.off("forceWishlistReload", handleForceWishlistReload);
        socket.off("tradeExecuted", handleTradeExecuted);
      }
    };
  }, []);

  const filteredTeams = teams.filter((team) => {
    // Only show teams that have submitted trade wishlists
    if (!team.tradeWishlist || team.tradeWishlist.length === 0) {
      return false;
    }

    // Filter by search query in trade wishlist items only
    if (searchQuery === "") {
      return true;
    }

    const searchLower = searchQuery.toLowerCase();
    return team.tradeWishlist.some((item) =>
      item.name.toLowerCase().includes(searchLower)
    );
  });

  const toggleDetails = (teamId) => {
    setVisibleDetails((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(teamId)) {
        newSet.delete(teamId);
      } else {
        newSet.add(teamId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <Box
        minH="100vh"
        bg="transparent"
        p={8}
        display="flex"
        flexDirection="column"
        alignItems="center"
        fontFamily="Inter, sans-serif"
      >
        <Box maxW="1200px" w="full">
          <Heading
            size="xl"
            textAlign="center"
            color="white"
            mb={8}
            fontFamily="Inter, sans-serif"
          >
            Trading Offers
          </Heading>
          <Flex justify="center" align="center" minH="400px">
            <VStack spacing={4}>
              <Spinner size="xl" color="blue.400" thickness="4px" />
              <Text color="gray.300" fontFamily="Inter, sans-serif">
                Loading trading offers...
              </Text>
            </VStack>
          </Flex>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        minH="100vh"
        bg="transparent"
        p={8}
        display="flex"
        flexDirection="column"
        alignItems="center"
        fontFamily="Inter, sans-serif"
      >
        <Box maxW="1200px" w="full">
          <Heading
            size="xl"
            textAlign="center"
            color="white"
            mb={8}
            fontFamily="Inter, sans-serif"
          >
            Trading Offers
          </Heading>
          <Alert
            status="error"
            bg="rgba(239, 68, 68, 0.1)"
            border="1px solid"
            borderColor="rgba(239, 68, 68, 0.3)"
            borderRadius="lg"
          >
            <AlertIcon color="red.400" />
            <Text color="red.300" fontFamily="Inter, sans-serif">
              {error}
            </Text>
          </Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      minH="100vh"
      bg="transparent"
      p={8}
      display="flex"
      flexDirection="column"
      alignItems="center"
      fontFamily="Inter, sans-serif"
    >
      <Box maxW="1200px" w="full">
        <Flex justify="space-between" align="center" mb={8}>
          <Heading
            size="xl"
            color="white"
            fontFamily="Inter, sans-serif"
          >
            Trading Offers
          </Heading>
          <Flex align="center" gap={3}>
            {refreshing && (
              <Flex align="center" gap={2} color="blue.300">
                <Spinner size="sm" />
                <Text fontSize="sm" fontFamily="Inter, sans-serif">
                  Updating...
                </Text>
              </Flex>
            )}
            <IconButton
              icon={<FaSync />}
              aria-label="Refresh trading offers"
              size="md"
              bg="rgba(59, 130, 246, 0.2)"
              color="blue.300"
              border="1px solid"
              borderColor="rgba(59, 130, 246, 0.3)"
              _hover={{
                bg: "rgba(59, 130, 246, 0.3)",
                borderColor: "rgba(59, 130, 246, 0.5)",
              }}
              onClick={() => fetchTeamsData(true)}
              isLoading={refreshing}
              title="Manually refresh trading offers"
            />
          </Flex>
        </Flex>

        {/* Search Bar - matching dashboard style */}
        <Box mb={8}>
          <InputGroup size="lg">
            <InputLeftElement pointerEvents="none" h="full">
              <Icon as={FaSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search for items teams want to trade (e.g., 'Property')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg="rgba(0, 0, 0, 0.2)"
              border="1px solid"
              borderColor="rgba(255, 255, 255, 0.2)"
              borderRadius="lg"
              color="white"
              fontFamily="Inter, sans-serif"
              _placeholder={{ color: "gray.400" }}
              _focus={{
                bg: "rgba(0, 0, 0, 0.3)",
                borderColor: "blue.300",
                boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.6)",
              }}
              _hover={{
                borderColor: "rgba(255, 255, 255, 0.3)",
              }}
            />
          </InputGroup>
        </Box>

        {/* Teams Grid */}
        <Grid
          templateColumns={{
            base: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          }}
          gap={6}
          alignItems="start"
        >
          {filteredTeams.length > 0 ? (
            filteredTeams.map((team) => (
              <Box
                key={team._id}
                bg="rgba(15, 59, 61, 0.5)"
                backdropFilter="blur(10px)"
                p={6}
                borderRadius="xl"
                shadow="lg"
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.2)"
                color="white"
                transition="all 0.2s"
                alignSelf="start"
                _hover={{
                  transform: "translateY(-2px)",
                  shadow: "xl",
                  borderColor: "rgba(255, 255, 255, 0.3)",
                }}
              >
                <Flex justify="space-between" align="center" mb={4}>
                  <Heading
                    size="md"
                    color="white"
                    fontFamily="Inter, sans-serif"
                  >
                    {team.teamName}
                  </Heading>
                  <Button
                    onClick={() => toggleDetails(team._id)}
                    size="sm"
                    bg="rgba(59, 130, 246, 0.2)"
                    color="blue.300"
                    border="1px solid"
                    borderColor="rgba(59, 130, 246, 0.3)"
                    borderRadius="full"
                    minW="40px"
                    h="40px"
                    _hover={{
                      bg: "rgba(59, 130, 246, 0.3)",
                      borderColor: "rgba(59, 130, 246, 0.5)",
                    }}
                    _active={{
                      bg: "rgba(59, 130, 246, 0.2)",
                    }}
                  >
                    {visibleDetails.has(team._id) ? (
                      <Icon as={FaChevronUp} />
                    ) : (
                      <Icon as={FaChevronDown} />
                    )}
                  </Button>
                </Flex>

                <Collapse in={visibleDetails.has(team._id)} animateOpacity>
                  <Box
                    pt={4}
                    borderTop="1px solid"
                    borderColor="rgba(255, 255, 255, 0.1)"
                  >
                    <Text
                      fontWeight="600"
                      color="blue.300"
                      mb={3}
                      fontFamily="Inter, sans-serif"
                    >
                      Items They Want to Trade:
                    </Text>
                    <VStack align="start" spacing={2}>
                      {team.tradeWishlist && team.tradeWishlist.length > 0 ? (
                        team.tradeWishlist.map((item, index) => (
                          <HStack key={index} spacing={2}>
                            <Box
                              w={2}
                              h={2}
                              bg="blue.400"
                              borderRadius="full"
                            />
                            <Text
                              color="gray.200"
                              fontFamily="Inter, sans-serif"
                            >
                              <Text as="span" fontWeight="600" color="white">
                                {item.count}x
                              </Text>{" "}
                              {item.name}
                            </Text>
                          </HStack>
                        ))
                      ) : (
                        <Text
                          color="gray.400"
                          fontStyle="italic"
                          fontFamily="Inter, sans-serif"
                        >
                          No trade wishlist submitted yet
                        </Text>
                      )}
                    </VStack>
                  </Box>
                </Collapse>
              </Box>
            ))
          ) : (
            <Box gridColumn="1 / -1" textAlign="center">
              <VStack spacing={4}>
                <Icon as={FaSearch} boxSize={12} color="gray.400" />
                <Text
                  color="gray.300"
                  fontSize="lg"
                  fontFamily="Inter, sans-serif"
                >
                  No teams found matching your search.
                </Text>
                <Text
                  color="gray.400"
                  fontSize="sm"
                  fontFamily="Inter, sans-serif"
                >
                  Try searching for different items or check back later for new
                  trade offers.
                </Text>
              </VStack>
            </Box>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default TradingMarket;
