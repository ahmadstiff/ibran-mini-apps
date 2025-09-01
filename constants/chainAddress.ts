import { Chain } from "@/types";

export const chains: Chain[] = [
  {
    id: 84532,
    name: "Base Sepolia",
    logo: "/chain/base.png",
    contracts: {
      lendingPool: "0x76091aC74058d69e32CdbCc487bF0bCA09cb59D7",
      factory: "0x31c3850D2cBDC5B084D632d1c61d54161790bFF8",
      position: "0x7C1A494ED22eAFC04e314c79Fc81AD11386f63a1",
      protocol: "0x12D5C6Cdd764D661cce70F1BB1eE144b7ac6D664",
      isHealthy: "0x4f27734719F12D10258bbA889C789641fb4A122e",
      blockExplorer: "https://sepolia.basescan.org",
    },
  },

  {
    id: 421614,
    name: "Arbitrum Sepolia",
    logo: "/chain/arbitrum.png",
    contracts: {
      lendingPool: "",
      factory: "",
      position: "",
      protocol: "",
      isHealthy: "",
      blockExplorer: "https://sepolia.arbiscan.io",
    },
  },

  {
    id: 11155420,
    name: "Optimism Sepolia",
    logo: "/chain/optimism-logo.svg",
    contracts: {
      lendingPool: "",
      factory: "",
      position: "",
      protocol: "",
      isHealthy: "",
      blockExplorer: "https://sepolia-optimism.etherscan.io",
    },
  },
];
