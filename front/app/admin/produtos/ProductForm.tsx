/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import NumberFormat from "react-number-format";
import { MdClear } from "react-icons/md";
import { Client } from "../fetchClients";
import { CreateProductRequest } from "./criar/page";
import { EditProductFormRequest } from "./[productid]/page";
import ImageModal, { submitAssociatedImagesProps } from "./ImageModal";
import Cookies from "js-cookie";
import { usePathname } from "next/navigation";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import CategoryBox, { CategoryBoxProps } from "./CategoryBox";
import { DropResult } from "react-beautiful-dnd";

export interface associatedImagesProps {
  currentId: string | undefined;
  setImages?: (data: any[]) => void;
  setCheckedItems?: (data: any[]) => void;
  setInitialCheckedItems?: (data: any[]) => void;
}

const getAssociatedImages = async ({
  currentId,
  setImages,
  setCheckedItems,
  setInitialCheckedItems,
}: associatedImagesProps) => {
  const token = Cookies.get("access_token");

  if (!currentId || isNaN(Number(currentId))) return;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/images/by_product/${currentId}`,
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
      //toast.success("Imagem editada com sucesso!");
      const data = await response.json();

      setImages && setImages(data);

      if (setCheckedItems && setInitialCheckedItems) {
        const ids = data.map((item: any) => item.id);
        setCheckedItems(ids);
        setInitialCheckedItems(ids);
      }
    } else {
      console.error("Failed to edit product");
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

export interface formConfigInterface {
  handleSubmit: (e: FormEvent) => void;
  setFormData: (data: CreateProductRequest) => void;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    setDisplayPrice: (data: string) => void,
    setDisplayOldPrice: (data: string) => void,
    setFormData: (data: CreateProductRequest | EditProductFormRequest) => void,
    formData: CreateProductRequest | EditProductFormRequest
  ) => void;
  formData: {
    name: string;
    description: string;
    price: string;
    old_price: string;
    sku: string;
    user_id: number;
  };
  displayPrice: string;
  setDisplayPrice: (data: string) => void;
  handlePriceChange: (
    value: string,
    setDisplayPrice: (data: string) => void,
    setFormData: (data: CreateProductRequest | EditProductFormRequest) => void,
    formData: CreateProductRequest | EditProductFormRequest
  ) => void;
  handleOldPriceChange: (
    value: string,
    setDisplayOldPrice: (data: string) => void,
    setFormData: (data: CreateProductRequest | EditProductFormRequest) => void,
    formData: CreateProductRequest | EditProductFormRequest
  ) => void;
  displayOldPrice: string;
  setDisplayOldPrice: (data: string) => void;
  submitButtonText: string;
  imagesDefinitions?: submitAssociatedImagesProps;
  categoriesDefinitions?: CategoryBoxProps;
}

export default function ProductForm({
  formConfig,
}: {
  formConfig: formConfigInterface;
}) {
  const [selectedResultIndex, setSelectedResultIndex] = useState<number | null>(
    null
  );
  //const [images, setImages] = useState<any[]>([]);
  const setImages = formConfig.imagesDefinitions?.setImages;
  const images = formConfig.imagesDefinitions?.images;

  const pathname = usePathname();
  const urlParts = pathname.split("/");
  const currentId = urlParts.at(-1);

  useEffect(() => {
    getAssociatedImages({ setImages, currentId });
  }, [setImages, currentId]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || !document.getElementById("images") || !images)
      return;

    const items = Array.from(images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the order property of the images
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setImages && setImages(updatedItems);
  };

  return (
    <div className='wk-form'>
      <div className='relative'>
        <div className='category-wrapper'>
          <h4 className=''>Categorias</h4>
          <CategoryBox {...formConfig.categoriesDefinitions} />
        </div>
      </div>

      <form className='' onSubmit={formConfig.handleSubmit}>
        <h2 className='wk-form__row-title'>Informações Básicas</h2>
        <div className='wk-form__row grid grid-cols-3 gap-9 gap-y'>
          <label>
            <h4 className=''>Nome</h4>
            <input
              type='text'
              name='name'
              value={formConfig.formData.name}
              required
              placeholder='Ex: Ração para cachorro'
              onChange={(e) =>
                formConfig.handleChange(
                  e,
                  formConfig.setDisplayPrice,
                  formConfig.setDisplayOldPrice,
                  formConfig.setFormData,
                  formConfig.formData
                )
              }
            />
          </label>

          <div className=''>
            <label>
              <h4 className=''>Preço</h4>
              <NumberFormat
                value={formConfig.displayPrice}
                onValueChange={(values: any) => {
                  formConfig.handlePriceChange(
                    values.value,
                    formConfig.setDisplayPrice,
                    formConfig.setFormData,
                    formConfig.formData
                  );
                }}
                required
                thousandSeparator='.'
                decimalSeparator=','
                prefix={"R$ "}
              />
            </label>
          </div>
        </div>
        <div className='wk-form__row grid grid-cols-3 gap-9 gap-y'>
          <div className=''>
            <label>
              <h4 className=''>Código (opcional)</h4>
              <input
                type='text'
                name='sku'
                value={formConfig.formData.sku}
                placeholder='Código Único ou SKU do produto'
                onChange={(e) =>
                  formConfig.handleChange(
                    e,
                    formConfig.setDisplayPrice,
                    formConfig.setDisplayOldPrice,
                    formConfig.setFormData,
                    formConfig.formData
                  )
                }
              />
            </label>
          </div>

          <div className=''>
            <label>
              <h4 className=''>Preço antigo (se em promoção)</h4>
              <NumberFormat
                value={formConfig.displayOldPrice}
                onValueChange={(values: any) => {
                  formConfig.handleOldPriceChange(
                    values.value,
                    formConfig.setDisplayOldPrice,
                    formConfig.setFormData,
                    formConfig.formData
                  );
                }}
                thousandSeparator='.'
                decimalSeparator=','
                prefix={"R$ "}
              />
            </label>
          </div>
        </div>

        <div className='wk-form__row grid grid-cols-3 gap-9 gap-y'>
          <div className='col-span-2'>
            <label>
              <h4 className=''>Descrição</h4>
              <textarea
                name='description'
                value={formConfig.formData.description}
                required
                onChange={(e) =>
                  formConfig.handleChange(
                    e,
                    formConfig.setDisplayPrice,
                    formConfig.setDisplayOldPrice,
                    formConfig.setFormData,
                    formConfig.formData
                  )
                }
              />
            </label>
          </div>
        </div>
        <div className='wk-form__row grid grid-cols-3 gap-9 gap-y'>
          <div className='col-span-2 gap-5'>
            <div className=' flex w-full justify-between'>
              <h2 className='wk-form__row-title'>Imagens</h2>
              <ImageModal
                getAssociatedImages={getAssociatedImages}
                setImages={setImages}
                getImages={images}
                imageProps={formConfig.imagesDefinitions}
              />
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId='images'>
                {(provided) => (
                  <div
                    id='images'
                    className='wk-image-box'
                    {...provided.droppableProps}
                    ref={provided.innerRef}>
                    {images &&
                      images
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map((image, index) => (
                          <Draggable
                            key={image.id}
                            draggableId={String(image.id)}
                            index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className='wk-image-list__item wk-image-list__item--box'
                                onClick={() => setSelectedResultIndex(index)}>
                                <img
                                  src={`${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080${image.image_path}`}
                                  alt={image.alt}
                                  draggable='false'
                                  className='wk-image-list__image'
                                />
                                <div className='wk-image-list__item-content-wrapper'>
                                  <div>
                                    <h4 className='image-title'>
                                      {image.name}
                                    </h4>
                                    <h4 className='image-file-name'>
                                      {image.image_path.split("/").pop()}
                                    </h4>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>

        <div className='wk-form__footer'>
          <button className='wk-btn wk-btn--md wk-btn--primary' type='submit'>
            {formConfig.submitButtonText || "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
