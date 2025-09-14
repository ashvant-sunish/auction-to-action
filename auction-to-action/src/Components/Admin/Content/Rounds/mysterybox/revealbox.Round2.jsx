
import { useState, useEffect } from "react";
import { 
  Button, 
  useToast, 
  Box, 
  Text, 
  VStack, 
  HStack, 
  Tag,
  Select,
  Divider,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import serverUrl, { socketServerUrl } from "../../../../../servercon";
import io from "socket.io-client";

// colors
const colors = {
  primary: {
    50: '#6BA3BE',
    100: '#0C969C',
    150: '#0A7075',
    200: '#032F30',
  },
  dark: '#031716',
  bg: '#274D60',
  white: '#FFFFFF',
};

// icons
const contentIcons = {
  cash: "💰",
  nothing: "😶",
  resources: "📦",
  challenge: "🎯"
};

export const RevealBoxRound2 = () => {
  const [selectedBoxNumber, setSelectedBoxNumber] = useState("");
  const [mysteryBoxes, setMysteryBoxes] = useState([]);
  const [revealedBoxes, setRevealedBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminInfo, setAdminInfo] = useState(null);
  const toast = useToast();
  const [socket, setSocket] = useState(null);

  // Fetch admin info to check permissions
  const fetchAdminInfo = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const response = await fetch(`${serverUrl}/api/mysterybox/admin-info`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAdminInfo(data);
      }
    } catch (error) {
      console.error('Error fetching admin info:', error);
    }
  };

  // Fetch mystery boxes from database
  const fetchMysteryBoxes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${serverUrl}/api/mysterybox`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMysteryBoxes(data);
      } else {
        setError('Failed to fetch mystery boxes');
      }
    } catch (error) {
      console.error('Error fetching mystery boxes:', error);
      setError('Error loading mystery boxes');
    } finally {
      setLoading(false);
    }
  };

  // Initialize socket connection and fetch data
  useEffect(() => {
    const newSocket = io(socketServerUrl);
    setSocket(newSocket);
    
    fetchAdminInfo();
    fetchMysteryBoxes();

    // Socket event listeners
    newSocket.on('mysteryBoxRevealed', (data) => {
      console.log('Mystery box revealed:', data);
      setRevealedBoxes(prev => [...prev, data.boxId]);
      fetchMysteryBoxes(); // Refresh data
    });

    newSocket.on('mysteryBoxReset', () => {
      console.log('Mystery boxes reset');
      setRevealedBoxes([]);
      fetchMysteryBoxes();
    });

    newSocket.on('mysteryBoxUndo', (data) => {
      console.log('Mystery box undo:', data);
      setRevealedBoxes(prev => prev.filter(id => id !== data.boxId));
      fetchMysteryBoxes();
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const revealBox = async () => {
    // Check if user has permission to reveal
    if (!adminInfo || !adminInfo.canReveal) {
      toast({
        title: "Access Denied",
        description: "Only super admins can reveal mystery boxes",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const num = parseInt(selectedBoxNumber);
    const box = mysteryBoxes.find(b => b.boxId === num);
    
    if (!box) {
      toast({
        title: "Invalid Box",
        description: "Please select a valid box number",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${serverUrl}/api/mysterybox/reveal/${box.boxId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          // Send empty data since we're not using form data anymore
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reveal box');
      }

      toast({
        title: "Box Revealed!",
        description: `Box ${box.boxId} has been revealed successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Add to revealed boxes
      setRevealedBoxes(prev => [...prev, box.boxId]);

      // Reset selection
      setSelectedBoxNumber("");

      // Refresh data
      fetchMysteryBoxes();
    } catch (err) {
      console.error('Error revealing box:', err);
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const undoLastAction = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${serverUrl}/api/mysterybox/undo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to undo');
      }

      toast({
        title: "Undo Successful",
        description: data.message,
        status: "info",
        duration: 3000,
        isClosable: true,
      });

      // Remove the last revealed box
      setRevealedBoxes(prev => prev.slice(0, -1));

      // Refresh data
      fetchMysteryBoxes();
    } catch (err) {
      console.error('Error undoing:', err);
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const resetGame = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${serverUrl}/api/mysterybox/reset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset');
      }

      toast({
        title: "Game Reset",
        description: "All boxes sealed again!",
        status: "info",
        duration: 3000,
        isClosable: true,
      });

      setSelectedBoxNumber("");
      setRevealedBoxes([]); // Clear all revealed boxes
      
      // Refresh data
      fetchMysteryBoxes();
    } catch (err) {
      console.error('Error resetting:', err);
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Since we're not tracking reveal state, we'll show total boxes available
  const totalBoxes = mysteryBoxes.length;

  if (loading) {
    return (
      <Box minH="100vh" bgGradient={`linear(to-b, ${colors.dark}, ${colors.bg})`} color={colors.white} p={8} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color={colors.primary[100]} />
          <Text>Loading mystery boxes...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box minH="100vh" bgGradient={`linear(to-b, ${colors.dark}, ${colors.bg})`} color={colors.white} p={8}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bgGradient={`linear(to-b, ${colors.dark}, ${colors.bg})`} color={colors.white} p={8} overflow="auto">
      <Box maxW="6xl" mx="auto">
        <VStack spacing={6} mb={10}>
          <HStack spacing={3} align="center">
            <Text fontSize="4xl">🎁</Text>
            <Text fontSize="5xl" fontWeight="extrabold" letterSpacing="wide" color={colors.primary[50]}>Mystery Boxes</Text>
          </HStack>

          <HStack spacing={3} maxW="md" mx="auto" w="100%" justify="center">
            <Select
              placeholder="Select box number"
              value={selectedBoxNumber}
              onChange={(e) => setSelectedBoxNumber(e.target.value)}
              fontSize="md"
              h={12}
              bg={colors.primary[200]}
              color="white"
              borderColor={colors.primary[150]}
              _focus={{ borderColor: colors.primary[100], boxShadow: "0 0 0 2px #0C969C" }}
            >
              {mysteryBoxes.map((box) => (
                <option key={box.boxId} value={box.boxId} style={{ background: colors.dark, color: 'white' }}>
                  Box {box.boxId}
                </option>
              ))}
            </Select>
            <Button
              onClick={revealBox}
              isDisabled={!selectedBoxNumber}
              px={6}
              h={12}
              fontWeight="bold"
              bgGradient={`linear(to-r, ${colors.primary[100]}, ${colors.primary[150]})`}
              _hover={{ bgGradient: `linear(to-r, ${colors.primary[50]}, ${colors.primary[100]})`, transform: "scale(1.05)" }}
              transition="all 0.2s"
              color="white"
              borderRadius="xl"
              shadow="lg"
            >
              Reveal
            </Button>
          </HStack>

          <HStack spacing={4}>
            <Button
              onClick={undoLastAction}
              isDisabled={revealedBoxes.length === 0}
              variant="outline"
              borderColor={colors.primary[150]}
              color={colors.primary[50]}
              _hover={{ bg: colors.primary[200], transform: "scale(1.05)" }}
              size="sm"
            >
              Undo Last
            </Button>
            <Button
              onClick={resetGame}
              variant="outline"
              borderColor={colors.primary[150]}
              color={colors.primary[50]}
              _hover={{ bg: colors.primary[200], transform: "scale(1.05)" }}
              size="sm"
            >
              Reset Game
            </Button>
          </HStack>
        </VStack>

        <Box textAlign="center" mt={8}>
          <Text fontSize="xl" color={colors.primary[50]}>Total Mystery Boxes: {totalBoxes}</Text>
        </Box>
      </Box>
    </Box>
  );
};

export default RevealBoxRound2;