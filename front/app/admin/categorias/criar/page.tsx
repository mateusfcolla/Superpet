"use client";
import { useRouter } from "next/navigation";
import HistoryArrows from "../../components/HistoryArrows";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import React from "react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import fetchClients, { Client, ListClientResponse } from "../../fetchClients";
import { EditCategoryFormRequest } from "../[categoryid]/page";
import CategoryForm, { formConfigInterface } from "../CategoryForm";

export interface CreateCategoryRequest {
  name: string;
  description: string;
}

export type handleChangeType = (
  e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  setFormData: (data: CreateCategoryRequest | EditCategoryFormRequest) => void,
  formData: CreateCategoryRequest | EditCategoryFormRequest
) => void;

const handleChange: handleChangeType = (e, setFormData, formData) => {
  const { name, value } = e.target;

  setFormData({
    ...formData,
    [name]: value,
  });
};
const handlePriceChange = (
  value: string,
  setDisplayPrice: (data: string) => void,
  setFormData: (data: CreateCategoryRequest | EditCategoryFormRequest) => void,
  formData: CreateCategoryRequest | EditCategoryFormRequest
) => {
  let newValue: string | number;

  newValue = value.replace(/\D/g, ""); // remove non-digits
  newValue = (parseInt(newValue) / 100).toFixed(2); // divide by 100 and fix 2 decimal places
  setDisplayPrice(newValue.replace(".", ",")); // replace dot with comma
  //newValue = parseFloat(newValue); // convert back to number

  setFormData({
    ...formData,
  });
};

export default function CreateCategory() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState<CreateCategoryRequest>({
    name: "",
    description: "",
  });
  const [displayPrice, setDisplayPrice] = useState("0,00");
  const [searchResults, setSearchResults] = useState<Client[]>([]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const token = Cookies.get("access_token");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/categories`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        const data = await response.json();

        router.push(`/admin/categorias/`); //${data.id}`);
        toast.success("Categoria criada com sucesso!");
      } else {
        console.error("Failed to create category");
        const data = await response.json();

        toast.error("Houve um erro ao criar a categoria!");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const formConfig: formConfigInterface = {
    handleSubmit,
    setFormData,
    formData,
    handleChange,
    submitButtonText: "Criar Categoria",
  };
  return (
    <div className='wk-admin-page__wrapper'>
      <div className='container'>
        <div className='arrows-wrapper w-fit gap-2'>
          <HistoryArrows />
        </div>
        <div className='list-clients-header'>
          <h1 className='wk-admin-page__title'>Nova Categoria</h1>
        </div>
        <CategoryForm formConfig={formConfig} />
      </div>
    </div>
  );
  return;
}
