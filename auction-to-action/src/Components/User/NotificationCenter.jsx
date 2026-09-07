import React from "react";
import {
  Box,
  Flex,
  Text,
  Badge,
  IconButton,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Portal,
  VStack,
  HStack,
  Button,
  Divider,
} from "@chakra-ui/react";
import { IoNotificationsOutline } from "react-icons/io5";

// Helper for relative timestamps
function formatTimeAgo(timestamp) {
  if (!timestamp) return "Just now";
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = Math.max(0, now - past);
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);

  if (diffSec < 45) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return past.toLocaleDateString();
}

const NotificationCenter = ({
  notifications = [],
  unreadCount = 0,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  return (
    <Popover placement="bottom-end" isLazy>
      {({ isOpen, onClose }) => (
        <>
          <PopoverTrigger>
            <Box position="relative" display="inline-block">
              <Tooltip
                label="Notifications"
                placement="bottom"
                bg="gray.800"
                color="white"
              >
                <IconButton
                  icon={<IoNotificationsOutline />}
                  bg="transparent"
                  color="white"
                  _hover={{
                    bg: "rgba(255, 255, 255, 0.1)",
                    color: "#F62440",
                    shadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                  _active={{ bg: "rgba(255, 255, 255, 0.05)" }}
                  size="lg"
                  aria-label="Notifications"
                  variant="ghost"
                  fontSize="24px"
                />
              </Tooltip>
              {unreadCount > 0 && (
                <Badge
                  position="absolute"
                  top="-1px"
                  right="-1px"
                  colorScheme="red"
                  variant="solid"
                  borderRadius="full"
                  fontSize="0.7rem"
                  px={1.5}
                  py={0.5}
                  boxShadow="0 0 8px rgba(246, 36, 64, 0.8)"
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
            </Box>
          </PopoverTrigger>

          <Portal>
            <PopoverContent
              bg="rgba(15, 59, 61, 0.96)"
              backdropFilter="blur(20px)"
              border="1px solid rgba(255, 255, 255, 0.25)"
              borderRadius="xl"
              boxShadow="0 12px 36px rgba(0, 0, 0, 0.5)"
              color="white"
              w={{ base: "320px", sm: "380px" }}
              maxW="95vw"
              zIndex={99999}
              _focus={{ outline: "none" }}
            >
              <PopoverArrow bg="rgba(15, 59, 61, 0.96)" />
              <PopoverCloseButton color="gray.300" size="sm" mt={1} />

              <PopoverHeader
                borderBottom="1px solid rgba(255, 255, 255, 0.15)"
                py={3}
                px={4}
              >
                <Flex justify="space-between" align="center" pr={6}>
                  <HStack spacing={2}>
                    <Text fontWeight="bold" fontSize="md">
                      Notifications
                    </Text>
                    {unreadCount > 0 && (
                      <Badge colorScheme="red" borderRadius="full" px={2}>
                        {unreadCount} new
                      </Badge>
                    )}
                  </HStack>

                  {unreadCount > 0 && (
                    <Button
                      size="xs"
                      variant="ghost"
                      color="teal.200"
                      _hover={{ color: "white", bg: "rgba(255, 255, 255, 0.1)" }}
                      onClick={onMarkAllAsRead}
                    >
                      Mark all read
                    </Button>
                  )}
                </Flex>
              </PopoverHeader>

              <PopoverBody
                p={2}
                maxH="420px"
                overflowY="auto"
                css={{
                  "&::-webkit-scrollbar": { width: "6px" },
                  "&::-webkit-scrollbar-track": { background: "rgba(0, 0, 0, 0.2)" },
                  "&::-webkit-scrollbar-thumb": {
                    background: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "4px",
                  },
                }}
              >
                {notifications.length === 0 ? (
                  <Box py={8} textAlign="center" color="gray.400">
                    <Text fontSize="sm">No notifications yet</Text>
                  </Box>
                ) : (
                  <VStack spacing={2} align="stretch">
                    {notifications.map((notif) => {
                      const isUnread = !notif.read;
                      return (
                        <Box
                          key={notif._id || notif.createdAt}
                          p={3}
                          borderRadius="lg"
                          bg={isUnread ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.02)"}
                          borderLeft="3px solid"
                          borderLeftColor={isUnread ? "#E8FF00" : "rgba(255, 255, 255, 0.2)"}
                          border="1px solid"
                          borderColor={isUnread ? "rgba(232, 255, 0, 0.2)" : "rgba(255, 255, 255, 0.08)"}
                          transition="all 0.2s"
                          _hover={{
                            bg: "rgba(255, 255, 255, 0.12)",
                            cursor: isUnread ? "pointer" : "default",
                          }}
                          onClick={() => {
                            if (isUnread && onMarkAsRead) {
                              onMarkAsRead(notif._id);
                            }
                          }}
                        >
                          <Flex justify="space-between" align="center" mb={1}>
                            <Text
                              fontSize="sm"
                              fontWeight="bold"
                              color={isUnread ? "white" : "gray.300"}
                            >
                              {notif.title || "Notification"}
                            </Text>
                            <Text fontSize="xs" color="gray.400">
                              {formatTimeAgo(notif.createdAt)}
                            </Text>
                          </Flex>

                          <Text
                            fontSize="xs"
                            color={isUnread ? "gray.200" : "gray.400"}
                            whiteSpace="pre-line"
                            lineHeight="tall"
                          >
                            {notif.message}
                          </Text>

                          {isUnread && (
                            <Flex justify="flex-end" mt={1}>
                              <Text fontSize="10px" color="#E8FF00" fontStyle="italic">
                                Click to mark read
                              </Text>
                            </Flex>
                          )}
                        </Box>
                      );
                    })}
                  </VStack>
                )}
              </PopoverBody>
            </PopoverContent>
          </Portal>
        </>
      )}
    </Popover>
  );
};

export default NotificationCenter;
