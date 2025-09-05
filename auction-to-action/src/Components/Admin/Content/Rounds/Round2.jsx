import { useState } from "react";
import { 
  Button, 
  Input, 
  useToast, 
  Box, 
  Text, 
  VStack, 
  HStack, 
  Grid, 
  GridItem,
  Flex
} from "@chakra-ui/react";

const TOTAL_BOXES = 8;

const possibleCards = [
  { name: "Unicorn", rarity: 'legendary', image: "🦄" },
  { name: "Dragon", rarity: 'legendary', image: "🐉" },
  { name: "Phoenix", rarity: 'epic', image: "🔥" },
  { name: "Griffin", rarity: 'epic', image: "🦅" },
  { name: "Wolf", rarity: 'rare', image: "🐺" },
  { name: "Tiger", rarity: 'rare', image: "🐅" },
  { name: "Bear", rarity: 'rare', image: "🐻" },
  { name: "Fox", rarity: 'common', image: "🦊" },
  { name: "Rabbit", rarity: 'common', image: "🐰" },
  { name: "Cat", rarity: 'common', image: "🐱" },
];

const rarityColors = {
  common: 'bg-muted',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-gold'
};

const rarityBorders = {
  common: 'border-muted-foreground',
  rare: 'border-blue-400',
  epic: 'border-purple-400',
  legendary: 'border-gold'
};

const Card = ({ card }) => {
  const getRarityColor = (rarity) => {
    const colors = {
      common: '#9CA3AF',
      rare: '#3B82F6', 
      epic: '#8B5CF6',
      legendary: '#F59E0B'
    };
    return colors[rarity] || colors.common;
  };

  return (
    <Box
      w="100%"
      h="100%"
      borderRadius="lg"
      border="2px solid"
      borderColor={getRarityColor(card.rarity)}
      bg={getRarityColor(card.rarity)}
      boxShadow="xl"
      overflow="hidden"
      position="relative"
    >
      <Box
        h="75%"
        bg="rgba(255,255,255,0.9)"
        m={1}
        borderRadius="md"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text fontSize="2xl">{card.image}</Text>
      </Box>
      <Box
        h="25%"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        p={2}
      >
        <Text fontWeight="bold" color="white" fontSize="sm">{card.name}</Text>
        <Text fontSize="xs" color="rgba(255,255,255,0.8)" textTransform="capitalize">{card.rarity}</Text>
      </Box>
    </Box>
  );
};

const MysteryBox = ({ id, isRevealed, onReveal, onUnreveal, card }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      if (isRevealed) {
        onUnreveal(id);
      } else {
        onReveal(id);
      }
      setIsAnimating(false);
    }, 300);
  };

  return (
    <Box
      position="relative"
      w="160px"
      h="192px"
      cursor="pointer"
      transition="transform 0.2s"
      _hover={{ transform: 'scale(1.05)' }}
      onClick={handleClick}
    >
      {!isRevealed ? (
        <Box
          w="100%"
          h="100%"
          bg="#1E293B"
          border="2px solid"
          borderColor="#334155"
          borderRadius="lg"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          boxShadow="lg"
        >
          <Box
            w="80px"
            h="64px"
            mb={2}
            bg="rgba(51, 65, 85, 0.5)"
            borderRadius="md"
            border="1px solid"
            borderColor="rgba(51, 65, 85, 0.8)"
          />
          <Text
            color="#CBD5E1"
            fontWeight="semibold"
            textAlign="center"
            px={2}
          >
            Mystery Box {id}
          </Text>
        </Box>
      ) : (
        <Box w="100%" h="100%">
          <Card card={card} />
        </Box>
      )}
    </Box>
  );
};

export const Round2 = () => {
  const [boxNumber, setBoxNumber] = useState("");
  const [revealedBoxes, setRevealedBoxes] = useState(new Set());
  const [boxCards, setBoxCards] = useState(new Map());
  const toast = useToast();

  const generateRandomCard = () => {
    const weights = { legendary: 5, epic: 15, rare: 30, common: 50 };
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    const random = Math.random() * totalWeight;
    
    let currentWeight = 0;
    let selectedRarity = 'common';
    
    for (const [rarity, weight] of Object.entries(weights)) {
      currentWeight += weight;
      if (random <= currentWeight) {
        selectedRarity = rarity;
        break;
      }
    }
    
    const cardsOfRarity = possibleCards.filter(card => card.rarity === selectedRarity);
    return cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)];
  };

  const revealBox = (id) => {
    if (!revealedBoxes.has(id)) {
      const card = generateRandomCard();
      setBoxCards(prev => new Map(prev).set(id, card));
      setRevealedBoxes(prev => new Set(prev).add(id));
      
      toast({
        title: `Box ${id} Revealed!`,
        description: `You found a ${card.rarity} ${card.name}! ${card.image}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const unrevealBox = (id) => {
    if (revealedBoxes.has(id)) {
      setRevealedBoxes(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      
      toast({
        title: `Box ${id} Hidden`,
        description: "The box is now hidden again",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const revealBoxByNumber = () => {
    const num = parseInt(boxNumber);
    if (num >= 1 && num <= TOTAL_BOXES) {
      if (revealedBoxes.has(num)) {
        unrevealBox(num);
      } else {
        revealBox(num);
      }
      setBoxNumber("");
    } else {
      toast({
        title: "Invalid Box Number",
        description: `Please enter a number between 1 and ${TOTAL_BOXES}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const resetGame = () => {
    setRevealedBoxes(new Set());
    setBoxCards(new Map());
    setBoxNumber("");
    toast({
      title: "Game Reset",
      description: "All mystery boxes have been sealed again!",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box minH="100vh" bg="#0F172A" color="white" p={8}>
      <Box maxW="6xl" mx="auto">
        {/* Header */}
        <VStack spacing={12} mb={12}>
          <HStack spacing={4} mb={6}>
            <Text fontSize="6xl">🔨</Text>
            <Text fontSize="6xl" fontWeight="bold" color="#E2E8F0">MYSTERY BOXES</Text>
          </HStack>
          
          {/* Controls */}
          <VStack spacing={4} maxW="md" mx="auto">
            <HStack spacing={2} w="100%">
              <Input
                type="number"
                min="1"
                max={TOTAL_BOXES}
                placeholder="Enter Box Number"
                value={boxNumber}
                onChange={(e) => setBoxNumber(e.target.value)}
                fontSize="lg"
                h={12}
                bg="#1E293B"
                color="white"
                borderColor="#334155"
                _placeholder={{ color: "#94A3B8" }}
              />
            </HStack>
            
            <HStack spacing={2}>
              <Button
                onClick={revealBoxByNumber}
                isDisabled={!boxNumber}
                colorScheme="blue"
                fontSize="lg"
                px={8}
                py={6}
                h="auto"
                bg="#3B82F6"
                _hover={{ bg: "#2563EB" }}
              >
                {boxNumber && revealedBoxes.has(parseInt(boxNumber)) ? "Hide Box" : "Reveal Box"}
              </Button>
              
              <Button
                onClick={resetGame}
                variant="outline"
                fontSize="lg"
                px={6}
                py={6}
                h="auto"
                borderColor="#334155"
                color="#CBD5E1"
                _hover={{ bg: "#1E293B" }}
              >
                Reset Game
              </Button>
            </HStack>
          </VStack>
        </VStack>

        {/* Mystery Boxes Grid */}
        <Grid templateColumns="repeat(4, 1fr)" gap={6} justifyItems="center">
          {Array.from({ length: TOTAL_BOXES }, (_, i) => (
            <GridItem key={i + 1}>
              <MysteryBox
                id={i + 1}
                isRevealed={revealedBoxes.has(i + 1)}
                onReveal={revealBox}
                onUnreveal={unrevealBox}
                card={boxCards.get(i + 1)}
              />
            </GridItem>
          ))}
        </Grid>

        {/* Stats */}
        <Box textAlign="center" mt={12}>
          <Text fontSize="xl" color="#94A3B8">
            Boxes Revealed: {revealedBoxes.size} / {TOTAL_BOXES}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default Round2;