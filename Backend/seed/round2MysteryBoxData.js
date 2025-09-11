// seed/round2MysteryBoxData.js

const round2MysteryBoxData = [
  { boxId: 'MB01', type: 'money_multiplier', description: 'Gain 2x your bid amount', details: { multiplier: 2 } },
  { boxId: 'MB02', type: 'money_multiplier', description: 'Gain 2x your bid amount', details: { multiplier: 2 } },
  { boxId: 'MB03', type: 'money_multiplier', description: 'Gain 1.5x your bid amount', details: { multiplier: 1.5 } },
  { boxId: 'MB04', type: 'money_multiplier', description: 'Gain 1.5x your bid amount', details: { multiplier: 1.5 } },
  { boxId: 'MB05', type: 'nothing', description: 'Nothing', details: { message: 'Better luck next time!' } },
  { boxId: 'MB06', type: 'nothing', description: 'Nothing', details: { message: 'Better luck next time!' } },
  { boxId: 'MB07', type: 'nothing', description: 'Nothing', details: { message: 'Better luck next time!' } },
  { boxId: 'MB08', type: 'nothing', description: 'Nothing', details: { message: 'Better luck next time!' } },
  { boxId: 'MB09', type: 'nothing', description: 'Nothing', details: { message: 'Better luck next time!' } },
  { boxId: 'MB10', type: 'nothing', description: 'Nothing', details: { message: 'Better luck next time!' } },
  { boxId: 'MB11', type: 'nothing', description: 'Nothing', details: { message: 'Better luck next time!' } },
  { boxId: 'MB12', type: 'nothing', description: 'Nothing', details: { message: 'Better luck next time!' } },
  { boxId: 'MB13', type: 'nothing', description: 'Nothing', details: { message: 'Better luck next time!' } },
  { boxId: 'MB14', type: 'resource_grant', description: 'Gain 6 Technology, 2 Utilities', details: { resources: { 'Technology': 6, 'Utilities': 2 } } },
  { boxId: 'MB15', type: 'resource_grant', description: 'Gain 6 Transportation, 2 Office Space', details: { resources: { 'Transportation': 6, 'Office Space': 2 } } },
  { boxId: 'MB16', type: 'resource_grant', description: 'Gain 3 Property, 3 Machinery & Tools, 2 Electricity Supply', details: { resources: { 'Property': 3, 'Machinery & Tools': 3, 'Electricity Supply': 2 } } },
  { boxId: 'MB17', type: 'resource_grant', description: 'Gain 5 Skilled Labour, 1 Technology, 2 Construction Material', details: { resources: { 'Skilled Labour': 5, 'Technology': 1, 'Construction Material': 2 } } },
  { boxId: 'MB18', type: 'resource_grant', description: 'Gain 3 Technology, 3 Machinery & Tools, 2 Utilities', details: { resources: { 'Technology': 3, 'Machinery & Tools': 3, 'Utilities': 2 } } },
  { boxId: 'MB19', type: 'resource_grant', description: 'Gain 6 Utilities, 2 Property', details: { resources: { 'Utilities': 6, 'Property': 2 } } },
  { boxId: 'MB20', type: 'resource_grant', description: 'Gain 4 Electricity Supply, 3 Technology, 1 Skilled Labour', details: { resources: { 'Electricity Supply': 4, 'Technology': 3, 'Skilled Labour': 1 } } },
  { boxId: 'MB21', type: 'challenge', description: 'Say a phrase 5 times to win 2x your bid amount.', details: {
    challengeText: "Big bids boost booming businesses.",
    attempts: 5,
    reward: { type: 'money_multiplier', details: { multiplier: 2 } }
  }},
  { boxId: 'MB22', type: 'challenge', description: 'Say a phrase 5 times to win 5 Property, 3 Skilled Labour.', details: {
    challengeText: "Clever creators craft catchy campaigns.",
    attempts: 5,
    reward: { type: 'resource_grant', details: { resources: { 'Property': 5, 'Skilled Labour': 3 } } }
  }},
  { boxId: 'MB23', type: 'challenge', description: 'Say a phrase 5 times to win 4 Machinery & Tools, 4 Technology.', details: {
    challengeText: "Smart startups seek smart supporters.",
    attempts: 5,
    reward: { type: 'resource_grant', details: { resources: { 'Machinery & Tools': 4, 'Technology': 4 } } }
  }},
  { boxId: 'MB24', type: 'challenge', description: 'Say a phrase 5 times to win 1.5x your bid amount.', details: {
    challengeText: "Great goals grow grand gains.",
    attempts: 5,
    reward: { type: 'money_multiplier', details: { multiplier: 1.5 } }
  }},
  { boxId: 'MB25', type: 'challenge', description: 'Say a phrase 5 times to win 5 Electricity Supply, 3 Machinery & Tools.', details: {
    challengeText: "Winning workers work with wise workflows.",
    attempts: 5,
    reward: { type: 'resource_grant', details: { resources: { 'Electricity Supply': 5, 'Machinery & Tools': 3 } } }
  }}
];

module.exports = round2MysteryBoxData;