"use client";
import SaleIcon from "../../public/latest-sales.svg";
import ClientIcon from "../../public/latest-client.svg";
import PlusIcon from "../../public/admin-plus.svg";
import "../styles/components/main.scss";
import HistoryArrows from "./components/HistoryArrows";
import DashboardWidget, {
  DashboardWidgetProps,
} from "./components/DashboardWidget";
import { TableConfig } from "./components/WkTable";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Client, ListClientResponse } from "./fetchClients";
import NumberFormat from "react-number-format";
import SliderWidget from "../components/SliderWidget";

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

export default function Dashboard() {
  const [listSalesResponse, setListSalesResponse] = useState<Sale[]>([]);
  const [listClientsResponse, setListClientsResponse] = useState<Client[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isDocumentLoading, setIsDocumentLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
    null
  );

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
      //setLoading(false);
    }
  };

  async function fetchClients(
    pageId: number,
    pageSize: number,
    sortField: string | null,
    sortDirection: "asc" | "desc" | null,
    search?: string
  ): Promise<void> {
    try {
      const token = Cookies.get("access_token");
      let url = `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/clients?page_id=${pageId}&page_size=${pageSize}`;

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
        const data: ListClientResponse = await response.json();
        setListClientsResponse(data.clients);
        setTotalItems(data.total);
      } else {
        console.error("Failed to fetch clients");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      //setLoading(false);
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
    fetchSales(currentPage, 5, sortField, sortDirection, "");
  }, [currentPage, sortField, sortDirection]);
  useEffect(() => {
    fetchClients(currentPage, 5, sortField, sortDirection, "");
  }, [currentPage, sortField, sortDirection]);

  const salesButton: DashboardWidgetProps["button"] = {
    text: "Nova venda",
    href: "/admin/vendas/criar",
    icon: PlusIcon,
  };

  const clientsButton: DashboardWidgetProps["button"] = {
    text: "Novo cliente",
    href: "/admin/clientes/criar",
    icon: PlusIcon,
  };

  const latestSales: TableConfig = {
    topClasses: "wk-table--sales",
    interact: {
      edit: listSalesResponse
        ? listSalesResponse.map((sale) => `/admin/vendas/${sale.id}`)
        : [],
      duplicate: false,
      report: {
        eventFunction: singleIconClick,
        items: listSalesResponse
          ? listSalesResponse.map((sale) => sale.id)
          : [],
        isDocumentLoading: isDocumentLoading,
      },
    },
    totalNumberOfItems: totalItems,
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
        width: 30,
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
        width: 25,
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
        title: "Cliente",
        key: "client_name",
        sortable: true,
        width: 25,
        items: listSalesResponse
          ? listSalesResponse.map((sale) => sale.client_name)
          : [],
      },
      {
        title: "Criado em",
        key: "created_at",
        sortable: true,
        width: 30,
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

  const latestClients: TableConfig = {
    topClasses: "wk-table--clients",
    interact: {
      edit: listClientsResponse
        ? listClientsResponse.map((client) => `/admin/clientes/${client.id}`)
        : [],
      duplicate: false,
    },
    totalNumberOfItems: totalItems,
    sortInfo: {
      field: sortField,
      direction: sortDirection,
      handleSort: handleSort,
    },
    columns: [
      {
        title: "Nome",
        key: "full_name",
        sortable: true,
        width: 25,
        items: listClientsResponse
          ? listClientsResponse.map((client) => (
              <>
                <span className='text-wk-secondary'> [ </span>
                {client.id.toString().padStart(3, "0")}
                <span className='text-wk-secondary'> ] </span>
                {client.full_name}
              </>
            ))
          : [],
      },
      {
        title: "Whatsapp",
        key: "phone_whatsapp",
        sortable: false,
        width: 25,
        items: listClientsResponse
          ? listClientsResponse.map((client) => (
              <NumberFormat
                key={client.id}
                value={client.phone_whatsapp}
                displayType={"text"}
                format='(##) #####-####'
              />
            ))
          : [],
      },
      {
        title: "Nome Pet",
        key: "pet_name",
        sortable: true,
        width: 25,
        items: listClientsResponse
          ? listClientsResponse.map((client) => client.pet_name)
          : [],
      },
      {
        title: "Endereço",
        key: "address_street",
        sortable: false,
        width: 25,
        items: listClientsResponse
          ? listClientsResponse.map((client) => client.address_street)
          : [],
      },
    ],
  };

  const widgetLink = {
    link: "/admin/vendas",
    text: "Ver todas as vendas",
  };

  const widgetLinkClients = {
    link: "/admin/clientes",
    text: "Ver todos os clientes",
  };

  return (
    <>
      <div className='list-clients-header wk-admin-page-wrapper w-full my-7 font-Inter'>
        <div className='arrows-wrapper w-fit gap-2'>
          <HistoryArrows />
        </div>
        <div className='title-wrapper grid grid-cols-2 mt-7 mb-14'>
          <h1 className='text-5xl font-semibold '>Dashboard</h1>
        </div>
        <div className='wk-dashboard w-full grid grid-cols-2 gap-12 mb-12'>
          <SliderWidget />
          <DashboardWidget
            Icon={SaleIcon}
            title='Ultimas Vendas'
            button={salesButton}
            table={latestSales}
            widgetLink={widgetLink}
          />
        </div>
        <div className='wk-dashboard h-full w-full grid grid-cols-2 gap-12'>
          <DashboardWidget
            Icon={ClientIcon}
            title='Ultimos Clientes'
            button={clientsButton}
            table={latestClients}
            widgetLink={widgetLinkClients}
          />
        </div>
      </div>
    </>
  );
}
