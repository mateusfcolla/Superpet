import LoginForm from "./form";
import "../styles/login/main.scss";
import "../styles/components/main.scss";
import Image from "next/image";
import LogoImage from "../../public/static/images/superpet.png";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LoginPage() {
  return (
    <main className='wkode-login-form flex min-h-screen flex-col items-center justify-center p-24'>
      <ToastContainer
        position='bottom-left'
        theme='dark'
        style={{ fontSize: "18px" }}
      />
      <Image
        src={LogoImage}
        width={100}
        height={100}
        alt='Logo da empresa Superpet'
        className='mb-16'
      />
      <LoginForm />
    </main>
  );
}
