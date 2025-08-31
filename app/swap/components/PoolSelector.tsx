"use client";

import React from "react";
import { useAccount } from "wagmi";
import { ShieldAlert, Wallet2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import Link from "next/link";
import { defaultChain } from "@/lib/get-default-chain";

interface PoolSelectorProps {
  lpAddress: any[];
  lpAddressSelected: string;
  setLpAddressSelected: (value: string) => void;
  addressPosition: string | undefined;
  tokenName: (address: string) => string | undefined;
  tokenLogo: (address: string) => string | undefined;
}

const PoolSelector: React.FC<PoolSelectorProps> = ({
  lpAddress,
  lpAddressSelected,
  setLpAddressSelected,
  addressPosition,
  tokenName,
  tokenLogo,
}) => {
  const { address } = useAccount();

  return (
    <div className="flex flex-col md:flex-row gap-2 mb-5">
      <div className="flex-1 min-w-0">
        <Select onValueChange={(value) => setLpAddressSelected(value)} value={lpAddressSelected}>
          <SelectTrigger className="truncate w-full bg-slate-800/50 text-blue-300 border border-blue-400/30 hover:border-blue-400/50 focus:ring-2 focus:ring-blue-400/50 px-3 md:px-6 py-2 md:py-4 rounded-lg shadow-sm cursor-pointer text-sm md:text-base min-h-[44px] md:min-h-[56px]">
            <SelectValue placeholder="Select LP Address">
              {lpAddressSelected && (
                <div className="flex items-center justify-between w-full">
                  {lpAddress.find((lp) => lp.id === lpAddressSelected) && (
                    <>
                      <div className="flex items-center gap-1 md:gap-2 flex-1">
                        <Image
                          src={
                            tokenLogo(
                              lpAddress.find((lp) => lp.id === lpAddressSelected)?.collateralToken
                            ) ?? ""
                          }
                          alt={
                            tokenName(
                              lpAddress.find((lp) => lp.id === lpAddressSelected)?.collateralToken
                            ) ?? ""
                          }
                          className="size-4 md:size-6 rounded-full flex-shrink-0"
                          width={16}
                          height={16}
                        />
                        <span className="text-xs md:text-sm truncate">
                          {tokenName(
                            lpAddress.find((lp) => lp.id === lpAddressSelected)?.collateralToken
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-center px-2 md:px-4">
                        <span className="text-gray-400 text-xs flex-shrink-0">→</span>
                      </div>
                      <div className="flex items-center gap-1 md:gap-2 flex-1 justify-end">
                        <Image
                          src={
                            tokenLogo(
                              lpAddress.find((lp) => lp.id === lpAddressSelected)?.borrowToken
                            ) ?? ""
                          }
                          alt={
                            tokenName(
                              lpAddress.find((lp) => lp.id === lpAddressSelected)?.borrowToken
                            ) ?? ""
                          }
                          className="size-4 md:size-6 rounded-full flex-shrink-0"
                          width={16}
                          height={16}
                        />
                        <span className="text-xs md:text-sm truncate">
                          {tokenName(
                            lpAddress.find((lp) => lp.id === lpAddressSelected)?.borrowToken
                          )}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border border-blue-400/30 rounded-lg shadow-md max-w-[100%] text-white w-full">
            <SelectGroup>
              <SelectLabel className="text-blue-300 font-semibold px-3 pt-2 text-sm">
                Pool Address
              </SelectLabel>
              {address ? (
                lpAddress.map((lp) => (
                  <SelectItem
                    key={lp.id}
                    value={lp.id}
                    className="py-3 px-3 text-sm text-gray-100 hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1 md:gap-2 flex-1">
                        <Image
                          src={tokenLogo(lp.collateralToken) ?? ""}
                          alt={tokenName(lp.collateralToken) ?? ""}
                          className="size-4 md:size-5 rounded-full flex-shrink-0"
                          width={16}
                          height={16}
                        />
                        <span className="truncate text-xs md:text-sm">
                          {tokenName(lp.collateralToken)}
                        </span>
                      </div>
                      <div className="flex items-center justify-center px-2">
                        <span className="text-gray-400 text-xs flex-shrink-0">→</span>
                      </div>
                      <div className="flex items-center gap-1 md:gap-2 flex-1 justify-end">
                        <Image
                          src={tokenLogo(lp.borrowToken) ?? ""}
                          alt={tokenName(lp.borrowToken) ?? ""}
                          className="size-4 md:size-5 rounded-full flex-shrink-0"
                          width={16}
                          height={16}
                        />
                        <span className="truncate text-xs md:text-sm">
                          {tokenName(lp.borrowToken)}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))
              ) : (
                <div className="text-blue-300 px-3 py-2 text-sm">No LP Address found</div>
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div
        className={`flex-1 min-w-0 text-center px-2 md:px-3 py-2 md:py-1 rounded-lg ${
          addressPosition && addressPosition !== "0x0000000000000000000000000000000000000000"
            ? "bg-blue-500/20 hover:bg-blue-500/30 duration-300 border-2 border-blue-400/50 cursor-pointer"
            : "bg-red-900/20 border-2 border-red-500/30"
        }`}
      >
        {addressPosition && addressPosition !== "0x0000000000000000000000000000000000000000" ? (
          <Link
            className="flex flex-row gap-1 md:gap-2 items-center justify-center text-blue-300 text-xs md:text-sm text-center mt-0"
            href={`https://sepolia.arbiscan.io/address/${addressPosition}`}
            target="_blank"
          >
            <Wallet2 className="size-3 md:size-4" />
            <span className="hidden sm:inline">View Position</span>
            <span className="sm:hidden">View</span>
          </Link>
        ) : (
          <div className="text-red-400 text-xs md:text-sm text-center flex flex-row gap-1 md:gap-2 items-center justify-center">
            <ShieldAlert className="size-3 md:size-4" />
            <span className="hidden sm:inline">Please Select Pool</span>
            <span className="sm:hidden">Select Pool</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PoolSelector;
