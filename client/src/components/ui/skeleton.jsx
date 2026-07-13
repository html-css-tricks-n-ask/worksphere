import * as React from "react";
import { cn } from "../../utils/cn";

function Skeleton({
  className,
  ...props
}) {
  return (
    React.createElement('div', {
      className: cn("animate-pulse rounded-md bg-muted/60", className),
      ...props,}
    )
  );
}

export { Skeleton };
export default Skeleton;
