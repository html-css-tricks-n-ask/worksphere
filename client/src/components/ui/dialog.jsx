import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";









export const Dialog = ({
  isOpen,
  onClose,
  title,
  children,
  className,
}) => {
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    React.createElement('div', { className: "fixed inset-0 z-50 flex items-center justify-center p-4"      ,}
      /* Overlay */
      , React.createElement('div', {
        className: "fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300"     ,
        onClick: onClose,}
      )

      /* Content */
      , React.createElement('div', {
        className: cn(
          "relative z-50 w-full max-w-lg rounded-xl border bg-card p-6 shadow-lg duration-200 animate-in fade-in-0 zoom-in-95",
          className
        ),}

        , React.createElement('div', { className: "flex items-center justify-between border-b pb-3"    ,}
          , title && React.createElement('h2', { className: "text-lg font-semibold tracking-tight"  ,}, title)
          , React.createElement('button', {
            onClick: onClose,
            className: "rounded-full p-1 text-muted-foreground hover:bg-muted transition-colors"    ,}

            , React.createElement(X, { className: "h-4 w-4" ,} )
            , React.createElement('span', { className: "sr-only",}, "Close")
          )
        )
        , React.createElement('div', { className: "mt-4",}, children)
      )
    )
  );
};

export default Dialog;
