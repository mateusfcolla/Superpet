"use client";
import { useRouter } from "next/navigation";
import HistoryArrows from "../../components/HistoryArrows";
import ClientForm from "../ClientForm";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import React from "react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { formConfigInterface } from "../ClientForm";
import fetchClients, { Client, ListClientResponse } from "../../fetchClients";
import { EditClientFormRequest } from "../[clientid]/page";

export interface CreateClientRequest {
  full_name: string;
  phone_whatsapp: string;
  phone_line: string;
  pet_name: string;
  pet_breed: string;
  address_street: string;
  address_city: string;
  address_number: string;
  address_neighborhood: string;
  address_reference: string;
}

const handleChange = (
  e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  setFormData: (data: CreateClientRequest | EditClientFormRequest) => void,
  formData: CreateClientRequest | EditClientFormRequest
) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};

export default function CreateClient() {
  const router = useRouter();
  const [listClientResponse, setListClientResponse] =
    useState<ListClientResponse>({
      total: 0,
      clients: [],
    });
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState<CreateClientRequest>({
    full_name: "",
    phone_whatsapp: "",
    phone_line: "",
    pet_name: "",
    pet_breed: "",
    address_street: "",
    address_city: "",
    address_number: "",
    address_neighborhood: "",
    address_reference: "",
  });
  const [selectedClientName, setSelectedClientName] = React.useState("");
  const [displayPrice, setDisplayPrice] = useState("0,00");
  const [searchClient, setSearchClient] = useState("");
  const [searchResults, setSearchResults] = useState<Client[]>([]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const token = Cookies.get("access_token");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/clients`,
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

        router.push(`/admin/clientes/`); //${data.id}`);
        toast.success("Cliente criado com sucesso!");
      } else {
        console.error("Failed to create client");
        const data = await response.json();

        toast.error("Houve um erro ao criar o cliente!");
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
    submitButtonText: "Criar Cliente",
  };

  return (
    <div className='wk-admin-page__wrapper'>
      <div className='container'>
        <div className='arrows-wrapper w-fit gap-2'>
          <HistoryArrows />
        </div>
        <div className='list-clients-header'>
          <h1 className='wk-admin-page__title'>Novo Cliente</h1>
        </div>
        <ClientForm formConfig={formConfig} />
      </div>
    </div>
  );
}
