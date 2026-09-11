import React, { useState, useEffect, useRef } from "react";
import { Box, Flex, Text, Link, Image, HStack } from "@chakra-ui/react";
import LoginComponentUser from "../Components/Login/User/LoginComponent.User";
import LoginComponentAdmin from "../Components/Login/Admin/LoginComponent.Admin";
import gravitasLogo from "../assets/images/gravitasA2A.png";
import vitlogo from "../assets/images/vit_logo.png"
// Ambient floating particle field with constellation connections
const ParticleCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement.offsetWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    const colors = [
      "rgba(12, 150, 156, ",  // Teal
      "rgba(107, 163, 190, ", // Soft cyan
      "rgba(199, 152, 58, ",  // Warm gold
      "rgba(240, 244, 255, ", // Crisp white
    ];

    const particleCount = 55;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -0.2 - Math.random() * 0.45,
      radius: Math.random() * 2.2 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.65 + 0.25,
      pulseSpeed: 0.015 + Math.random() * 0.02,
      pulseVal: Math.random() * Math.PI * 2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Connecting constellation lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(12, 150, 156, ${0.16 * (1 - dist / 90)})`;
            ctx.lineWidth = 0.7;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw and drift particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulseVal += p.pulseSpeed;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulseVal));

        // Soft outer glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = p.color + currentAlpha * 0.22 + ")";
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + currentAlpha + ")";
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <Box
      as="canvas"
      ref={canvasRef}
      position="absolute"
      inset={0}
      w="full"
      h="full"
      pointerEvents="none"
      zIndex={1}
    />
  );
};

function Login() {
  const [page, setPage] = useState(true); // true for "user", false for "admin"

  useEffect(() => {
    // Hide the scrollbar when the Login component is mounted
    document.body.style.overflow = "hidden";

    // Restore the scrollbar when the component unmounts
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []); // Empty dependency array ensures this runs only once on mount and cleanup on unmount

  // Teal Theme
  const tealBase = "#0f3b3d"; 
  const tealMid = "#154a4c"; 
  const tealDeep = "#0a2f31"; 
  const goldSoft = "rgba(199,152,58,0.18)";
  const whiteSoft = "rgba(255,255,255,0.10)";

  return (
    <Box
      minH="100vh"
      position="relative"
      overflow="hidden"
      bg={tealBase}
      _before={{
        content: '""',
        position: "absolute",
        inset: 0,
        bgGradient: `linear(135deg, ${tealDeep} 0%, ${tealBase} 40%, ${tealMid} 70%, ${tealDeep} 100%)`,
        opacity: 0.9,
        zIndex: 0,
      }}
      _after={{
        content: '""',
        position: "absolute",
        inset: 0,
        bgImage: `
          radial-gradient(600px 300px at 85% 20%, ${goldSoft} 0%, transparent 60%),
          radial-gradient(520px 260px at 15% 70%, ${whiteSoft} 0%, transparent 65%),
          radial-gradient(380px 240px at 60% 80%, ${goldSoft} 0%, transparent 70%)
        `,
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      <Flex minH="100vh" position="relative" zIndex={2}>
        {/* LEFT SIDE */}
        <Flex
          flex={{ md: 1.3, lg: 1.6 }}
          display={{ base: "none", md: "flex" }}
          direction="column"
          align="center"
          justify="space-between"
          position="relative"
          p={{ md: 6, lg: 8 }}
          overflow="hidden"
        >
          {/* Background Ambient Particles */}
          <ParticleCanvas />

          

          {/* Centered Logo with Aura & Orbital Rings */}
          <Flex
            position="relative"
            align="center"
            justify="center"
            w="full"
            flex={1}
            my={2}
          >
            {/* Glowing Backdrop Aura */}
            <Box
              position="absolute"
              w={{ md: "460px", lg: "600px", xl: "700px" }}
              h={{ md: "460px", lg: "600px", xl: "700px" }}
              borderRadius="full"
              bg="radial-gradient(circle, rgba(12, 150, 156, 0.3) 0%, rgba(10, 112, 117, 0.15) 45%, rgba(199, 152, 58, 0.08) 60%, transparent 75%)"
              filter="blur(35px)"
              pointerEvents="none"
              zIndex={1}
            />

            {/* Faint Concentric Orbit Rings */}
            <Box
              position="absolute"
              w={{ md: "440px", lg: "580px", xl: "680px" }}
              h={{ md: "440px", lg: "580px", xl: "680px" }}
              borderRadius="full"
              border="1px dashed rgba(12, 150, 156, 0.22)"
              pointerEvents="none"
              zIndex={1}
            />
            <Box
              position="absolute"
              w={{ md: "520px", lg: "680px", xl: "780px" }}
              h={{ md: "520px", lg: "680px", xl: "780px" }}
              borderRadius="full"
              border="1px solid rgba(199, 152, 58, 0.12)"
              pointerEvents="none"
              zIndex={1}
            />

            {/* Main Gravitas Logo */}
            <Image
              src={gravitasLogo}
              alt="Gravitas - Auction to Action"
              objectFit="contain"
              w="full"
              maxW={{ md: "580px", lg: "760px", xl: "880px" }}
              maxH={{ md: "80vh", lg: "86vh" }}
              transform={{ md: "scale(1.1)", lg: "scale(1.18)" }}
              filter="drop-shadow(0 15px 40px rgba(0, 0, 0, 0.45))"
              transition="all 0.3s ease"
              position="relative"
              zIndex={2}
            />
          </Flex>

          {/* Bottom subtle metadata */}
             
        </Flex>

        {/* RIGHT SIDE */}
        <Flex
          flex={1}
          p={{ base: 4, sm: 8, md: 12 }}
          align="center"
          justify="center"
          direction="column"
          bg="transparent"
        >
          <Box w="100%" maxW="520px">
            {page ? <LoginComponentUser /> : <LoginComponentAdmin />}
            <Text mt={6} textAlign="center" color="white">
              {page ? "Are you an Admin?" : "Are you a Player?"}{" "}
              <Link
                color="teal.200"
                fontWeight="bold"
                onClick={() => setPage(!page)}
              >
                Click Here
              </Link>
            </Text>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
}

export default Login;
