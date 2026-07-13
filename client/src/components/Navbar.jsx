import React, { useState } from 'react';
import { Menu, Sun, Moon, Bell, User, LogOut, Bot, Search } from 'lucide-react';
import { useTheme } from '../providers/ThemeProvider';
import { Button } from './ui/button';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { logout } from '../redux/slices/authSlice';
import NotificationDrawer from './NotificationDrawer';
import AIChatDrawer from './AIChatDrawer';





export const Navbar = ({ onToggleSidebar }) => {
  const { theme, setTheme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [notiOpen, setNotiOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    React.createElement(React.Fragment, null
      , React.createElement('header', { className: "flex items-center justify-between h-16 px-6 border-b bg-card"      ,}
        , React.createElement('div', { className: "flex items-center gap-4 flex-1"   ,}
          /* Toggle mobile sidebar */
          , React.createElement(Button, {
            variant: "ghost",
            size: "icon",
            className: "lg:hidden",
            onClick: onToggleSidebar,}

            , React.createElement(Menu, { className: "h-5 w-5" ,} )
            , React.createElement('span', { className: "sr-only",}, "Toggle menu" )
          )

          /* Global Search Input */
          , React.createElement('div', { className: "relative w-64 max-w-sm hidden sm:block"    ,}
            , React.createElement('input', {
              type: "text",
              placeholder: "Global Search (Press '/' to focus)"     ,
              className: "w-full h-9 pl-9 pr-4 rounded-lg border border-border bg-muted/40 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all"            ,}
            )
            , React.createElement(Search, { className: "absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground"     ,} )
          )
        )

        , React.createElement('div', { className: "flex items-center gap-3"  ,}
          /* AI HR Assistant Toggle */
          , React.createElement(Button, {
            variant: "ghost",
            size: "icon",
            onClick: () => setAiOpen(true),
            title: "AI HR Assistant Chat"   ,
            className: "text-indigo-600 hover:text-indigo-700 hover:bg-indigo-500/10"  ,}

            , React.createElement(Bot, { className: "h-5 w-5 animate-pulse"  ,} )
          )

          /* Dark Mode Switcher */
          , React.createElement(Button, {
            variant: "ghost",
            size: "icon",
            onClick: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
            title: "Toggle color theme"  ,}

            , theme === 'dark' ? (
              React.createElement(Sun, { className: "h-4 w-4 text-amber-500 animate-spin-slow"   ,} )
            ) : (
              React.createElement(Moon, { className: "h-4 w-4 text-indigo-600"  ,} )
            )
            , React.createElement('span', { className: "sr-only",}, "Toggle theme" )
          )

          /* Notifications Bell */
          , React.createElement(Button, {
            variant: "ghost",
            size: "icon",
            className: "relative",
            onClick: () => setNotiOpen(true),}

            , React.createElement(Bell, { className: "h-4 w-4" ,} )
            , React.createElement('span', { className: "absolute top-2 right-2 w-2 h-2 rounded-full bg-destructive animate-ping"       ,} )
            , React.createElement('span', { className: "absolute top-2 right-2 w-2 h-2 rounded-full bg-destructive"      ,} )
            , React.createElement('span', { className: "sr-only",}, "Notifications")
          )

          /* Action icons stub */
          , React.createElement('div', { className: "h-6 w-px bg-border mx-1"   ,} )

          /* Profile menu action */
          , React.createElement(Button, { variant: "ghost", size: "sm", className: "gap-2", onClick: () => navigate('/profile'),}
            , React.createElement(User, { className: "h-4 w-4" ,} )
            , React.createElement('span', { className: "hidden sm:inline text-xs font-medium"   ,}
              , user ? `${user.firstName}` : 'Profile'
            )
          )

          /* Logout action */
          , React.createElement(Button, { variant: "ghost", size: "icon", onClick: handleLogout, title: "Log Out" ,}
            , React.createElement(LogOut, { className: "h-4 w-4 text-muted-foreground hover:text-destructive"   ,} )
            , React.createElement('span', { className: "sr-only",}, "Log Out" )
          )
        )
      )

      /* Drawers */
      , React.createElement(NotificationDrawer, { isOpen: notiOpen, onClose: () => setNotiOpen(false),} )
      , React.createElement(AIChatDrawer, { isOpen: aiOpen, onClose: () => setAiOpen(false),} )
    )
  );
};

export default Navbar;
