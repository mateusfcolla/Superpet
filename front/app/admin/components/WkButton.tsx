import React, { ReactNode, ButtonHTMLAttributes } from "react";

type WkButtonProps = {
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function WkButton({ children, ...args }: WkButtonProps) {
  return <button {...args}>{children}</button>;
}
