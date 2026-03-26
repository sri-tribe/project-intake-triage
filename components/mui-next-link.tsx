"use client";

import * as React from "react";
import NextLink from "next/link";

/**
 * Next.js App Router Link with ref forwarding for MUI `component` / `ListItemButton` integration.
 * Avoids React 19 + MUI runtime errors when using `component={Link}` directly.
 */
export const MuiNextLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<typeof NextLink>
>(function MuiNextLink(props, ref) {
  return <NextLink ref={ref} {...props} />;
});
