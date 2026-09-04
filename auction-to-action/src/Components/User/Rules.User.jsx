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
            bg="rgba(13, 17, 23, 0.95)"
            backdropFilter="blur(15px)"
            borderRadius="0"
            border="1px solid rgba(255, 255, 255, 0.1)"
            boxShadow="0 20px 40px rgba(0,0,0,0.5)"
            maxW="800px"
            w="95vw"
            maxH="90vh"
            display="flex"
            flexDirection="column"
            onClick={(e) => e.stopPropagation()}
            color="gray.300"
          >
            {/* Inner container for scrolling content */}
            <Box
              p={6}
              flex="1" // Allows the box to grow and fill the parent
              overflowY="auto" // Enables scrolling on this inner box
            >
              {/* Header */}
              <Heading size="lg" mb={4} color="#e8ff00" fontWeight="300" letterSpacing="wider" textTransform="uppercase">
                {isFirstTime ? "Welcome! Please read the rules" : "Game Rules"}
              </Heading>

              {/* Content of your closable box */}
              <VStack spacing={6} align="stretch">
                <Text mb={2} color="gray.400" fontSize="md">
                  {isFirstTime
                    ? "Welcome to the Auction to Action game! This document contains the complete set of rules and explanations for the A2A event. Please read carefully before the event begins so your team can plan effectively and avoid penalties."
                    : "Here are the rules and explanations for the Auction to Action (A2A) event. Please read them carefully to ensure your team can strategize effectively and avoid any penalties."}
                </Text>

                {/* General Rules */}
                <Box
                  p={4}
                  bg="rgba(255, 255, 255, 0.02)"
                  borderRadius="0"
                  borderLeft="4px solid"
                  borderColor="#e8ff00"
                >
                  <Heading size="md" mb={3} color="white" fontWeight="400" letterSpacing="wide">
                    General Rules
                  </Heading>

                  <VStack spacing={3} align="stretch">
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="#e8ff00">
                        1. Team Leadership
                      </Text>
                      <Text fontSize="sm" color="gray.300">
                        Only the team leader can participate in all bids and
                        trading. This ensures smooth communication and avoids
                        confusion.
                      </Text>
                    </Box>

                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="#e8ff00">
                        2. Enterprise Construction
                      </Text>
                      <Text fontSize="sm" color="gray.300">
                        Once constructed, enterprises cannot be deconstructed.
                        All decisions are final.
                      </Text>
                    </Box>

                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="#e8ff00">
                        3. Product Creation
                      </Text>
                      <Text fontSize="sm" color="gray.300">
                        Teams without required resources can create products
                        from owned enterprises (if eligible).
                      </Text>
                    </Box>

                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="#e8ff00">
                        4. Enterprise Products
                      </Text>
                      <Text fontSize="sm" color="gray.300">
                        Only 5 enterprises have the option of making products.
                        Check prerequisites before bidding.
                      </Text>
                    </Box>

                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="#e8ff00">
                        5. Final Goal
                      </Text>
                      <Text fontSize="sm" color="gray.300">
                        Build enterprises through bidding, trading, and product
                        creation.
                      </Text>
                    </Box>

                    <Box p={2} bg="rgba(232, 255, 0, 0.1)" borderRadius="0" border="1px solid rgba(232, 255, 0, 0.3)">
                      <Text fontWeight="bold" fontSize="sm" color="#e8ff00">
                        Final Evaluation = Enterprise Value + Cash in Wallet
                      </Text>
                    </Box>
                  </VStack>
                </Box>

                {/* Round 1 */}
                <Box
                  p={4}
                  bg="rgba(255, 255, 255, 0.02)"
                  borderRadius="0"
                  borderLeft="4px solid"
                  borderColor="#b8d000"
                >
                  <Heading size="md" mb={3} color="white" fontWeight="400" letterSpacing="wide">
                    Round 1 - Bidding
                  </Heading>
                  <UnorderedList spacing={2} fontSize="sm" color="gray.300">
                    <ListItem>
                      <strong style={{color:"white"}}>Minimum Base Price:</strong> ₹5,000
                    </ListItem>
                    <ListItem>
                      <strong style={{color:"white"}}>Maximum Base Price:</strong> ₹9,500
                    </ListItem>
                    <ListItem>
                      <strong style={{color:"white"}}>No ceiling</strong> on total bidding amount
                    </ListItem>
                    <ListItem>
                      <strong style={{color:"white"}}>Wallet Rule:</strong> Bids exceeding wallet
                      balance are null and void
                    </ListItem>
                    <ListItem>
                      <strong style={{color:"white"}}>Penalty:</strong> 3+ wallet violations = banned
                      for next 20 bids
                    </ListItem>
                    <ListItem>
                      <strong style={{color:"white"}}>Mandatory:</strong> Every team must win at least 1
                      bid or face 15% wallet deduction for upcoming rounds
                    </ListItem>
                  </UnorderedList>
                </Box>

                {/* Round 2 */}
                <Box
                  p={4}
                  bg="rgba(255, 255, 255, 0.02)"
                  borderRadius="0"
                  borderLeft="4px solid"
                  borderColor="#8a2be2"
                >
                  <Heading size="md" mb={3} color="white" fontWeight="400" letterSpacing="wide">
                    Round 2 - Mystery Box
                  </Heading>
                  <UnorderedList spacing={2} fontSize="sm" color="gray.300">
                    <ListItem>
                      <strong style={{color:"white"}}>Base Price:</strong> ₹2,500
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
                  bg="rgba(255, 255, 255, 0.02)"
                  borderRadius="0"
                  borderLeft="4px solid"
                  borderColor="#ff8c00"
                >
                  <Heading size="md" mb={3} color="white" fontWeight="400" letterSpacing="wide">
                    Round 3 - Trading & Construction
                  </Heading>
                  <UnorderedList spacing={2} fontSize="sm" color="gray.300">
                    <ListItem>
                      Trade enterprises and products with other teams
                    </ListItem>
                    <ListItem>
                      <strong style={{color:"white"}}>Trading slips required:</strong> Official proof of
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
                  bg="rgba(255, 0, 0, 0.05)"
                  borderRadius="0"
                  borderLeft="4px solid"
                  borderColor="red.500"
                >
                  <Heading size="md" mb={3} color="white" fontWeight="400" letterSpacing="wide">
                    Key Strategy Points
                  </Heading>
                  <UnorderedList spacing={2} fontSize="sm" color="gray.300">
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
                    colorScheme="yellow"
                    sx={{
                      ".chakra-checkbox__control": {
                        borderColor: "#e8ff00",
                        _checked: {
                          bg: "#e8ff00",
                          borderColor: "#e8ff00",
                          color: "#080b0f"
                        }
                      }
                    }}
                  >
                    <Text color="gray.300">I have read and agree to the rules</Text>
                  </Checkbox>
                )}
                <Flex mt={5}>
                  {!isFirstTime && (
                    <>
                      <Spacer />
                      <Button 
                        onClick={handleClose} 
                        leftIcon={<IoMdClose />}
                        bg="transparent"
                        color="white"
                        border="1px solid rgba(255,255,255,0.2)"
                        borderRadius="0"
                        _hover={{ bg: "rgba(255,255,255,0.05)" }}
                        textTransform="uppercase"
                        letterSpacing="wider"
                        fontWeight="400"
                      >
                        Close
                      </Button>
                    </>
                  )}
                  {isFirstTime && (
                    <>
                      <Spacer />
                      <Button
                        onClick={handleAgree}
                        isDisabled={!hasAgreed}
                        bg="transparent"
                        color="#e8ff00"
                        border="1px solid #e8ff00"
                        borderRadius="0"
                        _hover={{ bg: "rgba(232,255,0,0.1)" }}
                        textTransform="uppercase"
                        letterSpacing="wider"
                        fontWeight="600"
                        _disabled={{
                          opacity: 0.5,
                          cursor: "not-allowed",
                        }}
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
