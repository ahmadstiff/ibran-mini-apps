"use client";
import React, { useState, useEffect } from "react";
import { LayoutDashboard, ArrowLeftRight, Wallet, History, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ConnectWallet, Wallet as WalletComponent, WalletDropdown, WalletDropdownDisconnect } from "@coinbase/onchainkit/wallet";
import { Name, Identity, Address, Avatar, EthBalance } from "@coinbase/onchainkit/identity";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const MobileNavbarTelegram = () => {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showWalletPopup, setShowWalletPopup] = useState(false);
  const { isConnected } = useAccount();

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
      <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 max-w-2xl w-full z-50 bg-gray-950/95 backdrop-blur-xl border-t border-cyan-500/30 shadow-[0_-10px_40px_rgba(6,182,212,0.15)]">
        {/* Glow effect line di atas */}
        <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-30" />

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
                        className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full blur-xl opacity-40 animate-pulse"
                      />
                    )}

                    {/* Icon dengan background */}
                    <div
                      className={`relative p-2.5 rounded-full transition-all duration-300 ${
                        isActive
                          ? "shadow-lg shadow-blue-500/25"
                          : "bg-gray-800/50 hover:bg-gray-800"
                      }`}
                    >
                      <Icon
                        size={22}
                        className={`transition-all duration-300 ${
                          isActive
                            ? "text-blue-400 drop-shadow-lg"
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
                  {isConnected && (
                    <div className="absolute inset-0 bg-gray-800/50 rounded-full  opacity-40 animate-pulse" />
                  )}
                  
                  <div className={`relative p-2.5 rounded-full transition-all duration-300 ${
                    isConnected 
                      ? "drop-shadow-lg" 
                      : "bg-gray-800/50 hover:bg-gray-800"
                  }`}>
                    <User
                      size={22}
                      className={`transition-all duration-300 ${
                        isConnected
                          ? "text-blue-400 drop-shadow-lg"
                          : "text-red-400 hover:text-red-300"
                      }`}
                      strokeWidth={isConnected ? 2.5 : 2}
                    />
                  </div>
                </div>
                <span className={`text-xs font-medium transition-all duration-300 mt-1 ${
                  isConnected
                    ? "text-blue-400  font-semibold"
                    : "text-red-500 hover:text-red-400"
                }`}>
                  {isConnected ? "Wallet" : "Connect"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Extra shadow untuk depth */}
        <div className="absolute inset-x-0 -top-4 h-4 bg-gradient-to-t from-gray-950/20 to-transparent pointer-events-none" />
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
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/25">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Connect Wallet</h3>
              <p className="text-gray-400 text-sm">
                {isConnected ? "Your wallet is connected" : "Choose your preferred wallet to connect"}
              </p>
            </div>

            {/* Wallet Connection */}
            <div className="space-y-4">
              {isConnected ? (
                <div className="text-center">
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-4">
                    <div className="text-blue-400 text-sm font-medium">✓ Wallet Connected</div>
                  </div>
                  <ConnectButton />
                </div>
              ) : (
                <div className="space-y-3">
                  <ConnectButton />
                  
                  {/* Alternative connection methods */}
                  <div className="text-center">
                    <div className="text-gray-400 text-xs mb-2">or</div>
                    <button className="w-full py-3 px-4 bg-gray-800 hover:bg-blue-800 text-white rounded-lg transition-colors text-sm font-medium">
                      Connect with QR Code
                    </button>
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
