import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return React.createElement(Navigate, { to: "/login", replace: true,} );
  }

  return (
    React.createElement('div', { className: "flex h-screen overflow-hidden bg-background"   ,}
      /* Sidebar Panel Navigation */
      , React.createElement(Sidebar, { isOpen: sidebarOpen, onClose: () => setSidebarOpen(false),} )

      /* Main Content Area */
      , React.createElement('div', { className: "flex flex-col flex-1 overflow-hidden"   ,}
        /* Top Header Navbar */
        , React.createElement(Navbar, { onToggleSidebar: () => setSidebarOpen(true),} )

        /* Scrollable page body */
        , React.createElement('main', { className: "flex-1 overflow-y-auto custom-scrollbar p-6 bg-muted/20"    ,}
          , React.createElement('div', { className: "max-w-7xl mx-auto space-y-6"  ,}
            , React.createElement(Outlet, null )
          )
        )

        /* Bottom Footer bar */
        , React.createElement(Footer, null )
      )
    )
  );
};

export default AppLayout;
