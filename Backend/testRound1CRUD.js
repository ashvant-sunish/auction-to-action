// testRound1CRUD.js
const {
  createBid,
  getAllBids,
  getBidByNo,
  updateBid,
  deleteBid,
} = require("./round1ItemsActions");

async function run() {
  // CREATE
  await createBid(101, [
    { itemName: "Sample Tech", quantity: 2 },
    { itemName: "Sample Property", quantity: 1 }
  ], 5000);
  console.log("✅ Created Bid 101");

  // READ ALL
  const all = await getAllBids();
  console.log("📌 All Bids:", all);

  // READ ONE
  const bid3 = await getBidByNo(3);
  console.log("📌 Bid 3:", bid3);

  // UPDATE
  const updated = await updateBid(101, { amount: 6000 });
  console.log("✅ Updated Bid 101:", updated);

  // DELETE
  await deleteBid(101);
  console.log("❌ Deleted Bid 101");
}

run().then(() => process.exit());
