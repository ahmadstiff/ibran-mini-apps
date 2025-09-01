"use client";

import { ConnectWallet, Wallet, WalletDropdown, WalletDropdownDisconnect } from "@coinbase/onchainkit/wallet";
import { Name, Identity, Address, Avatar, EthBalance } from "@coinbase/onchainkit/identity";

export default function ConnectWalletButton() {
  return (
    <Wallet className="z-10">
      <ConnectWallet>
        <Name className="text-inherit" />
      </ConnectWallet>
      <WalletDropdown>
        <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
          <Avatar />
          <Name />
          <Address />
          <EthBalance />
        </Identity>
        <WalletDropdownDisconnect />
      </WalletDropdown>
    </Wallet>
  );
}
