"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

interface User {
  id: number;
  username: string;
}

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const pageId = 1;
  const pageSize = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = new Headers();
        const token = Cookies.get("access_token");
        headers.append("Authorization", `Bearer ${token}`);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/users?page_id=${pageId}&page_size=${pageSize}`,
          {
            method: "GET",
            credentials: "include",
            headers: headers,
          }
        );

        if (response.ok) {
          const data: User[] = await response.json();
          setUsers(data);
        } else {
          console.error("Failed to fetch data");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      {/* <h1 className='text-lg'>Hello bruh</h1> */}
      <div>
        <h2>Users:</h2>
        <ul>
          {users.length > 0 ? (
            // Render the list of users if there are users in the array
            users.map((user) => <li key={user.id}>{user.username}</li>)
          ) : (
            // Render a message if there are no users in the array
            <p>No users found.</p>
          )}
        </ul>
      </div>
    </>
  );
}
