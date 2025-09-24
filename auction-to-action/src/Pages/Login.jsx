import React, { useState, useEffect, useRef } from "react";
import { Box, Flex, Image, Text } from "@chakra-ui/react";

import vitLogo from "../assets/images/vit_logo.png";
import csedLogo from "../assets/images/csed_logo.png";
import panelTexture from "../assets/images/main_login_bg.jpg";

import LoginCard from "./LoginCard"; // Import the LoginCard component

function LoginPage() {
  const [mouse, setMouse] = useState({ x: 50, y: 50 });
  const [spot, setSpot] = useState({ x: 50, y: 50 });
  const [opacity, setOpacity] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const animate = () => {
      setSpot(prev => ({
        x: prev.x + (mouse.x - prev.x) * 0.08,
        y: prev.y + (mouse.y - prev.y) * 0.08,
      }));
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [mouse]);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMouse({ x, y });
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  const spotlight = `radial-gradient(
    circle at ${spot.x}% ${spot.y}%,
    rgba(255,255,255,${0.25 * opacity}) 0%,
    rgba(255,255,255,${0.15 * opacity}) 6%,
    rgba(255,255,255,${0.08 * opacity}) 12%,
    rgba(255,255,255,0) 20%
  )`;

  return (
    <Box minH="100vh" w="100vw" bg="black" position="relative">
      {/* Top Logos */}
      <Flex
        position="absolute"
        top={4}
        left={4}
        right={4}
        justify="space-between"
        align="center"
        zIndex={30}
      >
        <Image src={vitLogo} alt="VIT Logo" h="60px" objectFit="contain" />
        <Image src={csedLogo} alt="CSED Logo" h="60px" objectFit="contain" />
      </Flex>

      {/* Text with cursor-following spotlight */}
      <Box
        position="absolute"
        bottom={{ base: 20, md: 24, lg: 28 }}
        left={{ base: 20, md: 28, lg: 32 }}
        width={{ base: "85%", md: "60%", lg: "40%" }}
        zIndex={40}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <Text
          fontSize={{ base: "7xl", md: "10xl", lg: "10xl" }}
          fontWeight="bold"
          textTransform="uppercase"
          fontFamily="'Bebas Neue', sans-serif"
          lineHeight="1.1"
          letterSpacing="2px"
          color="#033D3D"
          //_hover={{ color: "#007B7F" }}
          sx={{
            backgroundImage: spotlight,
            backgroundRepeat: "no-repeat",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            transition: "background 0.2s ease-out",
          }}
        >
          When Bid <br />
          Becomes Betrayal, <br />
          Action Becomes War
        </Text>
      </Box>

      {/* Panels */}
      <Flex h="100vh" direction="row" align="flex-start" justify="center" gap={4}>
        <Box
          flex={1}
          h="45vh"
          bgImage={`url(${panelTexture})`}
          bgSize="cover"
          bgPosition="center"
          borderRadius="25px"
        />
        <Box
          flex={1}
          h="60vh"
          bgImage={`url(${panelTexture})`}
          bgSize="cover"
          bgPosition="center"
          borderRadius="25px"
        />
        <Box
          flex={1}
          h="80vh"
          bgImage={`url(${panelTexture})`}
          bgSize="cover"
          bgPosition="center"
          borderRadius="25px"
        />
        <Box
          flex={1}
          h="100vh"
          bgImage={`url(${panelTexture})`}
          bgSize="cover"
          bgPosition="center"
          borderRadius="25px"
        />
      </Flex>


{/* Glassmorphic Login Card */}
<Box
  position="absolute"
  left="970px"   // moved a bit more to the right
  top="100px"    // moved a bit higher
  zIndex={50}
  w="340px"
  transform="scale(0.9)"   // shrink overall size (90%)
  transformOrigin="top left" // keeps scaling aligned to your offsets
>
  <LoginCard />
</Box>

    </Box>
  );
}

export default LoginPage;