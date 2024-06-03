"use client";
import Link from "next/link";
import ListSales from "./ListSales";
import { CheckedItemsContext } from "./CheckedItemsContext";
import { useState } from "react";
import HistoryArrows from "../components/HistoryArrows";
import WkButton from "../components/WkButton";
import PlusIcon from "../../../public/admin-plus.svg";

export default function Vendas() {
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  return (
    <>
      <div className='list-clients-header wk-admin-page-wrapper w-full my-7 font-Inter'>
        <div className='arrows-wrapper w-fit gap-2'>
          <HistoryArrows />
        </div>
        <div className='title-wrapper grid grid-cols-2 mt-7'>
          <h1 className='text-5xl font-semibold '>Vendas</h1>
          <div className='wk-btn__wrapper ml-auto gap-6 '>
            <Link
              className='wk-btn wk-btn--primary wk-btn--md'
              href={"/admin/vendas/criar"}>
              <PlusIcon />
              Nova Venda
            </Link>
          </div>
        </div>
      </div>
      <CheckedItemsContext.Provider value={{ checkedItems, setCheckedItems }}>
        <ListSales className='' />
      </CheckedItemsContext.Provider>
    </>
  );
}
