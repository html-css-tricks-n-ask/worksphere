import React, { useState } from 'react';
import { Menu, Sun, Moon, Bell, User, LogOut, Bot, Search } from 'lucide-react';
import { useTheme } from '../providers/ThemeProvider.js';
import { Button } from './ui/button.js';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../redux/store.js';
import { logout } from '../redux/slices/authSlice.js';
import NotificationDrawer from './NotificationDrawer.js';
import AIChatDrawer from './AIChatDrawer.js';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { theme, setTheme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const [notiOpen, setNotiOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <>
      <header className="flex items-center justify-between h-16 px-6 border-b bg-card">
        <div className="flex items-center gap-4 flex-1">
          {/* Toggle mobile sidebar */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onToggleSidebar}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          {/* Global Search Input */}
          <div className="relative w-64 max-w-sm hidden sm:block">
            <input
              type="text"
              placeholder="Global Search (Press '/' to focus)"
              className="w-full h-9 pl-9 pr-4 rounded-lg border border-border bg-muted/40 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all"
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* AI HR Assistant Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setAiOpen(true)}
            title="AI HR Assistant Chat"
            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-500/10"
          >
            <Bot className="h-5 w-5 animate-pulse" />
          </Button>

          {/* Dark Mode Switcher */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle color theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-500 animate-spin-slow" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Notifications Bell */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setNotiOpen(true)}
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-destructive animate-ping" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-destructive" />
            <span className="sr-only">Notifications</span>
          </Button>

          {/* Action icons stub */}
          <div className="h-6 w-px bg-border mx-1" />

          {/* Profile menu action */}
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/profile')}>
            <User className="h-4 w-4" />
            <span className="hidden sm:inline text-xs font-medium">
              {user ? `${user.firstName}` : 'Profile'}
            </span>
          </Button>

          {/* Logout action */}
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Log Out">
            <LogOut className="h-4 w-4 text-muted-foreground hover:text-destructive" />
            <span className="sr-only">Log Out</span>
          </Button>
        </div>
      </header>

      {/* Drawers */}
      <NotificationDrawer isOpen={notiOpen} onClose={() => setNotiOpen(false)} />
      <AIChatDrawer isOpen={aiOpen} onClose={() => setAiOpen(false)} />
    </>
  );
};

export default Navbar;
