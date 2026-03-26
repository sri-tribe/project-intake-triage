"use client";

import { MuiNextLink } from "@/components/mui-next-link";
import { Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";

type Crumb = { label: string; href?: string };

export function PageBreadcrumb({ items }: { items: Crumb[] }) {
  return (
    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 0 }}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        if (isLast || !item.href) {
          return (
            <Typography key={item.label} color="text.secondary" variant="body2">
              {item.label}
            </Typography>
          );
        }
        return (
          <MuiLink
            key={item.href}
            component={MuiNextLink}
            href={item.href}
            underline="hover"
            color="primary"
            variant="body2"
          >
            {item.label}
          </MuiLink>
        );
      })}
    </Breadcrumbs>
  );
}
