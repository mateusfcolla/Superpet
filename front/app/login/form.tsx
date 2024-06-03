"use client";
import Link from "next/link";
import Router, { useRouter } from "next/navigation";
import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { toast } from "react-toastify";

interface FormData {
  identifier: string;
  password: string;
}

function LoginForm() {
  const router = useRouter();
  const [loginStatus, setLoginStatus] = useState<"idle" | "failed">("idle");
  const [formData, setFormData] = useState<FormData>({
    identifier: "",
    password: "",
  });

  const [accessToken, setAccessToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      // Load the access token from local storage on component mount
      return localStorage.getItem("accessToken");
    }
    return null;
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setLoginStatus("idle");
  };

  // if successfull, show alert, if not, show error alert
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (typeof window !== "undefined" && localStorage) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/users/login`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );

        if (response.ok) {
          const data = await response.json();

          // Update the access token state
          setAccessToken(data.access_token);
          setLoginStatus("idle");
          // Get the previous URL from sessionStorage
          const previousUrl = sessionStorage.getItem("previousUrl");

          // Check if the previous URL was in '/admin'
          if (previousUrl && previousUrl.includes("/admin")) {
            // Navigate to the previous URL
            router.push(previousUrl);
          } else {
            // Navigate to '/admin'
            router.push("/admin");
          }

          toast.success("Login efetuado com sucesso!");
        } else {
          setLoginStatus("failed");
          console.error("Login failed");
          toast.error("Houve um erro ao realizar o Login!");
        }
      }
    } catch (error) {
      setLoginStatus("failed");
      console.error("Network error:", error);
    }
  };

  return (
    <div
      className={`wkode-login-form__wrapper ${
        loginStatus === "failed" ? "wkode-login-form--failed-login" : ""
      }`}>
      <div className='wkode-login-form__title-wrapper'>
        <h1 className='wkode-login-form__title'>Bem Vindo!</h1>
        <p className='wkode-login-form__subtitle'>
          Digite seu email e senha para acessar sua conta.
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        <label className='' htmlFor='identifier'>
          Email ou Nome de usuário
        </label>
        <input
          className='w-full mb-6 '
          type='text'
          name='identifier'
          placeholder='Digite seu email ou Nome de usuário'
          value={formData.identifier}
          onChange={handleInputChange}
        />
        <label className='' htmlFor='password'>
          Senha
        </label>
        <input
          className='w-full mb-6 '
          type='password'
          name='password'
          placeholder='Digite sua senha'
          value={formData.password}
          onChange={handleInputChange}
        />
        {loginStatus === "failed" && (
          <p className='error-message'>Usuario ou senha incorreto</p>
        )}
        {/* <div className='wkode-login-form__remember-me'>
          <input
            type='checkbox'
            id='remember-me'
            name='remember-me'
            className='wkode-login-form__checkbox'
          />
          <label htmlFor='remember-me' className='wkode-login-form__label'>
            Remember me
          </label>
        </div> */}
        <div className='wkode-login-form__forgot-password-wrapper'>
          {/* <Link
            href='/esqueci-minha-senha'
            className='wkode-login-form__forgot-password'>
            Esqueci minha senha
          </Link> */}
        </div>

        <button
          className='wk-btn wk-btn--md wk-btn--primary w-full mt-6'
          type='submit'>
          Login
        </button>
      </form>
    </div>
  );
}

export default LoginForm;
