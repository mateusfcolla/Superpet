"use client";
import { usePathname, useRouter } from "next/navigation";
import HistoryArrows from "../../components/HistoryArrows";
import ClientForm from "../ClientForm";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import React from "react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { formConfigInterface } from "../ClientForm";
import fetchClients, { Client, ListClientResponse } from "../../fetchClients";
import { CreateClientRequest } from "../criar/page";

export interface EditClientFormRequest {
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

interface ClientDetails extends EditClientFormRequest {}

export default function EditClient() {
  const router = useRouter();
  const pathname = usePathname();
  var urlParts = pathname.split("/");
  var currentId = urlParts.at(-1);
  const [currentClient, setCurrentClient] = useState<ClientDetails | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState<EditClientFormRequest>({
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

  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        const token = Cookies.get("access_token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/clients/${currentId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data: ClientDetails = await response.json();

          setCurrentClient(data);
        } else {
          console.error("Failed to fetch clients");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        //setLoading(false);
      }
    };

    fetchClientDetails();
  }, [currentId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const token = Cookies.get("access_token");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/clients/${currentId}`,
        {
          method: "PUT",
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

  useEffect(() => {
    if (currentClient) {
      setFormData({
        full_name: currentClient.full_name,
        phone_whatsapp: currentClient.phone_whatsapp,
        phone_line: currentClient.phone_line,
        pet_name: currentClient.pet_name,
        pet_breed: currentClient.pet_breed,
        address_street: currentClient.address_street,
        address_city: currentClient.address_city,
        address_number: currentClient.address_number,
        address_neighborhood: currentClient.address_neighborhood,
        address_reference: currentClient.address_reference,
      });
    }
  }, [currentClient]);

  const formConfig: formConfigInterface = {
    handleSubmit,
    setFormData,
    formData,
    handleChange,
    submitButtonText: "Editar Cliente",
  };

  return (
    <div className='wk-admin-page__wrapper'>
      <div className='container'>
        <div className='arrows-wrapper w-fit gap-2'>
          <HistoryArrows />
        </div>
        <div className='list-clients-header'>
          <h1 className='wk-admin-page__title'>Editar Cliente</h1>
        </div>
        <ClientForm formConfig={formConfig} />
      </div>
    </div>
  );
}
