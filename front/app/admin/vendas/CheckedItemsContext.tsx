import React, { Dispatch, SetStateAction } from "react";

interface CheckedItemsContextProps {
  checkedItems: number[];
  setCheckedItems: Dispatch<SetStateAction<number[]>>;
}

export const CheckedItemsContext =
  React.createContext<CheckedItemsContextProps>({
    checkedItems: [],
    setCheckedItems: () => {},
  });
