"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import WkTable, { TableConfig } from "../components/WkTable";
import { toast } from "react-toastify";

export interface Product {
  id: number;
  name: string;
  description: string;
  userId: number;
  price: string;
  old_price: string;
  sku: string;
  images: string;
  url: string;
  created_at: string;
  alt?: string;
}

interface ListProductResponse {
  total: number;
  products: Product[];
}

export default function ListProducts() {
  const [totalItems, setTotalItems] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [productsPerPage, setProductsPerPage] = useState<number>(20);
  const [listProductResponse, setListProductResponse] = useState<Product[]>([]);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
    null
  );

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

  async function fetchProducts(
    pageId: number,
    pageSize: number,
    sortField: string | null,
    sortDirection: "asc" | "desc" | null,
    search?: string
  ): Promise<void> {
    try {
      const token = Cookies.get("access_token");
      let url = `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/products?page_id=${pageId}&page_size=${pageSize}`;

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
        //const data: ListProductResponse = await response.json();
        const data: ListProductResponse = await response.json();
        setListProductResponse(data.products);

        setTotalItems(data.total);
      } else {
        console.error("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts(
      currentPage,
      productsPerPage,
      sortField,
      sortDirection,
      search
    );
  }, [currentPage, productsPerPage, sortField, sortDirection, search]);

  async function handleDelete(itemId: number): Promise<void> {
    const token = Cookies.get("access_token");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/products/${itemId}`,
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
        fetchProducts(
          currentPage,
          productsPerPage,
          sortField,
          sortDirection,
          search
        );
        toast.success("Produto deletado com sucesso!");
      } else {
        console.error("Failed to delete product");

        toast.error("Houve um erro ao deletar o Produto!");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const tableConfig: TableConfig = {
    topClasses: "wk-table--sales",
    interact: {
      edit: listProductResponse
        ? listProductResponse.map((product) => `/admin/produtos/${product.id}`)
        : [],
      duplicate: false,
      delete: {
        eventFunction: handleDelete,
        items: listProductResponse
          ? listProductResponse.map((product) => product.id)
          : [],
      },
    },
    totalNumberOfItems: totalItems,
    pages: {
      currentPage: {
        value: currentPage,
        setter: setCurrentPage,
      },
      itemsPerPage: productsPerPage,
      setItemsPerPage: setProductsPerPage,
    },
    searchBar: {
      search: search,
      setSearch: setSearch,
      placeholder: "Pesquise por Nome, Descrição, etc...",
    },
    sortInfo: {
      field: sortField,
      direction: sortDirection,
      handleSort: handleSort,
    },
    columns: [
      {
        title: "Nome",
        key: "name",
        sortable: true,
        width: 30,
        items: listProductResponse
          ? listProductResponse.map((product) => (
              <>
                <span className='text-wk-secondary'> [ </span>
                {product.id.toString().padStart(3, "0")}
                <span className='text-wk-secondary'> ] </span>
                {product.name}
              </>
            ))
          : [],
      },
      {
        title: "SKU",
        key: "sku",
        sortable: true,
        width: 30,
        items: listProductResponse
          ? listProductResponse.map((product) => product.sku)
          : [],
      },
      {
        title: "Preço",
        key: "price",
        sortable: true,
        width: 20,
        items: listProductResponse
          ? listProductResponse.map((product) => (
              <>
                <span className='text-wk-primary font-semibold'>R$ </span>
                {parseFloat(product.price).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </>
            ))
          : [],
      },
      {
        title: "Criado em",
        key: "created_at",
        sortable: true,
        width: 20,
        items: listProductResponse
          ? listProductResponse.map(
              (product) =>
                new Date(product.created_at).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }) +
                " às " +
                new Date(product.created_at).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
            )
          : [],
      },
    ],
  };

  return (
    <>
      <WkTable config={tableConfig} />
    </>
  );
}
