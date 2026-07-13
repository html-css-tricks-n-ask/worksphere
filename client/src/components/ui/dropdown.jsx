import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/cn";












const Dropdown = React.forwardRef(
  ({ className, options, label, ...props }, ref) => {
    return (
      React.createElement('div', { className: "relative w-full" ,}
        , label && (
          React.createElement('label', { className: "block text-xs font-semibold text-muted-foreground mb-1"    ,}
            , label
          )
        )
        , React.createElement('div', { className: "relative",}
          , React.createElement('select', {
            ref: ref,
            className: cn(
              "w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 pr-10",
              className
            ),
            ...props,}

            , options.map((opt) => (
              React.createElement('option', { key: opt.value, value: opt.value,}
                , opt.label
              )
            ))
          )
          , React.createElement('div', { className: "pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"       ,}
            , React.createElement(ChevronDown, { className: "h-4 w-4" ,} )
          )
        )
      )
    );
  }
);
Dropdown.displayName = "Dropdown";

export { Dropdown };
export default Dropdown;
