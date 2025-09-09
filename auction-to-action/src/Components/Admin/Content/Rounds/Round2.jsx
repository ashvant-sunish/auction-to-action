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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from "@chakra-ui/react";

// total boxes
const TOTAL_BOXES = 25;

// (boxContents same as before… not shortened here)
const boxContents = [
  { id: 1, content: "Gain 2× your bid amount", type: "cash" },
  { id: 2, content: "Gain 2× your bid amount", type: "cash" },
  { id: 3, content: "Gain 1.5× your bid amount", type: "cash" },
    { id: 4, content: "Gain 1.5× your bid amount", type: "cash" },
  { id: 5, content: "Nothing", type: "nothing" },
  { id: 6, content: "Nothing", type: "nothing" },
  { id: 7, content: "Nothing", type: "nothing" },
  { id: 8, content: "Nothing", type: "nothing" },
  { id: 9, content: "Nothing", type: "nothing" },
  { id: 10, content: "Nothing", type: "nothing" },
  { id: 11, content: "Nothing", type: "nothing" },
  { id: 12, content: "Nothing", type: "nothing" },
  { id: 13, content: "Nothing", type: "nothing" },
  { id: 14, content: "Gain 6 Technology, 2 Utilities", type: "resources" },
  { id: 15, content: "Gain 6 Transportation, 2 Office Space", type: "resources" },
  { id: 16, content: "Gain 3 Property, 3 Machinery & Tools, 2 Electricity Supply", type: "resources" },
  { id: 17, content: "Gain 5 Skilled Labour, 1 Technology, 2 Construction Material", type: "resources" },
  { id: 18, content: "Gain 3 Technology, 3 Machinery & Tools, 2 Utilities", type: "resources" },
  { id: 19, content: "Gain 6 Utilities, 2 Property", type: "resources" },
  { id: 20, content: "Gain 4 Electricity Supply, 3 Technology, 1 Skilled Labour", type: "resources" },
  { id: 21, content: "\"Big bids boost booming businesses.\" Say this 5 times without error and get 2× bid amount", type: "challenge" },
  { id: 22, content: "\"Clever creators craft catchy campaigns.\" Say this 5 times without error and get 5 Property, 3 Skilled Labour", type: "challenge" },
  { id: 23, content: "\"Smart startups seek smart supporters.\" Say this 5 times without error and get 4 Machinery & Tools, 4 Technology", type: "challenge" },
  { id: 24, content: "\"Great goals grow grand gains.\" Say this 5 times without error and get 1.5× bid amount", type: "challenge" },
  { id: 25, content: "\"Winning workers work with wise workflows.\" Say this 5 times without error and get 5 Electricity Supply, 3 Machinery & Tools", type: "challenge" }
];

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

// Card layout
const Card = ({ content }) => {
  const getContentColor = (type) => {
    const colors = {
      cash: '#F59E0B',
      nothing: '#9CA3AF',
      resources: '#3B82F6',
      challenge: '#8B5CF6'
    };
    return colors[type] || colors.nothing;
  };

  return (
    <Box
      w="100%"
      h="100%"
      borderRadius="lg"
      border="2px solid"
      borderColor={getContentColor(content.type)}
      bg={getContentColor(content.type)}
      boxShadow="xl"
      overflow="hidden"
    >
      <VStack h="100%" spacing={1} p={2} justify="center">
        <Text fontSize="lg" textAlign="center" fontWeight="bold" color="white">
          {contentIcons[content.type]} {content.content}
        </Text>
        <Text fontWeight="bold" color="white" fontSize="sm">Box {content.id}</Text>
        <Text fontSize="xs" color="rgba(255,255,255,0.8)" textTransform="capitalize">{content.type}</Text>
      </VStack>
    </Box>
  );
};

// Mystery Box component
const MysteryBox = ({ id, isRevealed, onToggle, content }) => {
  return (
    <Box
      w="160px"
      h="192px"
      cursor="pointer"
      transition="transform 0.2s"
      _hover={{ transform: 'scale(1.05)' }}
      onClick={() => onToggle(id)}
    >
      {!isRevealed ? (
        <Box
          w="100%"
          h="100%"
          bg={colors.primary[200]}
          border="2px solid"
          borderColor={colors.primary[150]}
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
            bg="rgba(10, 112, 117, 0.5)"
            borderRadius="md"
            border="1px solid"
            borderColor="rgba(10, 112, 117, 0.8)"
          />
          <Text color={colors.white} fontWeight="semibold" textAlign="center">
            Mystery Box {id}
          </Text>
        </Box>
      ) : (
        <Card content={content} />
      )}
    </Box>
  );
};

// Main Round2
export const Round2 = () => {
  const [boxNumber, setBoxNumber] = useState("");
  const [revealedBoxes, setRevealedBoxes] = useState(new Set());
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedBox, setSelectedBox] = useState(null);

  // toggle reveal/unreveal
  const toggleBox = (id) => {
    setRevealedBoxes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id); // unreveal
      } else {
        newSet.add(id); // reveal
        const content = boxContents.find(box => box.id === id);
        toast({
          title: `Box ${id} Revealed!`,
          description: content.content,
          status: "success",
          duration: 4000,
          isClosable: true,
        });
      }
      return newSet;
    });
  };

  const revealBoxByNumber = () => {
    const num = parseInt(boxNumber);
    if (num >= 1 && num <= TOTAL_BOXES) {
      toggleBox(num);
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
    <Box minH="100vh" bg={colors.dark} color="white" p={8} overflow="auto">
      <Box maxW="6xl" mx="auto">

        {/* Header */}
        <VStack spacing={6} mb={10}>
          <HStack spacing={3} align="center">
            <Text fontSize="4xl">🎁</Text>
            <Text 
              fontSize="4xl" 
              fontWeight="extrabold" 
              letterSpacing="wide"
              color={colors.primary[50]}
            >
              Mystery Boxes
            </Text>
          </HStack>

          {/* Controls */}
          <HStack spacing={3} maxW="md" mx="auto" w="100%" justify="center">
            <Input
              type="number"
              min="1"
              max={TOTAL_BOXES}
              placeholder="Enter Mystery Box Number"
              value={boxNumber}
              onChange={(e) => setBoxNumber(e.target.value)}
              fontSize="md"
              h={12}
              bg={colors.primary[200]}
              color="white"
              borderColor={colors.primary[150]}
              _placeholder={{ color: colors.primary[50], fontStyle: "italic" }}
              _focus={{ borderColor: colors.primary[100], boxShadow: "0 0 0 2px #0C969C" }}
            />
            <Button
              onClick={revealBoxByNumber}
              isDisabled={!boxNumber}
              px={6}
              h={12}
              fontWeight="bold"
              bgGradient={`linear(to-r, ${colors.primary[100]}, ${colors.primary[150]})`}
              _hover={{ bgGradient: `linear(to-r, ${colors.primary[50]}, ${colors.primary[100]})` }}
              color="white"
              borderRadius="lg"
              shadow="md"
            >
              Reveal
            </Button>
          </HStack>

          <Button
            onClick={resetGame}
            variant="outline"
            borderColor={colors.primary[150]}
            color={colors.primary[50]}
            _hover={{ bg: colors.primary[200] }}
            size="sm"
            mt={2}
          >
            Reset Game
          </Button>
        </VStack>

        {/* Grid of Mystery Boxes */}
        <Grid templateColumns="repeat(5, 1fr)" gap={6} justifyItems="center" mb={8}>
          {boxContents.map((content) => (
            <GridItem key={content.id}>
              <MysteryBox
                id={content.id}
                isRevealed={revealedBoxes.has(content.id)}
                onToggle={toggleBox}
                content={content}
              />
            </GridItem>
          ))}
        </Grid>

        {/* Stats */}
        <Box textAlign="center" mt={8}>
          <Text fontSize="xl" color={colors.primary[50]}>
            Boxes Revealed: {revealedBoxes.size} / {TOTAL_BOXES}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default Round2;
