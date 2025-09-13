import { useState } from "react";
import { 
  Button, 
  Input, 
  useToast, 
  Box, 
  Text, 
  VStack, 
  HStack, 
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Tag,
  Select,
  Divider,
} from "@chakra-ui/react";

// total boxes
const TOTAL_BOXES = 25;

// contents
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
  { id: 21, content: "Say phrase 5 times to get 2× bid amount", type: "challenge" },
  { id: 22, content: "Say phrase 5 times to get 5 Property, 3 Skilled Labour", type: "challenge" },
  { id: 23, content: "Say phrase 5 times to get 4 Machinery & Tools, 4 Technology", type: "challenge" },
  { id: 24, content: "Say phrase 5 times to get 1.5× bid amount", type: "challenge" },
  { id: 25, content: "Say phrase 5 times to get 5 Electricity Supply, 3 Machinery & Tools", type: "challenge" },
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

export const Round2 = () => {
  const [selectedBoxNumber, setSelectedBoxNumber] = useState("1");
  const [revealedBoxes, setRevealedBoxes] = useState(new Set());
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedBox, setSelectedBox] = useState(null);

  const [teamCode, setTeamCode] = useState("");
  const [teamName, setTeamName] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [revealedHistory, setRevealedHistory] = useState([]);

  const handleModalSubmit = () => {
    const newEntry = {
      boxId: selectedBox.id,
      teamCode,
      teamName,
      bidAmount,
      content: selectedBox.content,
      type: selectedBox.type,
    };
    setRevealedHistory(prev => [...prev, newEntry]);
    setTeamCode("");
    setTeamName("");
    setBidAmount("");
    onClose();
  };

  const revealBox = () => {
    const num = parseInt(selectedBoxNumber);
    if (num >= 1 && num <= TOTAL_BOXES) {
      if (revealedBoxes.has(num)) {
        toast({
          title: "Box already revealed",
          description: `Mystery Box ${num} has already been revealed.`,
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      const content = boxContents.find(box => box.id === num);
      setSelectedBox(content);
      onOpen();
      toast({
        title: `Box ${num} Revealed!`,
        description: content.content,
        status: "success",
        duration: 4000,
        isClosable: true,
      });
      setRevealedBoxes(prev => new Set(prev).add(num));
    } else {
      toast({
        title: "Invalid Box Number",
        description: `Please select between 1 and ${TOTAL_BOXES}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const undoLastAction = () => {
    if (revealedHistory.length === 0) {
      toast({
        title: "Nothing to undo",
        description: "No boxes have been revealed yet.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const lastRevealed = revealedHistory[revealedHistory.length - 1];
    
    // Remove the last entry from the history array
    const newHistory = revealedHistory.slice(0, -1);
    setRevealedHistory(newHistory);

    // Remove the box from the set of revealed boxes
    const newRevealedBoxes = new Set(revealedBoxes);
    newRevealedBoxes.delete(lastRevealed.boxId);
    setRevealedBoxes(newRevealedBoxes);

    toast({
      title: "Undo Successful",
      description: `Action for Box ${lastRevealed.boxId} has been undone.`,
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const resetGame = () => {
    setRevealedBoxes(new Set());
    setRevealedHistory([]);
    setSelectedBoxNumber("1");
    toast({
      title: "Game Reset",
      description: "All boxes sealed again!",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

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
              {[...Array(TOTAL_BOXES)].map((_, i) => (
                <option key={i + 1} value={i + 1} style={{ background: colors.dark, color: 'white' }}>
                  Box {i + 1}
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
              isDisabled={revealedHistory.length === 0}
              variant="outline"
              borderColor={colors.primary[150]}
              color={colors.primary[50]}
              _hover={{ bg: colors.primary[200], transform: "scale(1.05)" }}
              size="sm"
            >
              Undo
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
          <Text fontSize="xl" color={colors.primary[50]}>Boxes Revealed: {revealedBoxes.size} / {TOTAL_BOXES}</Text>
        </Box>

        {revealedHistory.length > 0 && (
          <Box mt={12} p={6} bg={colors.primary[200]} borderRadius="2xl" shadow="xl">
            <Text fontSize="2xl" fontWeight="bold" mb={4}>Revealed History</Text>
            <Divider mb={4} borderColor={colors.primary[100]} />
            <VStack spacing={4} align="stretch">
              {revealedHistory.map((entry, index) => (
                <HStack key={index} p={4} bg={colors.dark} borderRadius="lg" shadow="md" justify="space-between">
                  <VStack align="flex-start" spacing={1}>
                    <HStack>
                      <Text fontWeight="bold" color={colors.primary[50]}>{contentIcons[entry.type]} Box {entry.boxId}:</Text>
                      <Text>{entry.content}</Text>
                    </HStack>
                    <Text fontSize="sm" color="whiteAlpha.700">
                      Team: <Text as="span" fontWeight="bold">{entry.teamName}</Text> (Code: <Tag size="sm" colorScheme="blue">{entry.teamCode}</Tag>)
                    </Text>
                  </VStack>
                  <Text fontWeight="bold" fontSize="lg" color="green.300">Bid: ${entry.bidAmount}</Text>
                </HStack>
              ))}
            </VStack>
          </Box>
        )}
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent bg={colors.primary[200]} color="white" borderRadius="2xl" shadow="2xl">
          <ModalHeader fontWeight="bold" fontSize="xl">Bid Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={5}>
              <FormControl>
                <FormLabel>Mystery Box Number</FormLabel>
                <Input value={selectedBox?.id || ''} isReadOnly bg={colors.dark} borderColor={colors.primary[150]} />
              </FormControl>
              <FormControl>
                <FormLabel>Team Code</FormLabel>
                <Input value={teamCode} onChange={(e) => setTeamCode(e.target.value)} placeholder="Enter team code" bg={colors.dark} borderColor={colors.primary[150]} />
              </FormControl>
              <FormControl>
                <FormLabel>Team Name</FormLabel>
                <Input value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Enter team name" bg={colors.dark} borderColor={colors.primary[150]} />
              </FormControl>
              <FormControl>
                <FormLabel>Bid Amount</FormLabel>
                <Input type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} placeholder="Enter bid amount" bg={colors.dark} borderColor={colors.primary[150]} />
              </FormControl>
              <VStack align="flex-start" p={4} bg={colors.dark} borderRadius="md" w="100%">
                <Text fontWeight="bold" color={colors.primary[50]}>Mystery Box Content</Text>
                <Text fontSize="md" fontStyle="italic">{selectedBox?.content}</Text>
              </VStack>
              <Button onClick={handleModalSubmit} bgGradient={`linear(to-r, ${colors.primary[100]}, ${colors.primary[150]})`} _hover={{ bgGradient: `linear(to-r, ${colors.primary[50]}, ${colors.primary[100]})`, transform: "scale(1.05)" }} w="100%" mt={4} borderRadius="lg" shadow="md">Save</Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Round2;