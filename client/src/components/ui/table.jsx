import * as React from "react";
import { cn } from "../../utils/cn";

const Table = React.forwardRef(
  ({ className, ...props }, ref) => (
    React.createElement('div', { className: "relative w-full overflow-auto custom-scrollbar border rounded-lg"     ,}
      , React.createElement('table', {
        ref: ref,
        className: cn("w-full caption-bottom text-sm", className),
        ...props,}
      )
    )
  )
);
Table.displayName = "Table";

const TableHeader = React.forwardRef(
  ({ className, ...props }, ref) => (
    React.createElement('thead', { ref: ref, className: cn("[&_tr]:border-b bg-muted/40", className), ...props,} )
  )
);
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef(
  ({ className, ...props }, ref) => (
    React.createElement('tbody', {
      ref: ref,
      className: cn("[&_tr:last-child]:border-0", className),
      ...props,}
    )
  )
);
TableBody.displayName = "TableBody";

const TableRow = React.forwardRef(
  ({ className, ...props }, ref) => (
    React.createElement('tr', {
      ref: ref,
      className: cn(
        "border-b transition-colors hover:bg-muted/30 data-[state=selected]:bg-muted",
        className
      ),
      ...props,}
    )
  )
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef(
  ({ className, ...props }, ref) => (
    React.createElement('th', {
      ref: ref,
      className: cn(
        "h-10 px-4 text-left align-middle font-semibold text-muted-foreground [&:has([role=checkbox])]:pr-0",
        className
      ),
      ...props,}
    )
  )
);
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef(
  ({ className, ...props }, ref) => (
    React.createElement('td', {
      ref: ref,
      className: cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className),
      ...props,}
    )
  )
);
TableCell.displayName = "TableCell";

export { Table, TableHeader, TableBody, TableHead, TableRow, TableCell };
export default Table;
