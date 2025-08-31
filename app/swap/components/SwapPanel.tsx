"use client";

import React from "react";
import { ArrowDownUp, ShieldAlert, History, ArrowRight } from "lucide-react";
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
import { useSwapLogic } from "../hooks/useSwapLogic";
import { defaultChain } from "@/lib/get-default-chain";
import { tokens } from "@/constants/tokenAddress";

export default function SwapPanel() {
  const {
    // State
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    slippage,
    isMounted,
    lpAddress,
    lpAddressSelected,
    addressPosition,
    selectedCollateralToken,
    fromTokenBalance,
    toTokenBalance,
    userCollateral,
    priceExchangeRate,
    isLoading,
    error,
    address,

    // Setters
    setFromToken,
    setToToken,
    setFromAmount,
    setToAmount,
    setSlippage,
    setLpAddressSelected,

    // Functions
    tokenName,
    tokenLogo,
    formatBalance,
    switchTokens,
    formatExchangeRate,
    handleSwap,
    getButtonText,
    formatButtonClick,
    formatButtonClassName,
  } = useSwapLogic();

  return (
    <div className="max-w-xl mx-auto w-full px-2 ">
      <div className="flex flex-col md:flex-row gap-2 mb-5">
        <div className="flex-1 min-w-0">
          <Select onValueChange={(value) => setLpAddressSelected(value)} value={lpAddressSelected}>
            <SelectTrigger className="truncate w-full bg-slate-800/50 text-blue-300 border border-blue-400/30 hover:border-blue-400/50 focus:ring-2 focus:ring-blue-400/50 px-3 md:px-4 py-2 md:py-3 rounded-lg shadow-sm cursor-pointer text-sm md:text-base min-h-[44px] md:min-h-[48px]">
              <SelectValue placeholder="Select LP Address">
                {lpAddressSelected && (
                  <div className="flex items-center justify-between w-full">
                    {lpAddress.find((lp) => lp.id === lpAddressSelected) && (
                      <>
                        <div className="flex items-center gap-1 md:gap-2 flex-1">
                          <Image
                            src={
                              lpAddress.find((lp) => lp.id === lpAddressSelected)
                                ?.collateralTokenInfo?.logo ?? ""
                            }
                            alt={
                              lpAddress.find((lp) => lp.id === lpAddressSelected)
                                ?.collateralTokenInfo?.name ?? ""
                            }
                            className="size-4 md:size-5 rounded-full flex-shrink-0"
                            width={16}
                            height={16}
                          />
                          <span className="text-xs md:text-sm truncate">
                            {lpAddress.find((lp) => lp.id === lpAddressSelected)
                              ?.collateralTokenInfo?.name ?? "Unknown"}
                          </span>
                        </div>
                        <div className="flex items-center justify-center px-2 md:px-4">
                          <span className="text-gray-400 text-xs flex-shrink-0">→</span>
                        </div>
                        <div className="flex items-center gap-1 md:gap-2 flex-1 justify-end">
                          <Image
                            src={
                              lpAddress.find((lp) => lp.id === lpAddressSelected)?.borrowTokenInfo
                                ?.logo ?? ""
                            }
                            alt={
                              lpAddress.find((lp) => lp.id === lpAddressSelected)?.borrowTokenInfo
                                ?.name ?? ""
                            }
                            className="size-4 md:size-5 rounded-full flex-shrink-0"
                            width={16}
                            height={16}
                          />
                          <span className="text-xs md:text-sm truncate">
                            {lpAddress.find((lp) => lp.id === lpAddressSelected)?.borrowTokenInfo
                              ?.name ?? "Unknown"}
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
                            src={lp.collateralTokenInfo?.logo ?? ""}
                            alt={lp.collateralTokenInfo?.name ?? ""}
                            className="size-4 md:size-5 rounded-full flex-shrink-0"
                            width={16}
                            height={16}
                          />
                          <span className="truncate text-xs md:text-sm">
                            {lp.collateralTokenInfo?.name ?? "Unknown"}
                          </span>
                        </div>
                        <div className="flex items-center justify-center px-2">
                          <span className="text-gray-400 text-xs flex-shrink-0">→</span>
                        </div>
                        <div className="flex items-center gap-1 md:gap-2 flex-1 justify-end">
                          <Image
                            src={lp.borrowTokenInfo?.logo ?? ""}
                            alt={lp.borrowTokenInfo?.name ?? ""}
                            className="size-4 md:size-5 rounded-full flex-shrink-0"
                            width={16}
                            height={16}
                          />
                          <span className="truncate text-xs md:text-sm">
                            {lp.borrowTokenInfo?.name ?? "Unknown"}
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

        <div>
          {addressPosition && addressPosition === "0x0000000000000000000000000000000000000000" && (
            <div className="text-red-400 text-base text-center flex flex-row gap-2 items-center justify-center">
              <ShieldAlert className="size-4" />
              Please Select Pool
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 w-full">
        {/* Warning Message for No Position */}
        {(!addressPosition || addressPosition === "0x0000000000000000000000000000000000000000") &&
          lpAddressSelected && (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 text-yellow-400">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="size-5" />
                <span className="font-medium">No Active Position Found</span>
              </div>
            </div>
          )}

        {/* From Token */}
        <div
          className={`bg-slate-800/50 border border-blue-400/30 rounded-xl p-4 w-full shadow-sm hover:shadow-md transition-shadow ${
            !addressPosition || addressPosition === "0x0000000000000000000000000000000000000000"
              ? "opacity-50 pointer-events-none"
              : ""
          }`}
        >
          <div className="flex justify-between mb-5">
            <label htmlFor="fromAmount" className="text-blue-300 font-medium">
              From
            </label>
            <span className="text-blue-400 text-sm truncate">
              Balance:{" "}
              {formatBalance(
                fromToken.name,
                fromToken.addresses[defaultChain],
                fromToken.decimals,
                Number(fromTokenBalance ?? 0)
              )}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="fromAmount"
              type="text"
              className="w-full bg-transparent text-gray-100 text-xl focus:outline-none p-2 border-b border-blue-400/30"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => {
                const raw = e.target.value;
                const normalized = raw.replace(",", ".");
                if (normalized === "" || /^\d*\.?\d*$/.test(normalized)) {
                  setFromAmount(normalized);
                }
              }}
              aria-label="Amount to swap"
            />
            <Select
              value={fromToken.addresses[defaultChain]}
              onValueChange={(value) =>
                setFromToken(tokens.find((t) => t.addresses[defaultChain] === value) || tokens[0])
              }
            >
              <SelectTrigger className="bg-slate-700/50 max-w-28 md:max-w-32 min-w-28 md:min-w-32 text-blue-300 py-2 px-2 md:px-3 rounded-lg border border-blue-400/30 hover:border-blue-400/50 transition-colors cursor-pointer text-sm">
                <SelectValue placeholder="Select token">
                  <div className="flex items-center gap-1 md:gap-2">
                    <Image
                      src={tokenLogo(fromToken.addresses[defaultChain]) ?? ""}
                      alt={fromToken.name}
                      className="size-4 md:size-5 rounded-full"
                      width={16}
                      height={16}
                    />
                    <span className="text-xs md:text-sm truncate">{fromToken.name}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border border-blue-400/30 text-white w-full">
                {tokens.map((token, index) => (
                  <SelectItem
                    key={index}
                    value={token.addresses[defaultChain]}
                    className="text-gray-100 flex flex-row gap-2 items-center cursor-pointer hover:bg-slate-700/50 py-2"
                  >
                    <Image
                      src={tokenLogo(token.addresses[defaultChain]) ?? ""}
                      alt={token.name}
                      className="size-4 md:size-5 rounded-full"
                      width={16}
                      height={16}
                    />
                    <span className="text-sm">{token.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Switch button */}
        <div
          className={`flex justify-center ${
            !addressPosition || addressPosition === "0x0000000000000000000000000000000000000000"
              ? "opacity-50 pointer-events-none"
              : ""
          }`}
        >
          <div className="group">
            <button
              onClick={switchTokens}
              className="bg-slate-700/50 p-2 rounded-full hover:bg-slate-600/50 border border-blue-400/30 z-10 transform transition-transform duration-300 group-hover:rotate-18 cursor-pointer shadow-sm"
              aria-label="Switch tokens"
            >
              <ArrowDownUp className="h-5 w- text-blue-300  transform transition-transform duration-300 group-hover:rotate-162" />
            </button>
          </div>
        </div>

        {/* To Token */}
        <div
          className={`bg-slate-800/50 border border-blue-400/30 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow ${
            !addressPosition || addressPosition === "0x0000000000000000000000000000000000000000"
              ? "opacity-50 pointer-events-none"
              : ""
          }`}
        >
          <div className="flex justify-between mb-2">
            <label htmlFor="toAmount" className="text-blue-300 font-medium">
              To
            </label>
            <span className="text-blue-400 text-sm truncate">
              Balance:{" "}
              {formatBalance(
                toToken.name,
                toToken.addresses[defaultChain],
                toToken.decimals,
                Number(toTokenBalance ?? 0)
              )}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="toAmount"
              type="text"
              className="w-full bg-transparent text-gray-100 text-xl focus:outline-none p-2 border-b border-blue-400/30"
              placeholder="0.0"
              value={toAmount}
              readOnly
              aria-label="Amount to receive"
            />
            <Select
              value={toToken.addresses[defaultChain]}
              onValueChange={(value) =>
                setToToken(tokens.find((t) => t.addresses[defaultChain] === value) || tokens[0])
              }
            >
              <SelectTrigger className="bg-slate-700/50 max-w-28 md:max-w-32 min-w-28 md:min-w-32 text-blue-300 py-2 px-2 md:px-3 rounded-lg border border-blue-400/30 hover:border-blue-400/50 transition-colors cursor-pointer text-sm">
                <SelectValue placeholder="Select token">
                  <div className="flex items-center gap-1 md:gap-2">
                    <Image
                      src={tokenLogo(toToken.addresses[defaultChain]) ?? ""}
                      alt={toToken.name}
                      className="size-4 md:size-5 rounded-full"
                      width={16}
                      height={16}
                    />
                    <span className="text-xs md:text-sm truncate">{toToken.name}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border border-blue-400/30 text-white w-full">
                {tokens.map((token, index) => (
                  <SelectItem
                    key={index}
                    value={token.addresses[defaultChain]}
                    className="text-gray-100 flex flex-row gap-2 items-center cursor-pointer hover:bg-slate-700/50 py-2"
                  >
                    <Image
                      src={tokenLogo(token.addresses[defaultChain]) ?? ""}
                      alt={token.name}
                      className="size-4 md:size-5 rounded-full"
                      width={16}
                      height={16}
                    />
                    <span className="text-sm">{token.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Swap Rate */}
        <div
          className={`bg-slate-800/50 border border-blue-400/30 rounded-xl p-3 text-sm text-blue-400 shadow-sm ${
            !addressPosition || addressPosition === "0x0000000000000000000000000000000000000000"
              ? "opacity-50 pointer-events-none"
              : ""
          }`}
        >
          <div className="flex justify-between">
            <span>Exchange Rate:</span>
            <span className="truncate">{formatExchangeRate(priceExchangeRate)}</span>
          </div>
        </div>

        {/* Slippage Setting */}
        <div
          className={`bg-slate-800/50 border border-blue-400/30 rounded-xl p-3 shadow-sm ${
            !addressPosition || addressPosition === "0x0000000000000000000000000000000000000000"
              ? "opacity-50 pointer-events-none"
              : ""
          }`}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <span className="text-blue-300 font-medium">Slippage Tolerance</span>
            <div className="flex flex-wrap gap-1">
              {["0.5", "1", "2", "3"].map((value) => (
                <button
                  key={value}
                  className={`px-3 py-1 rounded text-sm ${
                    slippage === value
                      ? "bg-blue-600 text-white"
                      : "bg-slate-700/50 text-blue-300 hover:bg-slate-600/50 cursor-pointer"
                  }`}
                  onClick={() => setSlippage(value)}
                >
                  {value}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <button onClick={formatButtonClick} className={formatButtonClassName()}>
          {getButtonText()}{" "}
        </button>
      </div>
    </div>
  );
}
