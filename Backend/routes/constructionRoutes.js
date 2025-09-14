const express = require('express');
const router = express.Router();
const {
  constructEnterprise,
  purchaseProduct,
  getTeamInventory,
  getTeamPortfolioWorth
} = require('../controllers/constructionController');

// Construct enterprise
router.post('/construct-enterprise', constructEnterprise);

// Purchase product
router.post('/purchase-product', purchaseProduct);

// Get team inventory (enterprises and products)
router.get('/inventory', getTeamInventory);

// Get team portfolio worth
router.get('/portfolio-worth', getTeamPortfolioWorth);

module.exports = router;