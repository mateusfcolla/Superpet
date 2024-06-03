"use client";
import { useRouter } from "next/navigation";
import HistoryArrows from "../../components/HistoryArrows";
//import ProductForm, { formConfigInterface } from "../ProductForm";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import React from "react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import fetchClients, { Client, ListClientResponse } from "../../fetchClients";
import { EditProductFormRequest } from "../[productid]/page";
import ProductForm, { formConfigInterface } from "../ProductForm";
import {
  submitAssociatedImages,
  submitAssociatedImagesProps,
} from "../ImageModal";
import { Category } from "../../categorias/ListCategories";
import { submitAssociatedCategories } from "../CategoryBox";

export interface CreateProductRequest {
  name: string;
  description: string;
  price: string;
  old_price: string;
  sku: string;
  user_id: number;
}

export type handleChangeType = (
  e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  setDisplayPrice: (data: string) => void,
  setDisplayOldPrice: (data: string) => void,
  setFormData: (data: CreateProductRequest | EditProductFormRequest) => void,
  formData: CreateProductRequest | EditProductFormRequest
) => void;

const handleChange: handleChangeType = (
  e,
  setDisplayPrice,
  setDisplayOldPrice,
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
  } else if (name === "old_price") {
    newValue = value.replace(/\D/g, ""); // remove non-digits
    newValue = (parseInt(newValue) / 100).toFixed(2); // divide by 100 and fix 2 decimal places
    setDisplayOldPrice(newValue.replace(".", ",")); // replace dot with comma
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
  setFormData: (data: CreateProductRequest | EditProductFormRequest) => void,
  formData: CreateProductRequest | EditProductFormRequest
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

const handleOldPriceChange = (
  value: string,
  setDisplayOldPrice: (data: string) => void,
  setFormData: (data: CreateProductRequest | EditProductFormRequest) => void,
  formData: CreateProductRequest | EditProductFormRequest
) => {
  let newValue: string | number;

  newValue = value.replace(/\D/g, ""); // remove non-digits
  newValue = (parseInt(newValue) / 100).toFixed(2); // divide by 100 and fix 2 decimal places
  setDisplayOldPrice(newValue.replace(".", ",")); // replace dot with comma
  //newValue = parseFloat(newValue); // convert back to number

  setFormData({
    ...formData,
    old_price: newValue,
  });
};

export default function CreateProduct() {
  const router = useRouter();
  const userId = parseInt(Cookies.get("user_id") as string);

  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState<CreateProductRequest>({
    name: "",
    description: "",
    price: "",
    old_price: "",
    sku: "",
    user_id: userId,
  });
  const [displayPrice, setDisplayPrice] = useState("0,00");
  const [displayOldPrice, setDisplayOldPrice] = useState("0,00");
  const [searchResults, setSearchResults] = useState<Client[]>([]);

  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [initialCheckedItems, setInitialCheckedItems] = useState<number[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [checkedCategories, setCheckedCategories] = useState<number[]>([]);
  const [initialCheckedCategories, setInitialCheckedCategories] = useState<
    number[]
  >([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const token = Cookies.get("access_token");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/products`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            categories: checkedCategories,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        const currentId = data.id;
        submitAssociatedImages({
          currentId,
          checkedItems,
          initialCheckedItems,
          setImages,
          setCheckedItems,
          setInitialCheckedItems,
        });
        submitAssociatedCategories(
          currentId,
          checkedCategories,
          initialCheckedCategories
        );
        router.push(`/admin/produtos/`); //${data.id}`);
        toast.success("Produto criado com sucesso!");
      } else {
        console.error("Failed to create product");
        const data = await response.json();

        toast.error("Houve um erro ao criar o produto!");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const imageDetails: submitAssociatedImagesProps = {
    checkedItems: checkedItems,
    images: images,
    initialCheckedItems: initialCheckedItems,
    setImages: setImages,
    setCheckedItems: setCheckedItems,
    setInitialCheckedItems: setInitialCheckedItems,
  };

  const categoryDetails = {
    setCheckedItems: setCheckedCategories,
    setInitialCheckedItems: setInitialCheckedCategories,
    checkedItems: checkedCategories,
    initialCheckedItems: initialCheckedCategories,
  };

  const formConfig: formConfigInterface = {
    handleSubmit,
    setFormData,
    formData,
    setDisplayPrice,
    handleChange,
    displayPrice,
    handlePriceChange,
    handleOldPriceChange,
    displayOldPrice,
    setDisplayOldPrice,
    submitButtonText: "Criar Produto",
    imagesDefinitions: imageDetails,
    categoriesDefinitions: categoryDetails,
  };
  return (
    <div className='wk-admin-page__wrapper'>
      <div className='container'>
        <div className='arrows-wrapper w-fit gap-2'>
          <HistoryArrows />
        </div>
        <div className='list-clients-header'>
          <h1 className='wk-admin-page__title'>Novo Produto</h1>
        </div>
        <ProductForm formConfig={formConfig} />
      </div>
    </div>
  );
  return;
}
