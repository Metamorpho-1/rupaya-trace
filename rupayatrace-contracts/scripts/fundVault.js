import hre from "hardhat";
import { ethers } from "ethers";

async function main() {
  // Using your real addresses from previous logs
  const tokenAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; 
  const vaultAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; 

  // 1. Get a provider to talk to your local Hardhat node
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  // 2. Get the signer (the account that will send the money)
  const signer = await provider.getSigner();

  // 3. Define the Interface (so ethers knows how to talk to the token)
  const abi = [
    "function transfer(address to, uint256 amount) public returns (bool)",
    "function balanceOf(address account) public view returns (uint256)"
  ];

  // 4. Create the contract instance
  const rupayaToken = new ethers.Contract(tokenAddress, abi, signer);

  const fundingAmount = ethers.parseEther("100000");

  console.log(`Transferring 100,000 tokens to the NGO Vault at ${vaultAddress}...`);
  
  // 5. Perform the transfer
  const tx = await rupayaToken.transfer(vaultAddress, fundingAmount);
  
  // Wait for the transaction to be mined
  await tx.wait();

  console.log("✅ Vault successfully funded!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});