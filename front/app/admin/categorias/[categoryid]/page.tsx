"use client";
import { toast } from "react-toastify";
import HistoryArrows from "../../components/HistoryArrows";
import CategoryForm, { formConfigInterface } from "../CategoryForm";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { ChangeEvent, useEffect, useState } from "react";
import { CreateCategoryRequest, handleChangeType } from "../criar/page";
import NumberFormat from "react-number-format";

export interface EditCategoryFormRequest {
  name: string;
  description: string;
}
export interface CategoryDetails {
  id: number;
  name: string;
  description: string;
}

export default function EditCategory() {
  const pathname = usePathname();
  var urlParts = pathname.split("/");
  var currentId = urlParts.at(-1);
  const [currentCategory, setCurrentCategory] = useState<CategoryDetails | null>(
    null
  );
  const [formData, setFormData] = useState<EditCategoryFormRequest>({
    name: "",
    description: "",
  });

  useEffect(() => {
    const fetchCategoryDetails = async () => {
      try {
        const token = Cookies.get("access_token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/categories/${currentId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data:CategoryDetails = await response.json();

          setCurrentCategory(data);
        } else {
          console.error("Failed to fetch categories");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        //setLoading(false);
      }
    };

    fetchCategoryDetails();
  }, [currentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = Cookies.get("access_token");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/categories/${currentId}`,
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
        toast.success("Categoria editada com sucesso!");
        // Add further actions or redirection upon successful creation
      } else {
        toast.error("Houve um erro ao editar a categoria!");
        console.error("Failed to edit category");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  // Update the form data when categoryt details are fetched
  useEffect(() => {
    if (currentCategory) {
      setFormData({
        name: currentCategory.name,
        description: currentCategory.description,
      });
    }
  }, [currentCategory]);

const handleChange: handleChangeType = (
    e,
    setFormData,
    formData
) => {
    const { name, value } = e.target;

    setFormData({
        ...formData,
        [name]: value,
    });
};

  const formConfig: formConfigInterface = {
    handleSubmit,
    formData,
    setFormData,
    handleChange,
    submitButtonText: "Salvar",
  };
  return (
    <div className='wk-admin-page__wrapper'>
      <div className='container'>
        <div className='arrows-wrapper w-fit gap-2'>
          <HistoryArrows />
        </div>
        <div className='list-clients-header'>
          <h1 className='wk-admin-page__title'>Editar Categoria</h1>
        </div>
        <CategoryForm formConfig={formConfig} />
      </div>
    </div>
  );
  return;
}
