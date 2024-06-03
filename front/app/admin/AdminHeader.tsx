"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import "../styles/admin/header.scss";
import Logo from "../../public/static/images/superpet-logo.png";
import userPic from "../../public/static/images/User.png";
import GearIcon from "../../public/gear.svg";
import ArrowDown from "../../public/arrow-down.svg";

export default function IsAuthenticated() {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    const token = Cookies.get("access_token");

    if (!token) {
      sessionStorage.setItem("previousUrl", window.location.href);

      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const headers = new Headers();
        headers.append("Authorization", `Bearer ${token}`);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/tokens/renew_access`,
          {
            method: "POST",
            credentials: "include",
            headers: headers,
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUsername(data.username);
          localStorage.setItem("username", data.username);
        } else {
          sessionStorage.setItem("previousUrl", window.location.href);
          console.error("Failed to fetch data");
          router.push("/login");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  }, [router]);

  const [showDropdown, setShowDropdown] = useState(false);

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = async () => {
    const currentToken = Cookies.get("access_token");

    try {
      const headers = new Headers();
      headers.append("Authorization", `Bearer ${currentToken}`);
      await fetch(`${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/users/logout`, { method: "POST", credentials: "include", headers: headers});
      sessionStorage.setItem("previousUrl", window.location.href);
      router.push("/login")
    } catch(err) {
      console.error("Error logging out: ", err);
    }
  }

  return (
    <>
      <div className='wkode-admin-header'>
        <div className='wkode-admin-header__logo'>
          <Link href='/admin/'>
            <Image src={Logo} alt='Logo' width={40} height={50} />
          </Link>
        </div>
        <div className='wkode-admin-header__right'>
          <Link href='/admin/config'>
            <GearIcon />
          </Link>
          <div className='wkode-admin-header__user'>
            <Link href={`/admin/usuarios/${username}`}>
              <Image src={userPic} alt='user image' width={35} height={35} />
            </Link>
            <div className='wkode-admin-header__user-name-wrapper' onClick={handleDropdownToggle}>
              {username}
              <ArrowDown className={ showDropdown ? 'inverted' : ''} />
            </div>
          </div>
        </div>
      {showDropdown && (
          <div className="wkode-admin-header-dropdown-content">
            <a onClick={handleLogout}>Logout</a>
          </div>
      )}
      </div>
    </>
  );
}
