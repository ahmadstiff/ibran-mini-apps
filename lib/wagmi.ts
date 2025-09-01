import { createConfig, http } from "wagmi";
import { baseSepolia } from "viem/chains";
import { injected, walletConnect } from "wagmi/connectors";

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    injected(),
    walletConnect({ projectId: "YOUR_PROJECT_ID" }),
  ],
  transports: {
    [baseSepolia.id]: http(),
  },
});
