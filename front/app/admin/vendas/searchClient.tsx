/* import { useEffect, useState } from "react";
import { Client, ListClientResponse } from "./criar/page";
import Cookies from "js-cookie";

export default function SearchClient(
  formData: any,
  setFormData: any,
  setListClientResponse: any
) {
  const [searchClient, setSearchClient] = useState("");
  const [searchResults, setSearchResults] = useState<Client[]>([]);

  const fetchClients = async (
    pageId: number,
    pageSize: number,
    sortField: string | null,
    sortDirection: "asc" | "desc" | null,
    search?: string
  ) => {
    try {
      const token = Cookies.get("access_token");
      let url =
        `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/clients?page_id=${pageId}&page_size=${pageSize}` +
        (sortField && sortDirection
          ? `&sort_field=${sortField}&sort_direction=${sortDirection}`
          : "");

      // Add the search parameter to the URL if it's provided
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
      //setLoading(true);

      if (response.ok) {
        const data: ListClientResponse = await response.json();
        setListClientResponse(data);
        setSearchResults(data.clients);
        
        //setLoading(false);
      } else {
        console.error("Failed to fetch clients");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      //setLoading(false);
    }
  };
  // Add a new function to handle when a client is selected from the search results
  const handleClientSelect = (client: Client) => {
    setFormData({
      ...formData,
      client_id: client.id,
    });
    setSearchClient(
      `[ ${client.id.toString().padStart(3, "0")} ] ${client.full_name}`
    );
    setSearchResults([]); // clear the search results
  };

  useEffect(() => {
    if (searchClient) {
      fetchClients(1, 10, null, null, searchClient);
    } else {
      setSearchResults([]); // clear the search results if the input is empty
    }
  }, [searchClient]);
}
 */
