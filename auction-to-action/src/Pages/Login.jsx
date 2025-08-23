import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Text, Flex, VStack, Spacer, useColorModeValue, Tabs, TabList, TabPanels, Tab, TabPanel, Container, Center } from '@chakra-ui/react'
import AdminLogin from "./Admin/Admin.Login";
import UserLogin from "./User/User.Login";

const Logo = (props) => {
  return (
    <Text fontWeight="bold" fontSize="2xl" {...props} color="white">
      Center For Social Entrepreneurship and Development | VIT Vellore
    </Text>
  );
};

const ListHeader = ({ children }) => {
  return (
    <Text fontWeight={'500'} fontSize={'lg'} mb={2}>
      {children}
    </Text>
  );
};
function Login() {
  const navigate = useNavigate();


  return (
    <Box
      bg={useColorModeValue('gray.50', 'gray.900')}
      color={useColorModeValue('gray.700', 'gray.200')}>
      <Box
        px={{ base: 4, md: 12 }}
        py={6}
        bg={useColorModeValue('white', 'gray.800')}
        boxShadow="md"
        position="sticky"
        top="0"
        zIndex="100"
      >
        <Flex align="flex-start" justify="space-between">
          <VStack align="flex-start" spacing={0}>
            <Text
              fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
              fontWeight="900"
              fontFamily="tungsten, 'Tungsten', Arial, sans-serif"
              textTransform="uppercase"
              letterSpacing="widest"
              color={useColorModeValue("red.600", "red.300")}
              lineHeight="1"
              fontStyle="italic"
            >
              Auction to Action
            </Text>
            <Text
              fontSize={{ base: "xs", md: "sm", lg: "md" }}
              color={useColorModeValue("gray.600", "gray.400")}
              fontStyle="italic"
              fontWeight="medium"
              letterSpacing="wide"
              mt={1}
            >
              When Bids Become Betrayal, Action Becomes War
            </Text>
          </VStack>{}
          <Spacer />
          <Text
            fontSize={{ base: "lg", md: "2xl" }}
            fontWeight="extrabold"
            color={useColorModeValue("blue.600", "blue.300")}
            alignSelf="flex-start"
            letterSpacing="widest"
          >
            CSED | VIT Vellore
          </Text>
        </Flex>
      </Box>
      <Container minWidth={'60%'} minHeight={'0vh'} mt={5}>
        <Tabs isFitted variant="unstyled">
          <TabList
            mb="1em"
            p={2}
            bg={useColorModeValue("gray.200", "gray.700")}
            borderRadius="full"
            boxShadow="md"
            display="flex"
            justifyContent="center"
          >
            <Tab
              _selected={{
                color: "white",
                bg: "red.500",
                boxShadow: "lg",
                transform: "scale(1.08)",
              }}
              borderRadius="full"
              px={8}
              py={3}
              fontWeight="bold"
              fontSize={{ base: "md", md: "lg" }}
              transition="all 0.2s"
              mx={2}
              letterSpacing="wide"
            >
              Admin
            </Tab>
            <Tab
              _selected={{
                color: "white",
                bg: "red.500",
                boxShadow: "lg",
                transform: "scale(1.08)",
              }}
              borderRadius="full"
              px={8}
              py={3}
              fontWeight="bold"
              fontSize={{ base: "md", md: "lg" }}
              transition="all 0.2s"
              mx={2}
              letterSpacing="wide"
            >
              Participants
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Flex direction="column" justifyContent="center" alignItems="center" pt={4} pb={4}>
                <AdminLogin />
              </Flex>
            </TabPanel>
            <TabPanel>
              <Flex direction="column" justifyContent="center" alignItems="center" pt={4} pb={4}>
                <UserLogin />
              </Flex>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
      <Box py={10} mt={6} bg={'bg'}>
        <Flex
          align={'center'}
          _before={{
            content: '""',
            borderBottom: '1px solid',
            borderColor: useColorModeValue('gray.200', 'gray.700'),
            flexGrow: 1,
            mr: 8,
          }}
          _after={{
            content: '""',
            borderBottom: '1px solid',
            borderColor: useColorModeValue('gray.200', 'gray.700'),
            flexGrow: 1,
            ml: 8,
          }}>
          <Logo />
        </Flex>
        <Text pt={6} fontSize={'sm'} textAlign={'center'} color="white">
          Made with ❤️ by the CSED Technical Team
        </Text>
      </Box>
    </Box>
  );
}

export default Login;