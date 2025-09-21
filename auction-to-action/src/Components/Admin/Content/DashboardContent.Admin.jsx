import { Box, Flex } from "@chakra-ui/react";
import React from "react";
import OngoingRoundAdmin from "./DashboardCards/OngoingRound.Admin";
import TotalAdminsAdmin from "./DashboardCards/TotalAdmins.Admin";
import TotalTeamsAdmin from "./DashboardCards/TotalTeams.Admin";
import RoundsStartAdmin from "./DashboardCards/RoundsStart.Admin";
import RoundLinksAdmin from "./DashboardCards/RoundLinks.Admin";

function DashboardContentAdmin({
  ongoingRound,
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
      />
      <RoundLinksAdmin setfile={setfile} />
    </Box>
  );
}

export default DashboardContentAdmin;
