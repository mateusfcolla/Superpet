"use client";
import React, { useState } from "react";
import Image from "next/image";
import "../styles/public-components/parts/Header.scss";
import "../styles/public-components/parts/Footer.scss";
import "../styles/public-components/parts/contato.scss";
import "../styles/components/btn.scss";
import "../styles/components/WkForm.scss";
import NumberFormat from "react-number-format";
import {
  GoogleReCaptchaProvider,
  GoogleReCaptcha,
} from "react-google-recaptcha-v3";
import { useCallback } from "react";

export default function Form() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);

  const handleCaptcha = useCallback((token: any) => {
    setCaptchaToken(token);
  }, []);

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setIsSubmitting(true);

    // Here you can handle your form submission.
    // For example, send form data to a server:
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/contact`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          message,
          token: captchaToken,
        }),
      }
    );

    setIsSubmitting(false);

    if (response.ok) {
      setFormSubmitted(true);
    } else {
      console.error("Form submission failed");
    }
  };
  return (
    <div className='wk-form'>
      {formSubmitted ? (
        <p className='text-3xl'>
          Obrigado pela mensagem, entraremos em contato em breve.
        </p>
      ) : (
        <GoogleReCaptchaProvider reCaptchaKey='6LdSvaopAAAAAI1fTzRKGNg28RD3yLU72y34fywK'>
          <form onSubmit={handleSubmit}>
            <label>
              <h4>Nome</h4>
              <input
                type='text'
                name='name'
                required
                placeholder='Seu nome'
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              <h4>Email</h4>
              <input
                type='email'
                name='email'
                required
                placeholder='Seu email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label>
              <h4>Telefone</h4>

              <NumberFormat
                format='(##) # ####-####'
                isNumericString={true}
                value={phone}
                onValueChange={(values: {
                  value: React.SetStateAction<string>;
                }) => setPhone(values.value)}
                placeholder='Ex: (00) 9 9999-9999'
              />
            </label>
            <label>
              <h4>Mensagem</h4>
              <textarea
                name='message'
                cols={30}
                required
                rows={10}
                placeholder='Sua mensagem'
                value={message}
                onChange={(e) => setMessage(e.target.value)}></textarea>
            </label>

            <GoogleReCaptcha onVerify={handleCaptcha} />

            <button
              className='wk-btn wk-btn--sm wk-btn--primary'
              type='submit'
              disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar"}
            </button>
          </form>
        </GoogleReCaptchaProvider>
      )}
    </div>
  );
}
