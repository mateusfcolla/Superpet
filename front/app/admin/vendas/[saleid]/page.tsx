"use client";
import { toast } from "react-toastify";
import HistoryArrows from "../../components/HistoryArrows";
import SaleForm, { formConfigInterface } from "../SaleForm";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { ChangeEvent, useEffect, useState } from "react";
import fetchClients, { Client, ListClientResponse } from "../../fetchClients";
import { CreateSaleRequest, handleChangeType } from "../criar/page";
import NumberFormat from "react-number-format";

export interface EditSaleFormRequest {
  client_id: number;
  product: string;
  price: string;
  observation: string;
}
interface SaleDetails {
  id: number;
  client_id: number;
  client_name: string;
  product: string;
  price: string;
  observation: string;
}

export default function EditSale() {
  const pathname = usePathname();
  var urlParts = pathname.split("/");
  var currentId = urlParts.at(-1);
  const [currentSale, setCurrentSale] = useState<SaleDetails | null>(null);
  const [formData, setFormData] = useState<EditSaleFormRequest>({
    client_id: 0, // Update field names to match Go structure
    product: "",
    price: "",
    observation: "",
  });
  const [searchClient, setSearchClient] = useState("");
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [displayPrice, setDisplayPrice] = useState("0,00");
  const [listClientResponse, setListClientResponse] =
    useState<ListClientResponse>({
      total: 0,
      clients: [],
    });
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

  useEffect(() => {
    const fetchSaleDetails = async () => {
      try {
        const token = Cookies.get("access_token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/sales/${currentId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data: SaleDetails = await response.json();

          setCurrentSale(data);
        } else {
          console.error("Failed to fetch sales");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        //setLoading(false);
      }
    };

    fetchSaleDetails();
  }, [currentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = Cookies.get("access_token");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/sales/${currentId}`,
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
        toast.success("Venda editada com sucesso!");
        // Add further actions or redirection upon successful creation
      } else {
        toast.error("Houve um erro ao editar a venda!");
        console.error("Failed to edit sale");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  // Update the form data when sale details are fetched
  useEffect(() => {
    if (currentSale) {
      setFormData({
        client_id: currentSale.client_id,
        product: currentSale.product,
        price: currentSale.price,
        observation: currentSale.observation,
      });
      setSearchClient(
        `[ ${currentSale.id.toString().padStart(3, "0")} ] ${
          currentSale.client_name
        }`
      );
      setSearchResults([]);
      let newValue: string | number;
      newValue = parseFloat(currentSale.price).toFixed(2); // convert to float and fix 2 decimal places
      setDisplayPrice(newValue.replace(".", ","));
    }
  }, [currentSale]);

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

  const formConfig: formConfigInterface = {
    handleSubmit,
    searchClient,
    setSearchClient,
    searchResults,
    handleClientSelect,
    formData,
    setFormData,
    setSearchResults,
    handleChange,
    displayPrice,
    setDisplayPrice,
    handlePriceChange,
    submitButtonText: "Salvar",
  };
  return (
    <div className='wk-admin-page__wrapper'>
      <div className='container'>
        <div className='arrows-wrapper w-fit gap-2'>
          <HistoryArrows />
        </div>
        <div className='list-clients-header'>
          <h1 className='wk-admin-page__title'>Editar Venda</h1>
        </div>
        <SaleForm formConfig={formConfig} />
      </div>
    </div>
  );
  return;
}
