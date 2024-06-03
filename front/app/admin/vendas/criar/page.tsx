"use client";
import { useRouter } from "next/navigation";
import HistoryArrows from "../../components/HistoryArrows";
import SaleForm from "../SaleForm";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import React from "react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { formConfigInterface } from "../SaleForm";
import fetchClients, { Client, ListClientResponse } from "../../fetchClients";
import { EditSaleFormRequest } from "../[saleid]/page";

export interface CreateSaleRequest {
  client_id: number;
  product: string;
  price: string;
  observation: string;
}

// Add a new function to handle when a client is selected from the search results
const handleClientSelect = (
  client: Client,
  formData: CreateSaleRequest,
  setFormData: (data: CreateSaleRequest | EditSaleFormRequest) => void,
  setSearchClient: (data: string) => void,
  setSearchResults: (data: Client[]) => void
) => {
  setFormData({
    ...formData,
    client_id: client.id,
  });
  setSearchClient(
    `[ ${client.id.toString().padStart(3, "0")} ] ${client.full_name}`
  );
  setSearchResults([]); // clear the search results
};

export type handleChangeType = (
  e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  setDisplayPrice: (data: string) => void,
  setFormData: (data: CreateSaleRequest | EditSaleFormRequest) => void,
  formData: CreateSaleRequest | EditSaleFormRequest
) => void;

const handleChange: handleChangeType = (
  e,
  setDisplayPrice,
  setFormData,
  formData
) => {
  const { name, value } = e.target;

  let newValue: string | number;

  if (name === "client_id") {
    newValue = value !== "" ? +value : 0;
  } else if (name === "price") {
    newValue = value.replace(/\D/g, ""); // remove non-digits
    newValue = (parseInt(newValue) / 100).toFixed(2); // divide by 100 and fix 2 decimal places
    setDisplayPrice(newValue.replace(".", ",")); // replace dot with comma
    newValue = parseFloat(newValue); // convert back to number
  } else {
    newValue = value;
  }

  setFormData({
    ...formData,
    [name]: newValue,
  });
};
const handlePriceChange = (
  value: string,
  setDisplayPrice: (data: string) => void,
  setFormData: (data: CreateSaleRequest | EditSaleFormRequest) => void,
  formData: CreateSaleRequest | EditSaleFormRequest
) => {
  let newValue: string | number;

  newValue = value.replace(/\D/g, ""); // remove non-digits
  newValue = (parseInt(newValue) / 100).toFixed(2); // divide by 100 and fix 2 decimal places
  setDisplayPrice(newValue.replace(".", ",")); // replace dot with comma
  //newValue = parseFloat(newValue); // convert back to number

  setFormData({
    ...formData,
    price: newValue,
  });
};

export default function CreateSale() {
  const router = useRouter();
  const [listClientResponse, setListClientResponse] =
    useState<ListClientResponse>({
      total: 0,
      clients: [],
    });
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState<CreateSaleRequest>({
    client_id: 0,
    product: "",
    price: "",
    observation: "",
  });
  const [selectedClientName, setSelectedClientName] = React.useState("");
  const [displayPrice, setDisplayPrice] = useState("0,00");
  const [searchClient, setSearchClient] = useState("");
  const [searchResults, setSearchResults] = useState<Client[]>([]);

  useEffect(() => {
    if (searchClient) {
      fetchClients(
        1,
        10,
        null,
        null,
        setListClientResponse,
        setSearchResults,
        searchClient
      );
    } else {
      setSearchResults([]); // clear the search results if the input is empty
    }
  }, [searchClient]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const token = Cookies.get("access_token");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/sales`,
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

        router.push(`/admin/vendas/`); //${data.id}`);
        toast.success("Venda criada com sucesso!");
      } else {
        console.error("Failed to create sale");
        const data = await response.json();

        toast.error("Houve um erro ao criar a venda!");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const formConfig: formConfigInterface = {
    handleSubmit,
    searchClient,
    setSearchClient,
    searchResults,
    handleClientSelect,
    setFormData,
    formData,
    setSearchResults,
    setDisplayPrice,
    handleChange,
    displayPrice,
    handlePriceChange,
    submitButtonText: "Criar Venda",
  };
  return (
    <div className='wk-admin-page__wrapper'>
      <div className='container'>
        <div className='arrows-wrapper w-fit gap-2'>
          <HistoryArrows />
        </div>
        <div className='list-clients-header'>
          <h1 className='wk-admin-page__title'>Nova Venda</h1>
        </div>
        <SaleForm formConfig={formConfig} />
      </div>
    </div>
  );
  return;
}
