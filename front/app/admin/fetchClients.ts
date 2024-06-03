import Cookies from "js-cookie";
export interface ListClientResponse {
  total: number;
  clients: Client[];
}
export interface Client {
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
export default async function fetchClients(
  pageId: number,
  pageSize: number,
  sortField: string | null,
  sortDirection: "asc" | "desc" | null,
  setListClientResponse: (data: ListClientResponse) => void,
  setSearchResults: (data: Client[]) => void,
  search?: string
) {
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
}
