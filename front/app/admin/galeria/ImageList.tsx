"use client";
import { ChangeEvent, useEffect, useState } from "react";
import SearchIcon from "../../../public/admin-search.svg";
import SearchImageList from "../../../public/admin-images-list.svg";
import SearchImageGrid from "../../../public/admin-images-grid.svg";
import Cookies from "js-cookie";
import Image from "next/image";
import SingleImageList from "./SingleImageList";
import WkPagination from "../components/WkPagination";
import { PagesConfig } from "../components/WkTable";
import React from "react";

export interface Image {
  id: number;
  name: string;
  description: string;
  alt: string;
  image_path: string;
  order?: number;
}

export interface ListImageResponse {
  total: number;
  images: Image[];
}

export type FetchImagesProps = {
  pageId: number;
  pageSize: number;
  sortField: string | null;
  sortDirection: "asc" | "desc" | null;
  setListImageResponse: (images: Image[]) => void;
  setTotalItems: (total: number) => void;
  setLoading: (loading: boolean) => void;
  search?: string;
};

export async function fetchImages({
  pageId,
  pageSize,
  sortField,
  sortDirection,
  setListImageResponse,
  setTotalItems,
  setLoading,
  search,
}: FetchImagesProps): Promise<void> {
  try {
    const token = Cookies.get("access_token");
    let url = `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/images?page_id=${pageId}&page_size=${pageSize}`;

    if (sortField && sortDirection) {
      url += `&sort_field=${sortField}&sort_direction=${sortDirection}`;
    }

    if (search) {
      url += `&search=${search}`;
    }
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      //const data: ListImageResponse = await response.json();
      const data: ListImageResponse = await response.json();
      setListImageResponse(data.images);

      setTotalItems(data.total);
    } else {
      console.error("Failed to fetch images");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    setLoading(false);
  }
}

export default function ImageList() {
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
  const dragEventsCounter = React.useRef(0);
  const token = Cookies.get("access_token");

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

  /* const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files) {
      uploadFiles(event.dataTransfer.files);
    }
  }; */

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
  return (
    <>
      <div
        className={`wk-image-list container  ${dragging ? "dragging" : ""}`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}>
        <div className='wk-image-list__header'>
          <div className='wk-image-list__header-filter'>
            <div className='button-wrapper'>
              {/* <button className='filter-list'>
                <SearchImageList />
              </button>
              <button className='filter-grid'>
                <SearchImageGrid />
              </button> */}
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
        <div className='wk-image-list__body grid grid-cols-6'>
          {listImageResponse.map((image) => (
            <SingleImageList
              image={image}
              key={image.id}
              fetchProps={{
                pageId: currentPage,
                pageSize: imagesPerPage,
                sortField,
                sortDirection,
                setListImageResponse,
                setTotalItems,
                setLoading,
                search,
              }}
            />
          ))}
        </div>
        <WkPagination
          totalNumberOfItems={totalItems}
          pages={pagesConfig}
          maxButtonsToShow={7}
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
  );
}
