import { Token } from "@/types";

export const tokens: Token[] = [
  {
    name: "WETH",
    symbol: "WETH",
    logo: "/token/weth.png",
    decimals: 18,
    addresses: {
      84532: "0xB5155367af0Fab41d1279B059571715068dE263C",
      11155420: "0x21077433B716F12e6aC2218184DC8fBbAd5E47fc",
      421614: "0x8acFd502E5D1E3747C17f8c61880be64BABAE2dF",
    },
    priceFeed: {
      84532: "0x86d67c3D38D2bCeE722E601025C25a575021c6EA",
      421614: "0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165",
      11155420: "0x6c75b16496384caE307f7E842e7133590E6D79Af",
    },
  },
  {
    name: "WBTC",
    symbol: "WBTC",
    logo: "/token/wbtc.png",
    decimals: 8,
    addresses: {
      84532: "0x7CC19AdfCB73A81A6769dC1A9f7f9d429b27f000",
      11155420: "0x3217D2b65Df07C7FD5BBa61144ad4B7ec623E311",
      421614: "0xd642a577d77DF95bADE47F6A2329BA9d280400Ea",
    },
    priceFeed: {
      421614: "0x56a43EB56Da12C0dc1D972ACb089c06a5dEF8e69",
      84532: "0x86d67c3D38D2bCeE722E601025C25a575021c6EA",
      11155420: "0x121296103189009d9D082943bE723387A6c7D30C",
    },
  },
  {
    name: "USDC",
    symbol: "USDC",
    logo: "/token/usdc.png",
    decimals: 6,
    addresses: {
      84532: "0xDa11C806176678e4228C904ec27014267e128fb5",
      11155420: "0xcD108eEE9a62baEeA4a03e4CE5D2dD15b47b2857",
      421614: "0x902bf8CaC2222a8897d07864BEB49C291633B70E",
    },
    priceFeed: {
      421614: "0x902bf8CaC2222a8897d07864BEB49C291633B70E",
      84532: "0x86d67c3D38D2bCeE722E601025C25a575021c6EA",
    },
  },
  {
    name: "USDT",
    symbol: "USDT",
    logo: "/token/usdt.png",
    decimals: 6,
    addresses: {
      84532: "0xA391a85B3B8D9cC90555E848aF803BF97067aA81",
      11155420: "0xBd788D49ffD8707dC713897614D96755FF72b313",
      421614: "0x2315a799b5E50b0454fbcA7237a723df4868F606",
    },
    priceFeed: {
      421614: "0x80EDee6f667eCc9f63a0a6f55578F870651f06A4",
      84532: "0x86d67c3D38D2bCeE722E601025C25a575021c6EA",
    },
  },
];

export const helperAddress = "0x8030dA6FBba0B33D4Ce694B19CD1e1eC50C9d916";
