'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Command, Upload, Home, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Shortcut {
  key: string;
  label: string;
  action: string;
  icon: typeof Upload;
  modifier: boolean;
}

const shortcuts: Shortcut[] = [
  {
    key: 'u',
    label: 'Upload',
    action: 'Go to upload page',
    icon: Upload,
    modifier: true,
  },
  {
    key: 'd',
    label: 'Dashboard',
    action: 'Go to dashboard',
    icon: FileText,
    modifier: true,
  },
  {
    key: 'h',
    label: 'Home',
    action: 'Go to homepage',
    icon: Home,
    modifier: false,
  },
  {
    key: '?',
    label: 'Help',
    action: 'Show this dialog',
    icon: Command,
    modifier: false,
  },
];

export default function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Only show on home page ("/")
  const isHomePage = pathname === '/';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Cmd/Ctrl key shortcuts
      if (e.metaKey || e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'u':
            e.preventDefault();
            router.push('/upload');
            break;
          case 'd':
            e.preventDefault();
            router.push('/dashboard');
            break;
        }
        return;
      }

      // Single key shortcuts (no modifier)
      switch (e.key) {
        case '?':
          e.preventDefault();
          setIsOpen(true);
          break;
        case 'Escape':
          setIsOpen(false);
          break;
        case 'h':
          e.preventDefault();
          router.push('/');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return (
    <>
      {/* Help Button - Bottom Right (Only on home page) */}
      {isHomePage && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full shadow-2xl shadow-orange-500/50 flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
          aria-label="Keyboard shortcuts"
        >
          <Command className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-10 right-0 bg-black/90 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Press ? for shortcuts
          </span>
        </button>
      )}

      {/* Shortcuts Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-orange-500/30 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Navigate Visura faster with these keyboard shortcuts
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-1">
            {shortcuts.map((shortcut) => {
              const Icon = shortcut.icon;
              return (
                <div
                  key={shortcut.key}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-800/50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                      <Icon className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{shortcut.label}</p>
                      <p className="text-xs text-gray-400">{shortcut.action}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {shortcut.modifier && (
                      <>
                        <kbd className="px-2 py-1 text-xs font-semibold text-gray-300 bg-gray-800 border border-gray-700 rounded">
                          Cmd
                        </kbd>
                        <span className="text-gray-600">+</span>
                      </>
                    )}
                    <kbd className="px-3 py-1 text-sm font-semibold text-gray-300 bg-gray-800 border border-gray-700 rounded min-w-[40px] text-center">
                      {shortcut.key.toUpperCase()}
                    </kbd>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-800">
            <p className="text-xs text-gray-500 text-center">
              <kbd className="px-2 py-0.5 bg-gray-800 border border-gray-700 rounded text-gray-400">ESC</kbd>
              {' '}to close this dialog
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

