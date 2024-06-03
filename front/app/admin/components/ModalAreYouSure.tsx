"use client";
import React, { FormEvent, ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import "../../styles/components/main.scss";
import DeleteIcon from "../../../public/admin-delete.svg";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

interface deleteProps {
  deleteFunction?: (id: number) => void;
  deleteIndex?: number;
  isAssociated?: {
    isAssociated: boolean;
    message: string;
  };
  buttonText?: string;
  buttonStyle?: string;
  ButtonIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  deleteMultiple?: (ids: number[]) => Promise<void>;
  deleteMultipleIds?: number[];
}

export default function ModalAreYouSure({
  deleteFunction,
  deleteIndex,
  isAssociated,
  buttonText,
  buttonStyle,
  ButtonIcon,
  deleteMultiple,
  deleteMultipleIds,
}: deleteProps) {
  const [totalNumberOfAssociatedSales, setTotalNumberOfAssociatedSales] =
    React.useState<number>(0);
  const [itemsIdsArray, setItemsIdsArray] = React.useState<number[]>([]);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  async function handleNewId(e: FormEvent) {
    const token = Cookies.get("access_token");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/sales/by_client/${deleteIndex}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTotalNumberOfAssociatedSales(data.total);
        setItemsIdsArray(data.sales);
      } else {
        console.error("Failed to delete sale");

        toast.error("Houve um erro ao deletar a venda!");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async function handleDeleteMultiple(items: number[]): Promise<void> {
    const token = Cookies.get("access_token");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/sales/delete`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            IDs: items,
          }),
        }
      );

      if (response.ok) {
        toast.success("Vendas deletadas com sucesso!");
      } else {
        console.error("Failed to delete sales");

        toast.error("Houve um erro ao deletar as vendas!");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          onClick={(e) =>
            isAssociated && isAssociated.isAssociated && handleNewId(e)
          }
          className={`${buttonStyle}`}>
          {ButtonIcon ? <ButtonIcon /> : <DeleteIcon />}
          {buttonText ? buttonText : ""}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={`ModalAreYouSure__overlay `} />
        <Dialog.Content
          className={`ModalAreYouSure__content ${
            isAssociated &&
            isAssociated.isAssociated &&
            totalNumberOfAssociatedSales > 0
              ? "ModalAreYouSure__content--taller"
              : ""
          }`}>
          <Dialog.Title className='ModalAreYouSure__title'>
            Tem certeza que deseja deletar?
          </Dialog.Title>
          <Dialog.Description className='ModalAreYouSure__description'>
            {isAssociated?.isAssociated && totalNumberOfAssociatedSales > 0 && (
              <p className='ModalAreYouSure__description--isAssociated text-3xl'>
                Esse cliente possui {totalNumberOfAssociatedSales} venda(s)
                associadas, exclua-as antes de deletar o cliente.
              </p>
            )}
          </Dialog.Description>

          <div className='flex justify-evenly'>
            <Dialog.Close ref={closeRef} asChild>
              <button
                disabled={
                  isAssociated?.isAssociated && totalNumberOfAssociatedSales > 0
                }
                className='wk-btn wk-btn--sm wk-btn--error'
                onClick={(e) => {
                  deleteFunction && deleteIndex && deleteFunction(deleteIndex);
                  deleteMultiple &&
                    deleteMultipleIds &&
                    deleteMultiple(deleteMultipleIds);
                }}>
                <DeleteIcon className='fill-white [&_*]:fill-white' />
                Deletar
              </button>
            </Dialog.Close>
            {totalNumberOfAssociatedSales > 0 && (
              <button
                onClick={() => {
                  setTotalNumberOfAssociatedSales(0);
                  handleDeleteMultiple(itemsIdsArray);
                }}
                className='wk-btn wk-btn--sm wk-btn--error-outline'>
                Deletar Vendas Associadas
              </button>
            )}
            <Dialog.Close ref={closeRef} asChild>
              <button className='wk-btn wk-btn--blue wk-btn--sm text-2xl'>
                Cancelar
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Close ref={closeRef} asChild>
            <button className='ModalAreYouSure__btn' aria-label='Close'>
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
