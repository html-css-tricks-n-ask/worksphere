import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from './input';








export const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search...',
  className,
}) => {
  const [localValue, setLocalValue] = React.useState(value);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced input change
  React.useEffect(() => {
    const handler = setTimeout(() => {
      onChange(localValue);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [localValue, onChange]);

  return (
    React.createElement('div', { className: `relative flex items-center ${className || ''}`,}
      , React.createElement(Input, {
        value: localValue,
        onChange: (e) => setLocalValue(e.target.value),
        placeholder: placeholder,
        className: "pl-9 pr-8 w-full max-w-sm text-xs"    ,}
      )
      , React.createElement(Search, { className: "absolute left-3 top-3.5 h-4 w-4 text-muted-foreground"     ,} )
      , localValue && (
        React.createElement('button', {
          onClick: () => setLocalValue(''),
          className: "absolute right-3 top-3.5 rounded-full p-0.5 text-muted-foreground hover:bg-muted transition-colors"       ,}

          , React.createElement(X, { className: "h-3.5 w-3.5" ,} )
        )
      )
    )
  );
};

export default SearchBar;
