import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  networks: {
    localhost: {
      chainId: 31337,
    },
    avalancheFuji: {
      chainId: 43113,
      url: "https://api.avax-test.network/ext/bc/C/rpc",
    },
  },
};

export default config;
