'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, 
  FileText, 
  CheckSquare, 
  Target, 
  Users, 
  Link as LinkIcon,
  Settings,
  BarChart3
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Notes', href: '/dashboard/notes', icon: FileText },
  { name: 'Todos', href: '/dashboard/todos', icon: CheckSquare },
  { name: 'Goals', href: '/dashboard/goals', icon: Target },
  { name: 'Connections', href: '/dashboard/connections', icon: Users },
  { name: 'Resources', href: '/dashboard/resources', icon: LinkIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function CustomDrawer({ isOpen, onClose }) {
  const pathname = usePathname();

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          show={isOpen}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full pr-10">
              <Transition.Child
                as={Fragment}
                show={isOpen}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto relative w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl py-6 shadow-xl">
                    <div className="px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-white">
                          GrowthTracker
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="rounded-md bg-white/10 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                            onClick={onClose}
                          >
                            <span className="sr-only">Close panel</span>
                            <X className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="relative mt-6 flex-1 px-4 sm:px-6">
                      <nav className="space-y-2">
                        {navigation.map((item) => {
                          const isActive = pathname === item.href;
                          const Icon = item.icon;
                          
                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              onClick={onClose}
                              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
                                isActive
                                  ? 'bg-gradient-to-r from-orange-500/20 to-red-500/10 border border-orange-500/30 text-orange-300'
                                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              <Icon className={`w-5 h-5 transition-colors ${
                                isActive ? 'text-orange-400' : 'text-gray-400 group-hover:text-white'
                              }`} />
                              <span className="font-medium">{item.name}</span>
                            </Link>
                          );
                        })}
                      </nav>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
