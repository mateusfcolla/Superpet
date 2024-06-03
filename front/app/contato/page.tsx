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
import Form from "./form";

export default function QuemSomos() {
  return (
    <main className='pt-48 flex flex-col bg-gray-50 wk-contato justify-center'>
      <div className='container text-black flex items-center mb-28 justify-center'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-24'>
          <div className='wk-contato-section'>
            <h1 className='text-5xl font-semibold text-front-blue text-left mb-8'>
              Contato
            </h1>
            <h4 className='text-3xl text-black text-left mb-20'>
              Fale conosco. A sua opinião é muito importante para nós!
            </h4>
            <h3 className='text-3xl text-black font-bold text-left mb-6'>
              Horário de atendimento:
            </h3>
            <p className='text-2xl text-black text-left mb-6'>
              Segunda à sexta das: 08h00 às 18h00.
            </p>
            <p className='text-2xl text-black text-left mb-6'>
              Sábado das: 08h00 às 12h00.
            </p>
            <p className='text-2xl text-black text-left mb-6'>
              Domingo: Fechado.
            </p>
          </div>
          <div className='wk-form'>
            <Form />
          </div>
        </div>
      </div>
      <iframe
        src='https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14139.08302888555!2d-48.6558265!3d-27.6316157!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95273597c288c591%3A0x428507ff8e06abda!2sSuper%20Pet%20Delivery!5e0!3m2!1spt-BR!2sbr!4v1710979315735!5m2!1spt-BR!2sbr'
        width='100%'
        height='500'
        loading='lazy'></iframe>
    </main>
  );
}
