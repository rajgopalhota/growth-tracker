'use client';

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
  BarChart3,
  Bell,
  MessageCircle,
  Calendar,
  Archive,
  Star,
  Zap
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Notes', href: '/dashboard/notes', icon: FileText },
  { name: 'Todos', href: '/dashboard/todos', icon: CheckSquare },
  { name: 'Goals', href: '/dashboard/goals', icon: Target },
  { name: 'Teams', href: '/dashboard/teams', icon: Users },
  { name: 'Resources', href: '/dashboard/resources', icon: LinkIcon },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 lg:w-72 bg-black/20 backdrop-blur-xl border-r border-white/10 z-30">
      <div className="h-full overflow-y-auto custom-scroll">
        <nav className="p-6 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
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
    </aside>
  );
}
