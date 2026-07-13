import React from 'react';

export const Footer = () => {
  return (
    React.createElement('footer', { className: "flex flex-col sm:flex-row items-center justify-between py-4 sm:py-0 sm:h-12 px-6 border-t bg-card text-[11px] text-muted-foreground gap-3"             ,}
      , React.createElement('div', null
        , React.createElement('span', null, "© " , new Date().getFullYear(), " WorkSphere Inc. All rights reserved."     )
      )
      , React.createElement('div', { className: "flex gap-4" ,}
        , React.createElement('a', { href: "#", className: "hover:underline",}, "Privacy Policy" )
        , React.createElement('a', { href: "#", className: "hover:underline",}, "Terms of Service"  )
        , React.createElement('a', { href: "#", className: "hover:underline",}, "Support")
      )
    )
  );
};

export default Footer;
