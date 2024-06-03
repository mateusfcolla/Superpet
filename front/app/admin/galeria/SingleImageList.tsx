import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import React from "react";
import { FetchImagesProps, Image, fetchImages } from "./ImageList";
import Link from "next/link";
import SaveIcon from "../../../public/admin-save.svg";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

interface SingleImageListProps {
  image: Image;
  fetchProps: FetchImagesProps;
}

export interface editImageRequest {
  name: string;
  description: string;
  alt: string;
}

export default function SingleImageList({
  image,
  fetchProps,
}: SingleImageListProps) {
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const [formData, setFormData] = React.useState<editImageRequest>({
    name: image.name,
    description: image.description,
    alt: image.alt,
  });

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = Cookies.get("access_token");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/images/${image.id}`,
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
        // Add further actions or redirection upon successful creation
      } else {
        toast.error("Houve um erro ao editar a Imagem!");
        console.error("Failed to edit product");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  async function handleDelete(): Promise<void> {
    const token = Cookies.get("access_token");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/images/${image.id}`,
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
        fetchImages(fetchProps);
        toast.success("Produto deletado com sucesso!");
      } else {
        console.error("Failed to delete product");

        toast.error("Houve um erro ao deletar o Produto!");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <div key={image.id} className='wk-image-list__item'>
          <img
            src={`${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080${image.image_path}`}
            alt={image.alt}
            className='wk-image-list__image'
          />
        </div>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={`wk-image-list__overlay `} />
        <Dialog.Content className={`wk-image-list__content `}>
          <Dialog.Title className='wk-image-list__title'>
            Detalhes do arquivo
          </Dialog.Title>

          <div className='grid grid-cols-3 gap-8'>
            <div>
              <img
                src={`${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080${image.image_path}`}
                alt={image.alt}
                className='wk-image-list__image wk-image-list__image--max-height'
              />
            </div>
            <div className='col-span-2'>
              <form
                className='wk-form flex gap-7 flex-col'
                onSubmit={handleSubmit}>
                <label>
                  <h4>Texto Alternativo</h4>
                  <input
                    type='text'
                    name='alt'
                    value={formData.alt}
                    onChange={(e) => handleChange(e)}
                  />
                </label>
                <label>
                  <h4>Título</h4>
                  <input
                    type='text'
                    name='name'
                    value={formData.name}
                    onChange={(e) => handleChange(e)}
                  />
                </label>
                <label>
                  <h4>Descrição</h4>
                  <textarea
                    value={formData.description}
                    name='description'
                    onChange={(e) => handleChange(e)}
                  />
                </label>
                <div className='flex text-lg gap-4'>
                  <a
                    href={`${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080${image.image_path}`}
                    download>
                    Baixar arquivo
                  </a>
                  <span className='opacity-50'>|</span>
                  <Dialog.Close ref={closeRef} asChild>
                    <button onClick={handleDelete} className='text-red-500'>
                      Excluir permanentemente
                    </button>
                  </Dialog.Close>
                </div>
                <div className='wk-form__footer'>
                  <Dialog.Close ref={closeRef} asChild>
                    <button className='wk-btn wk-btn--md wk-btn--default'>
                      Cancelar
                    </button>
                  </Dialog.Close>

                  <Link
                    href={`/admin/galeria/${image.id}`}
                    className='wk-btn wk-btn--md wk-btn--secondary-outline'>
                    Ver mais
                  </Link>

                  <button
                    className='wk-btn wk-btn--md wk-btn--primary'
                    type='submit'>
                    <SaveIcon className='wk-icon' />
                    Salvar
                  </button>
                </div>
              </form>
            </div>
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
