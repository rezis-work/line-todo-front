'use client';

import * as React from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

interface ResponsiveDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const ResponsiveDialog = ({ open, onOpenChange, children }: ResponsiveDialogProps) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {children}
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {children}
    </Drawer>
  );
};

const ResponsiveDialogTrigger = ({
  children,
  asChild,
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return <DialogTrigger asChild={asChild}>{children}</DialogTrigger>;
  }

  return <DrawerTrigger asChild={asChild}>{children}</DrawerTrigger>;
};

interface ResponsiveDialogContentProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveDialogContent = ({
  children,
  className,
}: ResponsiveDialogContentProps) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return <DialogContent className={className}>{children}</DialogContent>;
  }

  return <DrawerContent className={className}>{children}</DrawerContent>;
};

interface ResponsiveDialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveDialogHeader = ({
  children,
  className,
}: ResponsiveDialogHeaderProps) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return <DialogHeader className={className}>{children}</DialogHeader>;
  }

  return <DrawerHeader className={className}>{children}</DrawerHeader>;
};

interface ResponsiveDialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveDialogTitle = ({
  children,
  className,
}: ResponsiveDialogTitleProps) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return <DialogTitle className={className}>{children}</DialogTitle>;
  }

  return <DrawerTitle className={className}>{children}</DrawerTitle>;
};

interface ResponsiveDialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveDialogDescription = ({
  children,
  className,
}: ResponsiveDialogDescriptionProps) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return <DialogDescription className={className}>{children}</DialogDescription>;
  }

  return <DrawerDescription className={className}>{children}</DrawerDescription>;
};

interface ResponsiveDialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveDialogFooter = ({
  children,
  className,
}: ResponsiveDialogFooterProps) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return <DialogFooter className={className}>{children}</DialogFooter>;
  }

  return <DrawerFooter className={className}>{children}</DrawerFooter>;
};

export {
  ResponsiveDialog,
  ResponsiveDialogTrigger,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
};

