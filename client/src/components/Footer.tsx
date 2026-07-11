import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="flex flex-col sm:flex-row items-center justify-between py-4 sm:py-0 sm:h-12 px-6 border-t bg-card text-[11px] text-muted-foreground gap-3">
      <div>
        <span>© {new Date().getFullYear()} WorkSphere Inc. All rights reserved.</span>
      </div>
      <div className="flex gap-4">
        <a href="#" className="hover:underline">Privacy Policy</a>
        <a href="#" className="hover:underline">Terms of Service</a>
        <a href="#" className="hover:underline">Support</a>
      </div>
    </footer>
  );
};

export default Footer;
