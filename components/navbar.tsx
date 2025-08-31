"use client";
import React, { useState, useEffect } from "react";
import { LayoutDashboard, ArrowLeftRight, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ConnectWallet, Wallet as WalletComponent, WalletDropdown, WalletDropdownDisconnect } from "@coinbase/onchainkit/wallet";
import { Name, Identity, Address, Avatar, EthBalance } from "@coinbase/onchainkit/identity";
import { useAccount } from "wagmi";

const MobileNavbarTelegram = () => {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("dashboard");
  const { isConnected } = useAccount();

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      color: "from-cyan-400 to-cyan-600",
    },
    {
      id: "swap",
      label: "Swap",
      href: "/swap",
      icon: ArrowLeftRight,
      color: "from-blue-400 to-blue-600",
    },
  ];

  useEffect(() => {
    const found = navItems.find((item) => pathname.startsWith(item.href));
    setActiveTab(found ? found.id : "dashboard");
  }, [pathname]);

  return (
    <>
      {/* Spacer untuk mencegah konten tertutup navbar - sesuaikan height sesuai kebutuhan */}
      <div className="h-20" />

      {/* Bottom Navigation Bar - Fixed di bawah */}
      <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 max-w-md w-full z-50 bg-gray-950/95 backdrop-blur-xl border-t border-cyan-500/30 shadow-[0_-10px_40px_rgba(6,182,212,0.15)]">
        {/* Glow effect line di atas */}
        <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-30" />

        <div className="relative px-4 py-2 safe-area-pb">
          <div className="grid grid-cols-3">
            {/* Dashboard Tab */}
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
                      className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl"
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
                        className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-full blur-xl opacity-40 animate-pulse`}
                      />
                    )}

                    {/* Icon dengan background */}
                    <div
                      className={`relative p-2.5 rounded-full transition-all duration-300 ${
                        isActive
                          ? `bg-gradient-to-r ${item.color} shadow-lg shadow-cyan-500/25`
                          : "bg-gray-800/50 hover:bg-gray-800"
                      }`}
                    >
                      <Icon
                        size={22}
                        className={`transition-all duration-300 ${
                          isActive
                            ? "text-white drop-shadow-lg"
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

            {/* Wallet Connect di tengah */}
            <div className="flex flex-col items-center justify-center py-2 px-3">
              <WalletComponent className="z-10">
                <ConnectWallet>
                  <div className="relative flex items-center justify-center mb-1">
                    <div className="relative p-2.5 rounded-full bg-gradient-to-r from-green-400 to-green-600 shadow-lg shadow-green-500/25 hover:scale-105 transition-all duration-300">
                      <Wallet
                        size={22}
                        className="text-white drop-shadow-lg"
                        strokeWidth={2.5}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-medium text-green-300 drop-shadow-lg font-semibold mt-1">
                    {isConnected ? "Connected" : "Connect"}
                  </span>
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
              </WalletComponent>
            </div>
          </div>
        </div>

        {/* Extra shadow untuk depth */}
        <div className="absolute inset-x-0 -top-4 h-4 bg-gradient-to-t from-gray-950/20 to-transparent pointer-events-none" />
      </nav>
    </>
  );
};

export default MobileNavbarTelegram;
