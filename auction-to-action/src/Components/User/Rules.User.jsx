import {
  Box,
  AbsoluteCenter,
  Button,
  Flex,
  Spacer,
  FormControl,
  Checkbox,
  Text,
  Heading,
  VStack,
  UnorderedList,
  ListItem,
  Divider,
  Badge,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";

function RulesUser({ onClose, isFirstTime }) {
  const [hasAgreed, setHasAgreed] = useState(false);

  const handleClose = () => {
    if (isFirstTime && !hasAgreed) {
      // For first time users, they must agree to the rules
      return;
    }
    onClose();
  };

  const handleAgree = () => {
    setHasAgreed(true);
    onClose();
  };

  return (
    <Box>
      {/* The overlay now handles clicks to close the modal */}
      <Box
        position="fixed"
        top="0"
        left="0"
        h="100vh"
        w="100vw"
        bg="rgba(0,0,0,0.5)"
        zIndex="999"
        onClick={handleClose}
      >
        <AbsoluteCenter axis="both">
          {/* Outer container for styling (background, border-radius) */}
          <Box
            bg="white"
            borderRadius="md" // This will now remain rounded
            boxShadow="lg"
            maxW="800px"
            w="95vw"
            maxH="90vh"
            display="flex" // Use flexbox to control child height
            flexDirection="column"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Inner container for scrolling content */}
            <Box
              p={6}
              flex="1" // Allows the box to grow and fill the parent
              overflowY="auto" // Enables scrolling on this inner box
            >
              {/* Header */}
              <Heading size="lg" mb={4} color="blue.600">
                {isFirstTime ? "Welcome! Please read the rules" : "Game Rules"}
              </Heading>

              {/* Content of your closable box */}
              <VStack spacing={6} align="stretch">
                <Text mb={2}>
                  {isFirstTime
                    ? "Welcome to the Auction to Action game! This document contains the complete set of rules and explanations for the A2A event. Please read carefully before the event begins so your team can plan effectively and avoid penalties."
                    : "Here are the rules and explanations for the Auction to Action (A2A) event. Please read them carefully to ensure your team can strategize effectively and avoid any penalties."}
                </Text>

                {/* General Rules */}
                <Box
                  p={4}
                  bg="blue.50"
                  borderRadius="md"
                  borderLeft="4px solid"
                  borderColor="blue.400"
                >
                  <Heading size="md" mb={3} color="blue.700">
                    General Rules
                  </Heading>

                  <VStack spacing={3} align="stretch">
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="blue.600">
                        1. Team Leadership
                      </Text>
                      <Text fontSize="sm">
                        Only the team leader can participate in all bids and
                        trading. This ensures smooth communication and avoids
                        confusion.
                      </Text>
                    </Box>

                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="blue.600">
                        2. Enterprise Construction
                      </Text>
                      <Text fontSize="sm">
                        Once constructed, enterprises cannot be deconstructed.
                        All decisions are final.
                      </Text>
                    </Box>

                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="blue.600">
                        3. Product Creation
                      </Text>
                      <Text fontSize="sm">
                        Teams without required resources can create products
                        from owned enterprises (if eligible).
                      </Text>
                    </Box>

                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="blue.600">
                        4. Enterprise Products
                      </Text>
                      <Text fontSize="sm">
                        Only 5 enterprises have the option of making products.
                        Check prerequisites before bidding.
                      </Text>
                    </Box>

                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="blue.600">
                        5. Final Goal
                      </Text>
                      <Text fontSize="sm">
                        Build enterprises through bidding, trading, and product
                        creation.
                      </Text>
                    </Box>

                    <Box p={2} bg="green.100" borderRadius="md">
                      <Text fontWeight="bold" fontSize="sm" color="green.700">
                        Final Evaluation = Enterprise Value + Cash in Wallet
                      </Text>
                    </Box>
                  </VStack>
                </Box>

                {/* Round 1 */}
                <Box
                  p={4}
                  bg="green.50"
                  borderRadius="md"
                  borderLeft="4px solid"
                  borderColor="green.400"
                >
                  <Heading size="md" mb={3} color="green.700">
                    Round 1 - Bidding
                  </Heading>
                  <UnorderedList spacing={2} fontSize="sm">
                    <ListItem>
                      <strong>Minimum Base Price:</strong> ₹5,000
                    </ListItem>
                    <ListItem>
                      <strong>Maximum Base Price:</strong> ₹9,500
                    </ListItem>
                    <ListItem>
                      <strong>No ceiling</strong> on total bidding amount
                    </ListItem>
                    <ListItem>
                      <strong>Wallet Rule:</strong> Bids exceeding wallet
                      balance are null and void
                    </ListItem>
                    <ListItem>
                      <strong>Penalty:</strong> 3+ wallet violations = banned
                      for next 20 bids
                    </ListItem>
                    <ListItem>
                      <strong>Mandatory:</strong> Every team must win at least 1
                      bid or face 15% wallet deduction for upcoming rounds
                    </ListItem>
                  </UnorderedList>
                </Box>

                {/* Round 2 */}
                <Box
                  p={4}
                  bg="purple.50"
                  borderRadius="md"
                  borderLeft="4px solid"
                  borderColor="purple.400"
                >
                  <Heading size="md" mb={3} color="purple.700">
                    Round 2 - Mystery Box
                  </Heading>
                  <UnorderedList spacing={2} fontSize="sm">
                    <ListItem>
                      <strong>Base Price:</strong> ₹2,500
                    </ListItem>
                    <ListItem>
                      Contains surprise resources, extra cash, or hidden
                      advantages
                    </ListItem>
                    <ListItem>
                      Strategic bidding can provide unexpected benefits
                    </ListItem>
                  </UnorderedList>
                </Box>

                {/* Round 3 */}
                <Box
                  p={4}
                  bg="orange.50"
                  borderRadius="md"
                  borderLeft="4px solid"
                  borderColor="orange.400"
                >
                  <Heading size="md" mb={3} color="orange.700">
                    Round 3 - Trading & Construction
                  </Heading>
                  <UnorderedList spacing={2} fontSize="sm">
                    <ListItem>
                      Trade enterprises and products with other teams
                    </ListItem>
                    <ListItem>
                      <strong>Trading slips required:</strong> Official proof of
                      all trades
                    </ListItem>
                    <ListItem>Both parties must sign trading slips</ListItem>
                    <ListItem>No signed slip = null and void trade</ListItem>
                    <ListItem>
                      Build enterprises using accumulated resources
                    </ListItem>
                  </UnorderedList>
                </Box>

                {/* Key Strategy Points */}
                <Box
                  p={4}
                  bg="red.50"
                  borderRadius="md"
                  borderLeft="4px solid"
                  borderColor="red.400"
                >
                  <Heading size="md" mb={3} color="red.700">
                    Key Strategy Points
                  </Heading>
                  <UnorderedList spacing={2} fontSize="sm">
                    <ListItem>
                      Plan your bidding strategy carefully - every enterprise
                      matters
                    </ListItem>
                    <ListItem>
                      Don't waste wallet balance on invalid bids - penalties are
                      strict
                    </ListItem>
                    <ListItem>
                      Focus on product creation if direct building isn't
                      possible
                    </ListItem>
                    <ListItem>
                      Mystery Box can change the game - use it wisely
                    </ListItem>
                    <ListItem>
                      Always keep trade slips safe as legal proof
                    </ListItem>
                    <ListItem>
                      Remember: Final score = Enterprise Value + Cash in Wallet
                    </ListItem>
                  </UnorderedList>
                </Box>
              </VStack>

              <FormControl>
                {isFirstTime && (
                  <Checkbox
                    mt={4}
                    isChecked={hasAgreed}
                    onChange={(e) => setHasAgreed(e.target.checked)}
                    colorScheme="blue"
                  >
                    I have read and agree to the rules
                  </Checkbox>
                )}
                <Flex mt={5}>
                  {!isFirstTime && (
                    <>
                      <Spacer />
                      <Button onClick={handleClose} leftIcon={<IoMdClose />}>
                        Close
                      </Button>
                    </>
                  )}
                  {isFirstTime && (
                    <>
                      <Spacer />
                      <Button
                        onClick={handleAgree}
                        colorScheme="blue"
                        isDisabled={!hasAgreed}
                      >
                        Continue to Dashboard
                      </Button>
                    </>
                  )}
                </Flex>
              </FormControl>
            </Box>
          </Box>
        </AbsoluteCenter>
      </Box>
    </Box>
  );
}

export default RulesUser;
