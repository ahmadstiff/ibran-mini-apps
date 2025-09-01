// @noErrors: 2307 2580 2339 - cannot find 'process', cannot find './wagmi', cannot find 'import.meta'
'use client';

import type { ReactNode } from 'react';
import { MiniKitProvider } from '@coinbase/onchainkit/minikit';
import {  baseSepolia } from 'wagmi/chains'; 

export function Providers(props: { children: ReactNode }) {
  return (
    <MiniKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={baseSepolia}
    >
      {props.children}
    </MiniKitProvider>
  );
}