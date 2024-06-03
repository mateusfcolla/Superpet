"use client";
import { toast } from "react-toastify";
import HistoryArrows from "../../components/HistoryArrows";
import ProductForm, { formConfigInterface } from "../ProductForm";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { ChangeEvent, useEffect, useState } from "react";
import { CreateProductRequest, handleChangeType } from "../criar/page";
import NumberFormat from "react-number-format";
import {
  submitAssociatedImages,
  submitAssociatedImagesProps,
} from "../ImageModal";
import { CategoryBoxProps, submitAssociatedCategories } from "../CategoryBox";
import { Image } from "../../galeria/ImageList";

export interface EditProductFormRequest {
  name: string;
  description: string;
  price: string;
  old_price: string;
  user_id: number;
  sku: string;
}
export interface ProductDetails {
  id: number;
  name: string;
  description: string;
  price: string;
  old_price: string;
  user_id: number;
  sku: string;
}

export default function EditProduct() {
  const pathname = usePathname();
  var urlParts = pathname.split("/");
  var currentId = urlParts.at(-1);
  const [currentProduct, setCurrentProduct] = useState<ProductDetails | null>(
    null
  );
  const [formData, setFormData] = useState<EditProductFormRequest>({
    name: "",
    description: "",
    price: "",
    old_price: "",
    user_id: 0,
    sku: "",
  });
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [initialCheckedItems, setInitialCheckedItems] = useState<number[]>([]);
  const [images, setImages] = useState<Image[]>([]);

  const [checkedCategories, setCheckedCategories] = useState<number[]>([]);
  const [initialCheckedCategories, setInitialCheckedCategories] = useState<
    number[]
  >([]);
  const [displayPrice, setDisplayPrice] = useState("0,00");
  const [displayOldPrice, setDisplayOldPrice] = useState("0,00");
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

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const token = Cookies.get("access_token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/products/${currentId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data: ProductDetails = await response.json();

          setCurrentProduct({
            id: data.id,
            name: data.name,
            description: data.description,
            price: data.price.toString(),
            old_price: data.old_price.toString(),
            user_id: data.user_id,
            sku: data.sku,
          });
        } else {
          console.error("Failed to fetch products");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        //setLoading(false);
      }
    };

    fetchProductDetails();
  }, [currentId]);

  const token = Cookies.get("access_token");

  const updateImageOrder = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/images/by_product/${currentId}`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ images: images }),
      }
    );

    if (!response.ok) {
      console.error("Failed to update image order");
    }
  };

  const fetchAssociatedCategories = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/categories/by_product/${currentId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const ids = data.map((item: any) => item.id);
        setCheckedCategories(ids);
        setInitialCheckedCategories(ids);
      } else {
        console.error("Failed to fetch associated categories");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchAssociatedCategories();
  }, [currentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/products/${currentId}`,
        {
          method: "PUT",
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
        toast.success("Produto editado com sucesso!");
        // Add further actions or redirection upon successful creation

        await updateImageOrder();

        submitAssociatedImages({
          currentId,
          checkedItems,
          initialCheckedItems,
          setImages,
          setCheckedItems,
          setInitialCheckedItems,
        });
        let currentIdNumber = currentId && parseInt(currentId);
        currentIdNumber &&
          submitAssociatedCategories(
            currentIdNumber,
            checkedCategories,
            initialCheckedCategories
          );
      } else {
        toast.error("Houve um erro ao editar o produto!");
        console.error("Failed to edit product");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  // Update the form data when product details are fetched
  useEffect(() => {
    if (currentProduct) {
      setFormData({
        name: currentProduct.name,
        description: currentProduct.description,
        price: currentProduct.price,
        old_price: currentProduct.old_price,
        user_id: currentProduct.user_id,
        sku: currentProduct.sku,
      });
      let newValue: string | number;
      newValue = parseFloat(currentProduct.price).toFixed(2); // convert to float and fix 2 decimal places
      setDisplayPrice(newValue.replace(".", ","));

      let newValueOldPrice: string | number;
      newValueOldPrice = parseFloat(currentProduct.old_price).toFixed(2); // convert to float and fix 2 decimal places
      setDisplayOldPrice(newValueOldPrice.replace(".", ","));
    }
  }, [currentProduct]);

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

  const imageDetails: submitAssociatedImagesProps = {
    checkedItems: checkedItems,
    images: images,
    initialCheckedItems: initialCheckedItems,
    setImages: setImages,
    setCheckedItems: setCheckedItems,
    setInitialCheckedItems: setInitialCheckedItems,
  };

  const categoriesDetails: CategoryBoxProps = {
    checkedItems: checkedCategories,
    initialCheckedItems: initialCheckedCategories,
    setCheckedItems: setCheckedCategories,
    setInitialCheckedItems: setInitialCheckedCategories,
  };

  const formConfig: formConfigInterface = {
    handleSubmit,
    formData,
    setFormData,
    handleChange,
    displayPrice,
    setDisplayPrice,
    handlePriceChange,
    handleOldPriceChange,
    displayOldPrice,
    setDisplayOldPrice,
    submitButtonText: "Salvar",
    imagesDefinitions: imageDetails,
    categoriesDefinitions: categoriesDetails,
  };
  return (
    <div className='wk-admin-page__wrapper'>
      <div className='container'>
        <div className='arrows-wrapper w-fit gap-2'>
          <HistoryArrows />
        </div>
        <div className='list-clients-header'>
          <h1 className='wk-admin-page__title'>Editar Produto</h1>
        </div>
        <ProductForm formConfig={formConfig} />
      </div>
    </div>
  );
}
