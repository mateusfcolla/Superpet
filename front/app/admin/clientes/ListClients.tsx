import { useEffect, useState } from "react";
import Cookies from "js-cookie";

import { toast } from "react-toastify";
import WkTable, { TableConfig } from "../components/WkTable";
import NumberFormat from "react-number-format";

interface Client {
  id: number;
  full_name: string;
  phone_whatsapp: string;
  phone_line: string;
  pet_name: string;
  pet_breed: string;
  address_street: string;
  address_number: string;
  address_neighborhood: string;
  address_reference: string;
}

interface ListClientResponse {
  total: number;
  clients: Client[];
}

export default function ListClients() {
  const [totalItems, setTotalItems] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [clientsPerPage, setClientsPerPage] = useState<number>(20);
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
  const [listClientResponse, setListClientResponse] = useState<Client[]>([]);

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
        setListClientResponse(data.clients);
        setTotalItems(data.total);
      } else {
        console.error("Failed to fetch clients");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClients(currentPage, clientsPerPage, sortField, sortDirection, search);
  }, [currentPage, clientsPerPage, sortField, sortDirection, search]);

  async function handleDelete(itemId: number): Promise<void> {
    const token = Cookies.get("access_token");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/clients/${itemId}`,
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
        fetchClients(
          currentPage,
          clientsPerPage,
          sortField,
          sortDirection,
          search
        );
        toast.success("Cliente deletada com sucesso!");
      } else {
        console.error("Failed to delete sale");

        toast.error("Houve um erro ao deletar o Cliente!");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const tableConfig: TableConfig = {
    topClasses: "wk-table--sales",
    interact: {
      edit: listClientResponse
        ? listClientResponse.map((sale) => `/admin/clientes/${sale.id}`)
        : [],
      duplicate: false,
      delete: {
        eventFunction: handleDelete,
        items: listClientResponse
          ? listClientResponse.map((sale) => sale.id)
          : [],
        isAssociated: {
          isAssociated: true,
          message: "are you sure you want to delete this client?",
        },
      },
    },
    totalNumberOfItems: totalItems,
    pages: {
      currentPage: {
        value: currentPage,
        setter: setCurrentPage,
      },
      itemsPerPage: clientsPerPage,
      setItemsPerPage: setClientsPerPage,
    },
    searchBar: {
      search: search,
      setSearch: setSearch,
      placeholder: "Pesquise por Nome, Endereço, etc...",
    },
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
        items: listClientResponse
          ? listClientResponse.map((client) => (
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
        width: 12.5,
        items: listClientResponse
          ? listClientResponse.map((client) => (
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
        width: 12.5,
        items: listClientResponse
          ? listClientResponse.map((client) => client.pet_name)
          : [],
      },
      {
        title: "Nome Raça",
        key: "pet_breed",
        sortable: false,
        width: 12.5,
        items: listClientResponse
          ? listClientResponse.map((client) => client.pet_breed)
          : [],
      },
      {
        title: "Endereço",
        key: "address_street",
        sortable: false,
        width: 18.75,
        items: listClientResponse
          ? listClientResponse.map((client) => client.address_street)
          : [],
      },
      {
        title: "Número",
        key: "address_number",
        sortable: false,
        width: 6.25,
        items: listClientResponse
          ? listClientResponse.map((client) => client.address_number)
          : [],
      },
      {
        title: "Bairro",
        key: "address_neighborhood",
        sortable: false,
        width: 12.5,
        items: listClientResponse
          ? listClientResponse.map((client) => client.address_neighborhood)
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
