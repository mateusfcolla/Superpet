/* eslint-disable @next/next/no-img-element */
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import React, { ChangeEvent, use, useEffect, useState } from "react";
import Link from "next/link";
import SaveIcon from "../../../public/admin-save.svg";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import ImageIcon from "../../../public/admin-image.svg";
import { fetchImages, Image } from "../galeria/ImageList";
import { PagesConfig } from "../components/WkTable";
import SearchIcon from "../../../public/admin-search.svg";
import WkPagination from "../components/WkPagination";
import { editImageRequest } from "../galeria/SingleImageList";
import { usePathname } from "next/navigation";
import { get } from "http";
import { associatedImagesProps } from "./ProductForm";
import { getAssociatedSliderImages } from "@/app/components/SliderWidget";

interface ImageModalProps {
  getAssociatedImages?: ({
    currentId,
    setImages,
    setCheckedItems,
    setInitialCheckedItems,
  }: associatedImagesProps) => void;
  setImages?: (data: any[]) => void;
  getImages?: Image[];
  imageProps?: submitAssociatedImagesProps;
  isSlider?: boolean;
}

export interface submitAssociatedImagesProps {
  e?: React.FormEvent;
  images?: Image[];
  currentId?: string | undefined;
  checkedItems: number[];
  initialCheckedItems: number[];
  getAssociatedImages?: ({
    currentId,
    setImages,
    setCheckedItems,
    setInitialCheckedItems,
  }: associatedImagesProps) => void;
  setImages?: (data: any[]) => void;
  setCheckedItems?: (data: any[]) => void | ((data: any[]) => any[]);
  setInitialCheckedItems?: (data: any[]) => void;
}

interface submitSliderImagesProps {
  e: any;
  checkedItems: any[];
  initialCheckedItems: any[];
  getAssociatedSliderImages: (props: associatedImagesProps) => void;
  setImages?: (data: any[]) => void;
  setCheckedItems?: (data: any[]) => void | ((data: any[]) => any[]);
  setInitialCheckedItems?: (data: any[]) => void;
}

export const submitSliderImages = async ({
  e,
  checkedItems,
  initialCheckedItems,
  getAssociatedSliderImages,
  setImages,
  setCheckedItems,
  setInitialCheckedItems,
}: submitSliderImagesProps) => {
  e && e.stopPropagation();
  const token = Cookies.get("access_token");

  const imagesToAssociate = checkedItems
    .filter((id) => !initialCheckedItems.includes(id))
    .map((id) => ({ id, order: checkedItems.indexOf(id) }));
  const imagesToDisassociate = initialCheckedItems.filter(
    (id) => !checkedItems.includes(id)
  );

  if (imagesToAssociate.length > 0) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/slider_images`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ images: imagesToAssociate }),
        }
      );

      if (response.ok) {
        getAssociatedSliderImages({
          setImages,
          setCheckedItems,
          setInitialCheckedItems,
        } as any);
      } else {
        console.error("Failed to associate slider images");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  if (imagesToDisassociate.length > 0) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/slider_images/delete_by_image_id`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ image_ids: imagesToDisassociate }),
        }
      );

      if (response.ok) {
        getAssociatedSliderImages({
          setImages,
          setCheckedItems,
          setInitialCheckedItems,
        } as any);
      } else {
        console.error("Failed to disassociate slider images");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
};

export const submitAssociatedImages = async ({
  e,
  currentId,
  checkedItems,
  initialCheckedItems,
  getAssociatedImages,
  setImages,
  setCheckedItems,
  setInitialCheckedItems,
}: submitAssociatedImagesProps) => {
  //e.preventDefault();
  e && e.stopPropagation();
  const token = Cookies.get("access_token");

  if (!currentId || isNaN(Number(currentId))) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/images-multiple`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ids: checkedItems }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setImages && setImages(data);
      } else {
        toast.error("There was an error fetching the images!");
        console.error("Failed to fetch images");
      }
    } catch (error) {
      console.error("Error:", error);
    }
    return;
  }

  const imagesToAssociate = checkedItems
    .filter((id) => !initialCheckedItems.includes(id))
    .map((id) => ({ id, order: checkedItems.indexOf(id) }));
  const imagesToDisassociate = initialCheckedItems.filter(
    (id) => !checkedItems.includes(id)
  );

  if (imagesToAssociate.length > 0) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/link_images/multiple/${currentId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ images: imagesToAssociate }),
        }
      );

      if (response.ok) {
        //toast.success("Imagem editada com sucesso!");
        const data = await response.json();

        getAssociatedImages &&
          getAssociatedImages({
            currentId,
            setImages,
            setCheckedItems,
            setInitialCheckedItems,
          });
      } else {
        toast.error("Houve um erro ao editar associar as Imagens!");
        console.error("Failed to edit product");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  if (imagesToDisassociate.length > 0) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/link_images/multiple/${currentId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ image_ids: imagesToDisassociate }),
        }
      );

      if (response.ok) {
        getAssociatedImages &&
          getAssociatedImages({
            currentId,
            setImages,
            setCheckedItems,
            setInitialCheckedItems,
          });
      } else {
        toast.error("There was an error disassociating the images!");
        console.error("Failed to disassociate images");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
};

export default function ImageModal({
  getAssociatedImages,
  setImages,
  getImages,
  imageProps,
  isSlider,
}: ImageModalProps) {
  const pathname = usePathname();
  var urlParts = pathname.split("/");
  var currentId = urlParts.at(-1);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [imagesPerPage, setImagesPerPage] = useState<number>(18);
  const [listImageResponse, setListImageResponse] = useState<Image[]>([]);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
    null
  );
  const [dragging, setDragging] = React.useState(false);
  const [selectedImage, setSelectedImage] = useState({} as Image);
  const [formData, setFormData] = useState<editImageRequest>({
    name: "",
    description: "",
    alt: "",
  });
  //const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const dragEventsCounter = React.useRef(0);
  const token = Cookies.get("access_token");
  //const [initialCheckedItems, setInitialCheckedItems] = useState<number[]>([]);
  const setCheckedItems = imageProps?.setCheckedItems;
  const setInitialCheckedItems = imageProps?.setInitialCheckedItems;
  const checkedItems = imageProps?.checkedItems;
  const initialCheckedItems = imageProps?.initialCheckedItems;

  const handleCheck = (id: number, isChecked: boolean) => {
    let newCheckedItems = [...(checkedItems || [])]; // copy the current state

    if (isChecked) {
      newCheckedItems.push(id); // add the id
    } else {
      newCheckedItems = newCheckedItems.filter((itemId) => itemId !== id); // remove the id
    }

    setCheckedItems && setCheckedItems(newCheckedItems); // update the state
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDragEnd = () => {
    dragEventsCounter.current = 0;
    setDragging(false);
  };

  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    dragEventsCounter.current++;
    setDragging(dragEventsCounter.current > 0);

    // Add the dragend event listener to the document
    document.addEventListener("dragend", handleDragEnd);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    dragEventsCounter.current--;
    setDragging(dragEventsCounter.current > 0);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files) {
      uploadFiles(event.dataTransfer.files);
    }

    // Remove the dragend event listener from the document
    document.removeEventListener("dragend", handleDragEnd);
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleButtonClick = (event: React.MouseEvent) => {
    event.preventDefault();
    fileInputRef.current?.click();
  };

  const uploadFiles = async (files: FileList) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("file", file);
    });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/images`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("File upload failed");
      }
      fetchImages({
        pageId: currentPage,
        pageSize: imagesPerPage,
        sortField,
        sortDirection,
        setListImageResponse,
        setTotalItems,
        setLoading,
        search,
      });

      const data = await response.json();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      uploadFiles(files);
    }
  };

  const handleImageClick = (image: Image) => {
    setSelectedImage(image);
    setFormData({
      name: image.name,
      description: image.description,
      alt: image.alt,
    });
  };

  const pagesConfig: PagesConfig = {
    currentPage: {
      value: currentPage,
      setter: setCurrentPage,
    },
    itemsPerPage: imagesPerPage,
    setItemsPerPage: setImagesPerPage,
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(
        sortDirection === "asc"
          ? "desc"
          : sortDirection === "desc"
          ? null
          : "asc"
      );
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSubmit = async (
    e: React.FormEvent,
    id: number,
    formData: any
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const token = Cookies.get("access_token");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/images/${id}`,
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
        toast.success("Imagem editada com sucesso!");
        fetchImages({
          pageId: currentPage,
          pageSize: imagesPerPage,
          sortField,
          sortDirection,
          setListImageResponse,
          setTotalItems,
          setLoading,
          search,
        });
        // Add further actions or redirection upon successful creation
      } else {
        toast.error("Houve um erro ao editar a Imagem!");
        console.error("Failed to edit product");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  useEffect(() => {
    getAssociatedImages &&
      getAssociatedImages({
        currentId,
        setImages,
        setCheckedItems,
        setInitialCheckedItems,
      });
  }, []);

  useEffect(() => {
    fetchImages({
      pageId: currentPage,
      pageSize: imagesPerPage,
      sortField,
      sortDirection,
      setListImageResponse,
      setTotalItems,
      setLoading,
      search,
    });
  }, [currentPage, imagesPerPage, sortField, sortDirection, search]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  async function handleDelete(id: number): Promise<void> {
    const token = Cookies.get("access_token");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/images/${id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        fetchImages({
          pageId: currentPage,
          pageSize: imagesPerPage,
          sortField,
          sortDirection,
          setListImageResponse,
          setTotalItems,
          setLoading,
          search,
        });
        toast.success("Imagem deletado com sucesso!");
      } else {
        console.error("Failed to delete Image");

        toast.error("Houve um erro ao deletar a Imagem!");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
  const handleButtonFormClick = (event: React.MouseEvent) => {
    event.preventDefault();
    fileInputRef.current?.click();
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className='wk-btn wk-btn--secondary wk-btn--sm'>
          <ImageIcon />
          Adicionar Imagens
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={`wk-image-list__overlay `} />
        <Dialog.Content
          className={`wk-image-list__content wk-image-list__content--lg `}>
          <Dialog.Title className='wk-image-list__title'>
            Adicionar Imagens
          </Dialog.Title>

          <>
            <div
              className={`wk-image-list  ${dragging ? "dragging" : ""}`}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}>
              <div className='wk-image-list__header'>
                <div className='wk-image-list__header-filter'>
                  <div className='button-wrapper'>
                    <button
                      onClick={handleButtonFormClick}
                      className='wk-btn wk-btn--secondary wk-btn--sm'>
                      Selecionar arquivos
                    </button>
                  </div>
                </div>
                <div className='wk-table__search-bar--wrapper'>
                  <SearchIcon className='wk-table__search-bar--icon' />
                  <input
                    className='wk-table__search-bar'
                    type='text'
                    id='search'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={`Pesquisar...`}
                  />
                </div>
              </div>
              <div className='grid grid-cols-5'>
                <div className='wk-image-list__body grid grid-cols-6 col-span-4 !gap-4'>
                  {listImageResponse && listImageResponse.length > 0 ? (
                    listImageResponse.map((image) => (
                      <div
                        key={image.id}
                        className='wk-image-list__item relative'>
                        <img
                          src={`${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080${image.image_path}`}
                          alt={image.alt}
                          className={`wk-image-list__image ${
                            checkedItems &&
                            checkedItems.includes(image.id) &&
                            "checked"
                          }`}
                          draggable='false'
                          onClick={() => {
                            handleImageClick(image);
                            checkedItems &&
                              handleCheck(
                                image.id,
                                !checkedItems.includes(image.id)
                              );
                          }}
                        />
                        <input
                          type='checkbox'
                          checked={
                            checkedItems && checkedItems.includes(image.id)
                          }
                          id={`checkbox-${image.id}`}
                          onChange={(e) =>
                            handleCheck(image.id, e.target.checked)
                          }
                          className=''
                        />
                        <label
                          className={`wk-image-list__checkbox ${
                            checkedItems &&
                            checkedItems.includes(image.id) &&
                            "checked !opacity-100"
                          }`}
                          htmlFor={`checkbox-${image.id}`}>
                          <span></span>
                        </label>
                      </div>
                    ))
                  ) : (
                    <div className='text-xl'>Nenhuma Imagem encontrada</div>
                  )}
                </div>
                <div className='imageDetails py-7'>
                  {checkedItems && checkedItems.includes(selectedImage?.id) && (
                    <form
                      className='wk-form flex gap-7 flex-col'
                      onSubmit={(e) =>
                        handleSubmit(e, selectedImage.id, formData)
                      }>
                      <label>
                        <h4>Texto Alternativo</h4>
                        <input
                          type='text'
                          name='alt'
                          value={formData.alt}
                          onChange={handleChange}
                        />
                      </label>
                      <label>
                        <h4>Título</h4>
                        <input
                          type='text'
                          name='name'
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </label>
                      <label>
                        <h4>Descrição</h4>
                        <textarea
                          value={formData.description}
                          name='description'
                          onChange={handleChange}
                        />
                      </label>
                      <div className='flex text-lg gap-4'>
                        <a
                          href={`${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080${selectedImage.image_path}`}
                          download>
                          Baixar arquivo
                        </a>
                        <span className='opacity-50'>|</span>

                        <button
                          type='button'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(selectedImage.id);
                          }}
                          className='text-red-500'>
                          Excluir permanentemente
                        </button>
                      </div>

                      <Link
                        href={`/admin/galeria/${selectedImage.id}`}
                        className='wk-btn wk-btn--md wk-btn--secondary-outline'>
                        Ver mais
                      </Link>

                      <button
                        className='wk-btn wk-btn--md wk-btn--primary'
                        type='submit'>
                        <SaveIcon className='wk-icon !m-0' />
                        Salvar
                      </button>
                    </form>
                  )}
                </div>
              </div>

              <WkPagination
                totalNumberOfItems={totalItems}
                pages={pagesConfig}
                maxButtonsToShow={7}
                className='mt-10 pl-7'
              />
              <div className='wk-image-list__drag-box'>
                <input
                  type='file'
                  id='file'
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  style={{ display: "none" }}
                />

                <label
                  htmlFor='file'
                  className={`custom-file-upload`}
                  onDrop={handleDrop}>
                  Solte arquivos aqui para enviar ou
                  <button
                    onClick={handleButtonClick}
                    className='wk-btn wk-btn--secondary wk-btn--sm'>
                    Selecionar arquivos
                  </button>
                </label>
              </div>
            </div>
          </>

          <div className='wk-form__footer !sticky'>
            <Dialog.Close ref={closeRef} asChild>
              <button className='wk-btn wk-btn--md wk-btn--default'>
                Cancelar
              </button>
            </Dialog.Close>

            <Dialog.Close ref={closeRef} asChild>
              <button
                className='wk-btn wk-btn--md wk-btn--primary'
                type='submit'
                onClick={(e) => {
                  isSlider
                    ? submitSliderImages({
                        e,
                        checkedItems,
                        initialCheckedItems,
                        getAssociatedSliderImages,
                        setImages,
                        setCheckedItems,
                        setInitialCheckedItems,
                      } as any)
                    : submitAssociatedImages({
                        e,
                        currentId,
                        checkedItems,
                        initialCheckedItems,
                        getAssociatedImages,
                        setImages,
                        setCheckedItems,
                        setInitialCheckedItems,
                      } as any);
                }}>
                <SaveIcon className='wk-icon' />
                Selecionar Imagens
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Close ref={closeRef} asChild>
            <button className='wk-image-list__btn' aria-label='Close'>
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
