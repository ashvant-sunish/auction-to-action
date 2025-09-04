import { Box, Flex } from "@chakra-ui/react";
import React from "react";
import OngoingRoundAdmin from "./DashboardCards.Admin.Jsx/OngoingRound.Admin";
import TotalAdminsAdmin from "./DashboardCards.Admin.Jsx/TotalAdmins.Admin";
import TotalTeamsAdmin from "./DashboardCards.Admin.Jsx/TotalTeams.Admin";
import RoundsStartAdmin from "./DashboardCards.Admin.Jsx/RoundsStart.Admin";
import RoundLinksAdmin from "./DashboardCards.Admin.Jsx/RoundLinks.Admin";

function DashboardContentAdmin({
  ongoingRound,
  setOngoingRound,
  TotalAdmins,
  TotalTeams,
  setfile,
}) {
  return (
    <Box>
      <Flex
        gap={4}
        mt={4}
        bg="transparent"
        borderRadius="2xl"
        width="79%"
        float="right"
        ml={2}
        mr={2}
      >
        <OngoingRoundAdmin ongoingRound={ongoingRound} />
        <TotalAdminsAdmin TotalAdmins={TotalAdmins} />
        <TotalTeamsAdmin TotalTeams={TotalTeams} />
      </Flex>
      <RoundsStartAdmin
        ongoingRound={ongoingRound}
        setOngoingRound={setOngoingRound}
      />
      <RoundLinksAdmin setfile={setfile} />
    </Box>
  );
}

export default DashboardContentAdmin;
