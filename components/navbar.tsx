"use client";
import React, { useState, useEffect } from "react";
import { LayoutDashboard, ArrowLeftRight, History, User, Wallet2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ConnectWallet, Wallet, WalletDropdown, WalletDropdownDisconnect } from "@coinbase/onchainkit/wallet";
import { Name, Identity, Address, Avatar, EthBalance } from "@coinbase/onchainkit/identity";
import { useAccount } from "wagmi";


const MobileNavbarTelegram = () => {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showWalletPopup, setShowWalletPopup] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { isConnected } = useAccount();

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      color: "from-blue-400 to-blue-600",
    },
    {
      id: "swap",
      label: "Swap",
      href: "/swap",
      icon: ArrowLeftRight,
      color: "from-blue-400 to-blue-600",
    },
    {
      id: "history",
      label: "History",
      href: "/history",
      icon: History,
      color: "from-blue-400 to-blue-600",
    },
  ];

  useEffect(() => {
    const found = navItems.find((item) => pathname.startsWith(item.href));
    setActiveTab(found ? found.id : "dashboard");
  }, [pathname]);

  const handleWalletClick = () => {
    setShowWalletPopup(!showWalletPopup);
  };

  const closeWalletPopup = () => {
    setShowWalletPopup(false);
  };

  return (
    <>
      {/* Spacer untuk mencegah konten tertutup navbar - sesuaikan height sesuai kebutuhan */}
      <div className="h-20" />

      {/* Bottom Navigation Bar - Fixed di bawah */}
      <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 max-w-2xl w-full z-50 bg-gray-950/95 border-t rounded-t-xl border-cyan-500/30 ">
        {/* Glow effect line di atas */}
        <div className="absolute -top-px left-0 right-0 h-px" />

        <div className="relative px-4 py-2 safe-area-pb">
          <div className="grid grid-cols-4">
            {/* Navigation Tabs */}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setActiveTab(item.id)}
                  className="relative flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-300 active:scale-95"
                >
                  {/* Background effect untuk tab aktif */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-transparent rounded-xl"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}

                  {/* Icon Container dengan efek */}
                  <div
                    className={`relative flex items-center justify-center mb-1 transition-all duration-300 ${
                      isActive ? "scale-110" : "scale-100 hover:scale-105"
                    }`}
                  >
                    {/* Glow Effect untuk icon aktif */}
                    {isActive && (
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full blur-sm opacity-10 "
                      />
                    )}

                    {/* Icon dengan background */}
                    <div
                      className={`relative p-2.5 rounded-full transition-all duration-300 ${
                        isActive
                          ? "shadow-md shadow-blue-500/25"
                          : "bg-gray-800/50 hover:bg-gray-800"
                      }`}
                    >
                      <Icon
                        size={22}
                        className={`transition-all duration-300 ${
                          isActive
                            ? "text-blue-400 shadow-md"
                            : "text-gray-400 hover:text-gray-300"
                        }`}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                    </div>
                  </div>

                  {/* Label text */}
                  <span
                    className={`text-xs font-medium transition-all duration-300 mt-1 ${
                      isActive
                        ? "text-cyan-300 drop-shadow-lg font-semibold"
                        : "text-gray-500 hover:text-gray-400"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}

            {/* Wallet Connect di kanan */}
            <div className="flex flex-col items-center justify-center py-2 px-3">
              <button
                onClick={handleWalletClick}
                className="relative flex flex-col items-center justify-center transition-all duration-300 active:scale-95"
              >
                <div className="relative flex items-center justify-center mb-1">
                  {/* Glow Effect untuk wallet connected */}
                  {isMounted && isConnected && (
                    <div className="absolute inset-0 bg-gray-800/50 hover:bg-gray-800 rounded-full  opacity-40 animate-pulse" />
                  )}
                  
                  <div className={`relative p-2.5 rounded-full transition-all duration-300 ${
                    isMounted && isConnected 
                      ? "drop-shadow-lg bg-gray-800/50 hover:bg-gray-800" 
                      : "bg-gray-800/50 hover:bg-gray-800"
                  }`}>
                    <Wallet2
                      size={22}
                      className={`transition-all duration-300 ${
                        isMounted && isConnected
                          ? "text-gray-400 drop-shadow-lg"
                          : "text-red-400 hover:text-red-300"
                      }`}
                      strokeWidth={isMounted && isConnected ? 2.5 : 2}
                    />
                  </div>
                </div>
                <span className={`text-xs font-medium transition-all duration-300 mt-1 ${
                  isMounted && isConnected
                    ? "text-gray-400 "
                    : "text-red-500 hover:text-red-400"
                }`}>
                  {isMounted && isConnected ? "Connected" : "Disconnected"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Extra shadow untuk depth */}
        <div className="absolute inset-x-0 -top-4 h-4 pointer-events-none" />
      </nav>

      {/* Wallet Connect Popup */}
      {showWalletPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeWalletPopup}
          />
          
          {/* Popup Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative bg-gray-900 border border-blue-500/30 rounded-2xl p-6 w-80 max-w-[90vw] shadow-2xl shadow-blue-500/20"
          >
            {/* Close button */}
            <button
              onClick={closeWalletPopup}
              className="absolute top-4 right-4 text-gray-400 hover:text-blue-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-transparent border-2 border-blue-800 rounded-full flex items-center justify-center">
                <Wallet2 className="w-8 h-8 text-blue-800" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Connect Wallet</h3>
              <p className="text-gray-400 text-sm">
                {isMounted && isConnected ? "Your wallet is connected" : "Choose your preferred wallet to connect"}
              </p>
            </div>

            {/* Wallet Connection */}
            <div className="flex flex-col items-center justify-center space-y-4">
              {isMounted && isConnected ? (
                <div className="flex flex-col items-center justify-center w-full">
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-4 w-full">
                    <div className="text-blue-400 text-sm font-medium text-center">Wallet Connected</div>
                  </div>
                  <div className="w-full flex justify-center">
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
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center w-full">
                  <div className="w-full flex justify-center">
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
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <p className="text-gray-500 text-xs text-center">
                By connecting, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default MobileNavbarTelegram;
