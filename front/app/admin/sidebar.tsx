"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";
import { MdOutlinePointOfSale } from "react-icons/md";
import "../styles/admin/sidebar.scss";
import HomeIcon from "../../public/admin-home.svg";
import VendasIcon from "../../public/admin-vendas.svg";
import ProdutosIcon from "../../public/admin-produtos.svg";
import ClientesIcon from "../../public/admin-clientes.svg";
import GaleriaIcon from "../../public/admin-galeria.svg";
import CategoriasIcon from "../../public/admin-categoria.svg";
import UsuariosIcon from "../../public/admin-usuarios.svg";
import LockClosedIcon from "../../public/sidebar-lock.svg";
import LockOpenIcon from "../../public/sidebar-lock-open.svg";
import Cookies from "js-cookie";

type AdminSidebarProps = {
  sidebarState: string;
  onStateChange: (newState: string) => void;
};

export default function AdminSidebar({ onStateChange }: AdminSidebarProps) {
  const router = useRouter();
  const [currentRoute, setCurrentRoute] = useState("");
  const [sidebarState, setSidebarState] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState<string>("User");
  const pathname = usePathname();

  useEffect(() => {
    // Update the current route when the route changes
    setCurrentRoute(pathname);
  }, [pathname]);

  useEffect(() => {
    // Update sidebarState from localStorage after component has mounted
    if (typeof window !== "undefined") {
      const storedSidebarState = localStorage.getItem("sidebarState");
      if (storedSidebarState) {
        setSidebarState(storedSidebarState);
      }
    }
  }, [setSidebarState]);

  useEffect(() => {
    
    const token = Cookies.get("access_token");

    const getUserRole = async () => {
      try {
        const headers = new Headers();
        headers.append("Authorization", `Bearer ${token}`);

        const currentUser = localStorage.getItem("username")
        if(currentUser)
        {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/current_user`,
            {
              method: "GET",
              credentials: "include",
              headers: headers,
            }
          );
  
          if (response.ok) {
            const data = await response.json()
            setCurrentUserRole(data.role)
          } else {
            console.error("Failed to check user role");
          }
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    getUserRole();
  }, [router, currentUserRole])

  useEffect(() => {
    localStorage.setItem("sidebarState", sidebarState);
    onStateChange(sidebarState); // Notify the parent component about the change
  }, [sidebarState, onStateChange]);

  const isActive = (href: string) => {
    // Compare the current route with the link's href
    if (href === "/admin") {
        return currentRoute === href
            ? "wkode-admin-sidebar__menu-item--active"
            : "";
    } 
    else {
        return currentRoute.includes(href)
            ? "wkode-admin-sidebar__menu-item--active"
            : "";
    }
  };

  return (
    <div className={`wkode-admin-sidebar ${sidebarState}`}>
      <div className='wkode-admin-sidebar__menu-wrapper'>
        <Link
          className={`wkode-admin-sidebar__menu-item ${isActive("/admin")}`}
          href={"/admin"}>
          <HomeIcon />
          Home
        </Link>
        <Link
          className={`wkode-admin-sidebar__menu-item ${isActive(
            "/admin/clientes"
          )}`}
          href={"/admin/clientes"}>
          <ClientesIcon />
          Clientes
        </Link>
        <Link
          className={`wkode-admin-sidebar__menu-item ${isActive(
            "/admin/produtos"
          )}`}
          href={"/admin/produtos"}>
          <ProdutosIcon />
          Produtos
        </Link>
        <Link
          className={`wkode-admin-sidebar__menu-item ${isActive(
            "/admin/categorias"
          )}`}
          href={"/admin/categorias"}>
          <CategoriasIcon />
          Categorias
        </Link>
        <Link
          className={`wkode-admin-sidebar__menu-item ${isActive(
            "/admin/vendas"
          )}`}
          href={"/admin/vendas"}>
          <VendasIcon />
          Vendas
        </Link>
        <Link
          className={`wkode-admin-sidebar__menu-item ${isActive(
            "/admin/galeria"
          )}`}
          href={"/admin/galeria"}>
          <GaleriaIcon />
          Galeria
        </Link>
        {
          currentUserRole === "Administrator" ? (
            <Link
              className={`wkode-admin-sidebar__menu-item ${isActive(
                "/admin/usuarios"
              )}`}
              href={"/admin/usuarios"}>
              <UsuariosIcon />
              Usuarios
            </Link>
          ): null
        }
      </div>
      <button
        onClick={() => {
          if (sidebarState === "wkode-admin-sidebar--open") {
            setSidebarState("wkode-admin-sidebar--open-in-hover");
          } else if (sidebarState === "wkode-admin-sidebar--open-in-hover") {
            setSidebarState("wkode-admin-sidebar--closed");
          } else if (sidebarState === "wkode-admin-sidebar--closed") {
            setSidebarState("wkode-admin-sidebar--open");
          } else {
            setSidebarState("wkode-admin-sidebar--open-in-hover");
          }
        }}
        className='wkode-admin-sidebar__menu-item wkode-admin-sidebar__menu-item--lock'>
        {sidebarState === "wkode-admin-sidebar--open-in-hover" ? (
          <LockOpenIcon />
        ) : (
          <LockClosedIcon />
        )}
      </button>
    </div>
  );
}
