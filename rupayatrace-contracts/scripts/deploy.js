import hre from "hardhat";

async function main() {
  console.log("🚀 Initializing RupayaTrace Deployment...");

  const token = await hre.viem.deployContract("RupayaToken");
  console.log(`✅ Token Address: ${token.address}`);

  const vault = await hre.viem.deployContract("RupayaTraceVault", [token.address]);
  console.log(`✅ Vault Address: ${vault.address}`);

  console.log("\n--- DEPLOYMENT COMPLETE ---");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});