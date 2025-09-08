const { createTeam, getAllTeams, updateTeam, deleteTeam } = require('./adminTeamActions');

// Test flow
(async () => {
  await createTeam(66, "TEAM066", 1000); // Create
  await getAllTeams();                   // Read
  await updateTeam(66, { budget: 1500 }); // Update
  await deleteTeam(66);                   // Delete
})();
