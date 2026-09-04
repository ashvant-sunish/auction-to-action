import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Flex,
  Icon,
  Heading,
  HStack,
  Text,
  VStack,
  SimpleGrid,
  Divider,
} from "@chakra-ui/react";
import { MdTrendingUp, MdTrendingDown } from "react-icons/md";
import { FaGavel, FaRupeeSign, FaCubes, FaIndustry } from "react-icons/fa";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { PiConfettiBold } from "react-icons/pi";
import serverUrl from "../../servercon";
import { io } from "socket.io-client";

// Visual Asset Inventory Grid instead of a Table
const VisualAssetGallery = ({ resources }) => {
  const resourcesArray = useMemo(() => {
    if (!resources || typeof resources !== "object") return [];
    const entries = resources instanceof Map ? Array.from(resources.entries()) : Object.entries(resources);
    
    return entries
      .filter(([name, quantity]) => quantity > 0)
      .map(([name, quantity]) => {
        let multipleyer = 1;
        if (name === "Technology") multipleyer = 2500;
        else if (name === "Transportation") multipleyer = 1000;
        else if (name === "Property") multipleyer = 2000;
        else if (name === "Skilled Labour") multipleyer = 1000;
        else if (name === "Machinery & Tools") multipleyer = 1800;
        else if (name === "Utilities") multipleyer = 800;
        else if (name === "Electricity Supply") multipleyer = 1500;
        else if (name === "Office Space") multipleyer = 1500;
        else if (name === "Construction Material") multipleyer = 1200;
        else multipleyer = 0;
        
        return {
          name,
          count: quantity,
          totalAmount: quantity * multipleyer,
        };
      })
      .sort((a, b) => b.totalAmount - a.totalAmount); // Sort by value descending
  }, [resources]);

  if (resourcesArray.length === 0) {
    return (
      <Box textAlign="center" py={12} color="gray.500" border="1px dashed rgba(255,255,255,0.1)">
        <Icon as={FaCubes} boxSize={10} mb={4} opacity={0.5} />
        <Text fontSize="lg" letterSpacing="widest" textTransform="uppercase">No Active Assets</Text>
      </Box>
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
      {resourcesArray.map((item, index) => (
        <Box 
          key={index}
          position="relative"
          bg="rgba(13, 17, 23, 0.6)"
          border="1px solid rgba(255, 255, 255, 0.05)"
          p={5}
          transition="all 0.3s"
          _hover={{
            bg: "rgba(255, 255, 255, 0.03)",
            borderColor: "rgba(232, 255, 0, 0.3)",
            transform: "translateY(-2px)"
          }}
        >
          {/* Subtle Accent Edge */}
          <Box position="absolute" top={0} left={0} w="4px" h="100%" bg="rgba(232, 255, 0, 0.4)" />
          
          <VStack align="flex-start" spacing={1} ml={2}>
            <Text color="gray.400" fontSize="xs" textTransform="uppercase" letterSpacing="wider">
              {item.name}
            </Text>
            <Flex w="100%" justify="space-between" align="flex-end" pt={2}>
              <Box>
                <Text fontSize="sm" color="gray.500">QTY</Text>
                <Text fontSize="2xl" fontWeight="300" color="white" lineHeight="1">{item.count}</Text>
              </Box>
              <Box textAlign="right">
                <Text fontSize="sm" color="gray.500">VAL</Text>
                <Text fontSize="lg" fontWeight="600" color="#e8ff00" lineHeight="1">
                  ₹{Math.round(item.totalAmount).toLocaleString()}
                </Text>
              </Box>
            </Flex>
          </VStack>
        </Box>
      ))}
    </SimpleGrid>
  );
};

function DashboardContent({ teamData, currentRound, gameState, teamNumber }) {
  const [selectedNumber, setSelectedNumber] = useState("0");
  const [currentRevealedBox, setCurrentRevealedBox] = useState("0");
  const [enterpriseWorth, setEnterpriseWorth] = useState(0);
  const [productWorth, setProductWorth] = useState(0);

  const fetchLiveData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      if (gameState === 1) {
        const response = await fetch(`${serverUrl}/api/admin/live-auction-status`, { headers: { Authorization: `Bearer ${token}` } });
        if (response.ok) {
          const data = await response.json();
          setSelectedNumber(data.selectedNumber || "0");
        }
      }

      if (gameState === 3) {
        const response = await fetch(`${serverUrl}/api/mysterybox/revealed-count`, { headers: { Authorization: `Bearer ${token}` } });
        if (response.ok) {
          const data = await response.json();
          setCurrentRevealedBox(data.currentRevealedBox?.toString() || "0");
        }
      }

      if (gameState === 5) {
        const response = await fetch(`${serverUrl}/api/construction/portfolio-worth`, { headers: { Authorization: `Bearer ${token}` } });
        if (response.ok) {
          const data = await response.json();
          setEnterpriseWorth(data.enterpriseWorth || 0);
          setProductWorth(data.productWorth || 0);
        }
      }
    } catch (error) {
      console.error("Error fetching live data:", error);
    }
  };

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 10000);
    const socket = io(serverUrl);

    socket.on("bidPlaced", () => gameState === 1 && fetchLiveData());
    socket.on("mysteryBoxRevealed", () => gameState === 3 && fetchLiveData());
    socket.on("enterpriseConstructed", () => gameState === 5 && fetchLiveData());
    socket.on("productPurchased", () => gameState === 5 && fetchLiveData());

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, [gameState]);

  const credit = teamData?.credit ?? 0;
  const debit = teamData?.debit ?? 0;
  const resources = teamData?.resources ?? {};
  const totalBalance = credit - debit;

  const getRoundDisplayText = (state) => {
    const displays = {
      0: "NOT STARTED",
      1: "ROUND 1 - ACTIVE",
      2: "ROUND 1 - CONCLUDED",
      3: "ROUND 2 - ACTIVE",
      4: "ROUND 2 - CONCLUDED",
      5: "ROUND 3 - ACTIVE",
      6: "ROUND 3 - CONCLUDED",
    };
    return displays[state] || "STANDBY";
  };

  return (
    <Box display="flex" flexDirection="column" gap={8} overflowY="auto" h="full" pb={10} px={2}>
      
      {/* 1. STATUS STRIP */}
      <Flex 
        bg="rgba(13, 17, 23, 0.7)" 
        borderBottom="1px solid rgba(232, 255, 0, 0.15)"
        py={2} px={4} 
        align="center" 
        justify="space-between"
      >
        <HStack spacing={3}>
          <Box w={2} h={2} bg="#e8ff00" borderRadius="full" boxShadow="0 0 10px #e8ff00" />
          <Text color="#e8ff00" fontSize="sm" fontWeight="600" letterSpacing="widest">LIVE STATUS</Text>
        </HStack>
        <Text color="white" fontSize="xs" letterSpacing="widest" fontWeight="300">
          {getRoundDisplayText(gameState || currentRound)}
        </Text>
      </Flex>

      {/* 2. FINANCIAL HERO SECTION */}
      <Flex direction={{ base: "column", lg: "row" }} gap={8} align="flex-start">
        {/* Dominant Balance Area */}
        <Box flex="1">
          <HStack spacing={{ base: 6, md: 12 }}>
            <Box>
              <Text color="gray.500" fontSize="sm" letterSpacing="widest" textTransform="uppercase" mb={2}>
                BALANCE
              </Text>
              <Text 
                fontSize={{ base: "4xl", md: "6xl" }} 
                fontWeight="300" 
                color="green.400" 
                lineHeight="1"
                fontFamily="'Inter', sans-serif"
              >
                ₹{totalBalance.toLocaleString()}
              </Text>
            </Box>
            <Divider orientation="vertical" h="80px" borderColor="rgba(255,255,255,0.1)" />
            <Box>
              <Text color="gray.500" fontSize="sm" letterSpacing="widest" textTransform="uppercase" mb={2}>
                DEBIT
              </Text>
              <Text 
                fontSize={{ base: "4xl", md: "6xl" }} 
                fontWeight="300" 
                color="red.400" 
                lineHeight="1"
                fontFamily="'Inter', sans-serif"
              >
                ₹{debit.toLocaleString()}
              </Text>
            </Box>
          </HStack>
        </Box>

        {/* Dynamic Contextual Metrics */}
        <Box flex="1" w="full" bg="rgba(255,255,255,0.02)" p={6} borderLeft="2px solid rgba(255,255,255,0.05)">
          {gameState === 1 && (
            <VStack align="flex-start" spacing={1}>
              <Text color="gray.500" fontSize="xs" letterSpacing="widest">AUCTION FOCUS</Text>
              <Text fontSize="4xl" color="#e8ff00" fontWeight="200">LOT {selectedNumber}</Text>
              <Text color="gray.400" fontSize="sm">Current active item in wheel</Text>
            </VStack>
          )}
          {gameState === 3 && (
            <VStack align="flex-start" spacing={1}>
              <Text color="gray.500" fontSize="xs" letterSpacing="widest">MYSTERY BOXES</Text>
              <Text fontSize="4xl" color="#e8ff00" fontWeight="200">{currentRevealedBox} REVEALED</Text>
            </VStack>
          )}
          {gameState === 5 && (
            <VStack align="flex-start" spacing={1}>
              <Text color="gray.500" fontSize="xs" letterSpacing="widest">PORTFOLIO VALUATION</Text>
              <Text fontSize="4xl" color="#e8ff00" fontWeight="200">₹{(enterpriseWorth + productWorth).toLocaleString()}</Text>
              <HStack mt={2} color="gray.400" fontSize="sm">
                <Text>Enterprises: ₹{enterpriseWorth.toLocaleString()}</Text>
                <Text>•</Text>
                <Text>Products: ₹{productWorth.toLocaleString()}</Text>
              </HStack>
            </VStack>
          )}
          {![1,3,5].includes(gameState) && (
            <VStack align="flex-start" spacing={1}>
              <Text color="gray.500" fontSize="xs" letterSpacing="widest">SYSTEM</Text>
              <Text fontSize="4xl" color="gray.300" fontWeight="200">STANDBY</Text>
              <Text color="gray.400" fontSize="sm">Awaiting admin initialization</Text>
            </VStack>
          )}
        </Box>
      </Flex>

      <Divider borderColor="rgba(255, 255, 255, 0.05)" />

      {/* 3. ASSET INVENTORY GALLERY */}
      <Box>
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="md" color="white" fontWeight="300" letterSpacing="wider">
            ASSET INVENTORY
          </Heading>
          <Text color="gray.500" fontSize="sm">Active Resource Holdings</Text>
        </Flex>
        <VisualAssetGallery resources={resources} />
      </Box>

    </Box>
  );
}

export default DashboardContent;
