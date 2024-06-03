"use client";
import IsAuthenticated from "./AdminHeader";
import AdminSidebar from "./sidebar";
import UsersList from "./users";
import "../styles/admin/main.scss";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarState, setSidebarState] = useState(
    "wkode-admin-sidebar--closed"
  );

  const handleSidebarStateChange = (newState: string) => {
    setSidebarState(newState);
  };

  const getMainPadding = () => {
    if (sidebarState === "wkode-admin-sidebar--open") {
      return "p-24 pl-108";
    } else if (sidebarState === "wkode-admin-sidebar--open-in-hover") {
      return "p-24 pl-36";
    } else {
      return "p-24 pl-36";
    }
  };
  return (
    <>
      <ToastContainer
        position='bottom-left'
        theme='dark'
        style={{ fontSize: "18px" }}
      />
      <IsAuthenticated />
      <main
        className={`flex min-h-screen flex-col items-center justify-start ${getMainPadding()} wkode-page-admin-main`}>
        <AdminSidebar
          sidebarState={sidebarState}
          onStateChange={handleSidebarStateChange}
        />
        {children}
      </main>
    </>
  );
}
