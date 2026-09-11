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
                bg="theme.surfaceHigh"
                color="theme.textPrimary"
              >
                <IconButton
                  icon={<IoNotificationsOutline />}
                  bg="transparent"
                  color="theme.textSecondary"
                  _hover={{
                    bg: "theme.surfaceContainer",
                    color: "theme.textPrimary",
                    shadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                    border: "1px solid var(--outline)",
                  }}
                  _active={{ bg: "theme.surfaceContainer" }}
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
                  bg="theme.primary"
                  color="theme.onPrimary"
                  variant="solid"
                  borderRadius="full"
                  fontSize="0.7rem"
                  px={1.5}
                  py={0.5}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
            </Box>
          </PopoverTrigger>

          <Portal>
            <PopoverContent
              bg="theme.surface"
              backdropFilter="blur(20px)"
              border="1px solid"
              borderColor="theme.outline"
              borderRadius="xl"
              boxShadow="0 12px 36px rgba(0, 0, 0, 0.5)"
              color="theme.textPrimary"
              w={{ base: "320px", sm: "380px" }}
              maxW="95vw"
              zIndex={99999}
              _focus={{ outline: "none" }}
            >
              <PopoverArrow bg="theme.surface" />
              <PopoverCloseButton color="theme.textSecondary" size="sm" mt={1} />

              <PopoverHeader
                borderBottom="1px solid"
                borderColor="theme.outline"
                py={3}
                px={4}
              >
                <Flex justify="space-between" align="center" pr={6}>
                  <HStack spacing={2}>
                    <Text fontWeight="bold" fontSize="md" color="theme.textPrimary">
                      Notifications
                    </Text>
                    {unreadCount > 0 && (
                      <Badge bg="theme.primaryContainer" color="theme.onPrimaryContainer" borderRadius="full" px={2}>
                        {unreadCount} new
                      </Badge>
                    )}
                  </HStack>

                  {unreadCount > 0 && (
                    <Button
                      size="xs"
                      variant="ghost"
                      color="theme.primary"
                      _hover={{ color: "theme.onPrimaryContainer", bg: "theme.primaryContainer" }}
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
                    background: "var(--outline)",
                    borderRadius: "4px",
                  },
                }}
              >
                {notifications.length === 0 ? (
                  <Box py={8} textAlign="center" color="theme.textMuted">
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
                          bg={isUnread ? "theme.surfaceContainer" : "theme.surface"}
                          borderLeft="3px solid"
                          borderLeftColor={isUnread ? "theme.primary" : "theme.outline"}
                          border="1px solid"
                          borderColor="theme.outline"
                          transition="all 0.2s"
                          _hover={{
                            bg: "theme.surfaceHigh",
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
                              color={isUnread ? "theme.textPrimary" : "theme.textSecondary"}
                            >
                              {notif.title || "Notification"}
                            </Text>
                            <Text fontSize="xs" color="theme.textMuted">
                              {formatTimeAgo(notif.createdAt)}
                            </Text>
                          </Flex>

                          <Text
                            fontSize="xs"
                            color={isUnread ? "theme.textSecondary" : "theme.textMuted"}
                            whiteSpace="pre-line"
                            lineHeight="tall"
                          >
                            {notif.message}
                          </Text>

                          {isUnread && (
                            <Flex justify="flex-end" mt={1}>
                              <Text fontSize="10px" color="theme.primary" fontStyle="italic">
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
