'use client';

import { useSession, signOut } from 'next-auth/react';
import { Bell, User, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import CustomDrawer from './CustomDrawer';

export default function Header() {
  const { data: session } = useSession();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left side - Logo and Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="lg:hidden p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">GT</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-white via-orange-200 to-white bg-clip-text text-transparent">
                  GrowthTracker
                </h1>
              </div>
            </div>
          </div>

          {/* Right side - Notifications and User */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors group">
              <Bell className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                3
              </span>
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-white">{session?.user?.name}</p>
                <p className="text-xs text-gray-400">{session?.user?.email}</p>
              </div>
              <button
                onClick={() => signOut()}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors group"
                title="Sign out"
              >
                <LogOut className="w-4 h-4 text-gray-300 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <CustomDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
}
