"use client";
import { usePathname, useRouter } from "next/navigation";
import HistoryArrows from "../../components/HistoryArrows";
import Cookies from "js-cookie";
import { Image } from "../ImageList";
import { ChangeEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import SaveIcon from "../../../../public/admin-save.svg";

interface EditImageFormRequest {
  alt: string;
  name: string;
  description: string;
}

export default function EditImage() {
  const router = useRouter();
  const pathname = usePathname();
  var urlParts = pathname.split("/");
  var currentId = urlParts.at(-1);
  const [currentImage, setCurrentImage] = useState<Image | null>(null);
  const [formData, setFormData] = useState<EditImageFormRequest>({
    alt: "",
    name: "",
    description: "",
  });

  useEffect(() => {
    const fetchImageDetails = async () => {
      try {
        const token = Cookies.get("access_token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/images/${currentId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data: Image = await response.json();
          setFormData({
            alt: data.alt,
            name: data.name,
            description: data.description,
          });
          setCurrentImage(data);
        } else {
          console.error("Failed to fetch images");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        //setLoading(false);
      }
    };

    fetchImageDetails();
  }, [currentId]);

  async function handleDelete(): Promise<void> {
    const token = Cookies.get("access_token");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/images/${currentId}`,
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
        router.push("/admin/galeria");
        toast.success("Produto deletado com sucesso!");
      } else {
        console.error("Failed to delete product");

        toast.error("Houve um erro ao deletar o Produto!");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = Cookies.get("access_token");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/images/${currentId}`,
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

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className='wk-admin-page__wrapper'>
      <div className='container'>
        <div className='arrows-wrapper w-fit gap-2'>
          <HistoryArrows />
        </div>
        <div className='list-clients-header'>
          <h1 className='wk-admin-page__title'>Editar Imagem</h1>
        </div>
        <div className='grid grid-cols-3 gap-8'>
          <div>
            <img
              src={`${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080${currentImage?.image_path}`}
              alt={currentImage?.alt}
              className='wk-image-list__image'
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
                  href={`${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080${currentImage?.image_path}`}
                  download>
                  Baixar arquivo
                </a>
                <span className='opacity-50'>|</span>

                <button onClick={handleDelete} className='text-red-500'>
                  Excluir permanentemente
                </button>
              </div>
              <div className='wk-form__footer'>
                <button className='wk-btn wk-btn--md wk-btn--default'>
                  Cancelar
                </button>

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
      </div>
    </div>
  );
}
