"use client";
import React, {
  useEffect,
  useState,
  MouseEventHandler,
  FormEvent,
} from "react";
import Cookies from "js-cookie";
import { useContext } from "react";
import WkTable from "../components/WkTable";
import {
  TableConfig,
  TableColumn,
  checkedInPageConfig,
} from "../components/WkTable";
import { toast } from "react-toastify";
import { CheckedItemsContext } from "./CheckedItemsContext";

interface Sale {
  id: number;
  client_id: number;
  client_name: string;
  product: string;
  price: string;
  observation: string;
  created_at: string;
}

interface ListSalesResponse {
  sales: Sale[];
  total: number;
}

interface ListSalesProps {
  className?: string;
}

export default function ListSales({ className }: ListSalesProps) {
  const [listSalesResponse, setListSalesResponse] = useState<Sale[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [salesPerPage, setSalesPerPage] = useState<number>(10);
  const [sortField, setSortField] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isDocumentLoading, setIsDocumentLoading] = useState(false);
  const { checkedItems, setCheckedItems } = useContext(CheckedItemsContext);
  const [allCheckedInPage, setAllCheckedInPage] = useState<number[]>([]);
  const [allChecked, setAllChecked] = useState(false);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
    null
  );

  const handleCheck = (id: number, isChecked: boolean) => {
    if (isChecked) {
      setCheckedItems((prevCheckedItems) => [...prevCheckedItems, id]);
    } else {
      setCheckedItems((prevCheckedItems) =>
        prevCheckedItems.filter((itemId) => itemId !== id)
      );
    }
  };

  const handleCheckAllInPage = (currentPageProp: number) => {
    setAllCheckedInPage((prevAllCheckedInPage) => {
      if (prevAllCheckedInPage.includes(currentPageProp)) {
        // If the number is already in the array, filter it out
        const newCheckedInPage = prevAllCheckedInPage.filter(
          (page) => page !== currentPageProp
        );
        // Uncheck all sales on the current page
        setCheckedItems((prevCheckedSales) =>
          prevCheckedSales.filter(
            (saleId) => !listSalesResponse.find((sale) => sale.id === saleId)
          )
        );
        return newCheckedInPage;
      } else {
        // If the number is not in the array, add it
        const newCheckedInPage = [...prevAllCheckedInPage, currentPageProp];
        // Check all sales on the current page
        const allSaleIds = listSalesResponse.map((sale) => sale.id);
        setCheckedItems((prevCheckedSales) => [
          ...new Set([...prevCheckedSales, ...allSaleIds]),
        ]);
        return newCheckedInPage;
      }
    });
  };

  const handleCheckAll = async () => {
    const token = Cookies.get("access_token");

    if (allChecked || checkedItems.length > 0) {
      setCheckedItems([]);
      setAllCheckedInPage([]);
      if (allChecked) {
        setAllChecked(!allChecked);
      }
    } else {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/sales/all`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      setCheckedItems(data);
      setAllChecked(!allChecked);
    }
  };

  // we send a request with a date range to the backend and receive back an array of sale ids
  const getItemsFromDateRange = async (
    start_date: string,
    end_date: string
  ) => {
    const token = Cookies.get("access_token");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/sales/by_date`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            start_date: start_date,
            end_date: end_date,
          }),
        }
      );
      const data = await response.json();

      setCheckedItems(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {}, [checkedItems, allCheckedInPage]);

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
  const fetchSales = async (
    pageId: number,
    pageSize: number,
    sortField: string | null,
    sortDirection: "asc" | "desc" | null,
    search?: string
  ) => {
    try {
      const token = Cookies.get("access_token");
      let url = `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/sales?page_id=${pageId}&page_size=${pageSize}`;

      if (sortField && sortDirection) {
        url += `&sort_field=${sortField}&sort_direction=${sortDirection}`;
      }

      if (search) {
        search = search.replace(",", ".");
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
        const data: ListSalesResponse = await response.json();
        setListSalesResponse(data.sales);
        setTotalItems(data.total);
      } else {
        console.error("Failed to fetch sales");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales(currentPage, salesPerPage, sortField, sortDirection, search);
  }, [currentPage, salesPerPage, sortField, sortDirection, search]);

  async function handleDelete(itemId: number): Promise<void> {
    const token = Cookies.get("access_token");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/sales/${itemId}`,
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
        fetchSales(currentPage, salesPerPage, sortField, sortDirection, search);
        toast.success("Venda deletada com sucesso!");
      } else {
        console.error("Failed to delete sale");

        toast.error("Houve um erro ao deletar a venda!");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async function handleDeleteMultiple(items: number[]): Promise<void> {
    const token = Cookies.get("access_token");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/sales/delete`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            IDs: items,
          }),
        }
      );

      if (response.ok) {
        fetchSales(currentPage, salesPerPage, sortField, sortDirection, search);
        toast.success("Vendas deletadas com sucesso!");
        setCheckedItems([]);
        setAllCheckedInPage([]);
      } else {
        console.error("Failed to delete sales");

        toast.error("Houve um erro ao deletar as vendas!");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const singleIconClick = async (sale: number): Promise<void> => {
    const TypeOfPdf = "delivery";
    setIsDocumentLoading(true);

    try {
      const token = Cookies.get("access_token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/pdf/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // replace with your token
          },
          body: JSON.stringify({
            sale_id: [sale],
            type_of_pdf: TypeOfPdf,
          }),
        }
      );
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const date = new Date();
      const options = {
        timeZone: "America/Sao_Paulo",
        hour12: false,
      };
      const formattedDate = date.toLocaleDateString("pt-BR");
      const formattedTime = date
        .toLocaleTimeString("pt-BR", options)
        .replace(/:/g, "-");

      let fileName = "";

      fileName =
        formattedDate + " " + formattedTime + "-nota-de-entrega" + ".pdf";

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();

      setIsDocumentLoading(false);
    } catch (error) {
      console.error(error);
      setIsDocumentLoading(false);
    }
  };

  // this can stay
  const handleDocumentButtonClick = async (
    ids: number[],
    TypeOfPdf: string
  ): Promise<void> => {
    setIsDocumentLoading(true);
    try {
      const token = Cookies.get("access_token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/pdf/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // replace with your token
          },
          body: JSON.stringify({
            sale_id: ids,
            type_of_pdf: TypeOfPdf,
          }),
        }
      );
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const date = new Date();
      const options = {
        timeZone: "America/Sao_Paulo",
        hour12: false,
      };
      const formattedDate = date.toLocaleDateString("pt-BR");
      const formattedTime = date
        .toLocaleTimeString("pt-BR", options)
        .replace(/:/g, "-");

      let fileName = "";
      if (TypeOfPdf === "delivery") {
        fileName =
          formattedDate + " " + formattedTime + "-nota-de-entrega" + ".pdf";
      } else if (TypeOfPdf === "simple") {
        fileName =
          formattedDate + " " + formattedTime + "-relatorio-de-vendas" + ".pdf";
      }
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      setIsDocumentLoading(false);
    } catch (error) {
      console.error(error);
      setIsDocumentLoading(false);
    }
  };

  const tableConfig: TableConfig = {
    topClasses: "wk-table--sales",
    interact: {
      edit: listSalesResponse
        ? listSalesResponse.map((sale) => `/admin/vendas/${sale.id}`)
        : [],
      duplicate: false,
      delete: {
        eventFunction: handleDelete,
        items: listSalesResponse
          ? listSalesResponse.map((sale) => sale.id)
          : [],
        multipleFunction: handleDeleteMultiple,
      },
      report: {
        eventFunction: singleIconClick,
        items: listSalesResponse
          ? listSalesResponse.map((sale) => sale.id)
          : [],
        isDocumentLoading: isDocumentLoading,
        multipleFunction: handleDocumentButtonClick,
      },
    },
    checkAll: {
      handleCheckAll: handleCheckAll,
      allChecked: allChecked,
    },
    dateRange: {
      getItemsFromDateRange: getItemsFromDateRange,
    },
    checkbox: {
      checkedItems: checkedItems,
      handleCheck: handleCheck,
      setCheckedItems: setCheckedItems,
      items: listSalesResponse ? listSalesResponse.map((sale) => sale.id) : [],
      handleCheckAllInPage: handleCheckAllInPage,
      allCheckedInPage: allCheckedInPage,
      setAllCheckedInPage: setAllCheckedInPage,
    },
    totalNumberOfItems: totalItems,
    pages: {
      currentPage: {
        value: currentPage,
        setter: setCurrentPage,
      },
      itemsPerPage: salesPerPage,
      setItemsPerPage: setSalesPerPage,
    },
    searchBar: {
      search: search,
      setSearch: setSearch,
      placeholder: "Pesquise por Produto, Preço, Observação, etc...",
    },
    sortInfo: {
      field: sortField,
      direction: sortDirection,
      handleSort: handleSort,
    },
    columns: [
      {
        title: "Produto",
        key: "product",
        sortable: true,
        width: 20,
        items: listSalesResponse
          ? listSalesResponse.map((sale) => (
              <>
                <span className='text-wk-secondary'> [ </span>
                {sale.id.toString().padStart(3, "0")}
                <span className='text-wk-secondary'> ] </span>
                {sale.product}
              </>
            ))
          : [],
      },
      {
        title: "Preço",
        key: "price",
        sortable: true,
        width: 20,
        items: listSalesResponse
          ? listSalesResponse.map((sale) => (
              <>
                <span className='text-wk-primary font-semibold'>R$ </span>
                {parseFloat(sale.price).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </>
            ))
          : [],
      },
      {
        title: "Observação",
        key: "observation",
        sortable: false,
        width: 20,
        items: listSalesResponse
          ? listSalesResponse.map((sale) => sale.observation)
          : [],
      },
      {
        title: "Cliente",
        key: "client_name",
        sortable: true,
        width: 20,
        items: listSalesResponse
          ? listSalesResponse.map((sale) => sale.client_name)
          : [],
      },
      {
        title: "Criado em",
        key: "created_at",
        sortable: true,
        width: 20,
        items: listSalesResponse
          ? listSalesResponse.map((sale) =>
              new Date(sale.created_at).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
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
