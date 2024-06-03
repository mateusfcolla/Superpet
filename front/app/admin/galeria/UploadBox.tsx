"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import React, { ChangeEvent, useState } from "react";
import ImageIcon from "../../../public/admin-image.svg";
import Cookies from "js-cookie";
import SingleImageList from "./SingleImageList";
import Link from "next/link";

interface FileData {
  name: string;
  image_path: string;
  id: number;
}

export default function UploadBox() {
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const token = Cookies.get("access_token");
  const [dragging, setDragging] = React.useState(false);
  const [uploadedFiles, setUploadedFiles] = React.useState<
    { id: number; name: string; url: string }[]
  >([]);
  const [buttonTexts, setButtonTexts] = useState(
    uploadedFiles.map(() => "Copiar URL")
  );

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(false);
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

      const data = await response.json();

      const newUploadedFiles = [
        ...data.images.map((file: FileData) => ({
          name: file.name,
          url: file.image_path,
          id: file.id,
        })),
      ];
      setUploadedFiles(newUploadedFiles);

      // Initialize buttonTexts with 'Copiar URL' for each uploaded file
      setButtonTexts(newUploadedFiles.map(() => "Copiar URL"));
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

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files) {
      uploadFiles(event.dataTransfer.files);
    }
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
        <Dialog.Content className={`wk-image-list__content `}>
          <Dialog.Title className='wk-image-list__title'>
            Fazer upload
          </Dialog.Title>

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
            className={`custom-file-upload ${dragging ? "dragging" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}>
            Solte arquivos aqui para enviar ou
            <button
              onClick={handleButtonClick}
              className='wk-btn wk-btn--secondary wk-btn--sm'>
              Selecionar arquivos
            </button>
          </label>

          <ul className='wk-image-list__uploaded'>
            {uploadedFiles.map((file, index) => (
              <li key={index}>
                <div>
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080${file.url}`}
                    alt={file.name}
                  />
                  <div>{file.name}</div>
                </div>
                <div>
                  <button
                    className='wk-btn wk-btn--secondary-outline wk-btn--sm'
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080${file.url}`
                      );
                      // Create a new array with the same values as buttonTexts, but with 'URL copiada' at the clicked button's index
                      const newButtonTexts = buttonTexts.map((text, i) =>
                        i === index ? "URL copiada" : text
                      );
                      setButtonTexts(newButtonTexts);
                      setTimeout(() => {
                        // After 3 seconds, change the clicked button's text back to 'Copiar URL'
                        const resetButtonTexts = newButtonTexts.map((text, i) =>
                          i === index ? "Copiar URL" : text
                        );
                        setButtonTexts(resetButtonTexts);
                      }, 3000);
                    }}>
                    {buttonTexts[index]}
                  </button>
                  <Link
                    className='wk-btn wk-btn--secondary wk-btn--sm'
                    href={`/admin/galeria/${file.id}`}>
                    Editar
                  </Link>
                </div>
              </li>
            ))}
          </ul>

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
