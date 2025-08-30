'use client';

import * as React from 'react';
import { useSpotlightShortcut } from './spotlight';

export function useSpotlightOpen() {
  const [open, setOpen] = React.useState(false);
  useSpotlightShortcut(setOpen);
  return { open, setOpen } as const;
}

