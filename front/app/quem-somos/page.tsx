import { FaPaw } from "react-icons/fa6";
import React from "react";
import Image from "next/image";
import quemSomosImage from "../../public/static/images/quem-somos.jpg";
import "../styles/public-components/parts/Header.scss";
import "../styles/public-components/parts/quem-somos.scss";

export default function QuemSomos() {
  return (
    <main className='pt-48 pb-80 flex bg-gray-50 quem-somos'>
      <div className='container text-black flex items-center'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-24'>
          <div className='relative flex items-center quem-somos__image-wrapper'>
            <Image
              src={quemSomosImage}
              className='object-cover m-auto'
              alt='Quem Somos'
              fill={true}
            />
          </div>
          <div className='text-3xl flex items-start flex-col gap-12'>
            <h1 className='text-5xl flex gap-5 font-semibold text-front-blue text-left'>
              <FaPaw />
              Quem Somos
            </h1>

            <p>
              Bem-vindo à <strong> Super Pet Delivery </strong>, sua solução
              confiável para a <strong>nutrição</strong> e o
              <strong>bem-estar</strong> dos seus melhores amigos de quatro
              patas. Fundada por <strong>apaixonados por animais</strong>, nossa
              missão é oferecer uma experiência de compra
              <strong>conveniente</strong>, <strong>rápida</strong> e
              <strong>segura</strong>
              para todos os donos de cães e gatos.
            </p>
            <p>
              Entendemos que cada pet é <strong>único</strong> e merece o
              melhor. Por isso, selecionamos cuidadosamente uma ampla gama de
              <strong>rações de alta qualidade</strong>, atendendo às diversas
              necessidades dietéticas de cães e gatos, desde filhotes até os
              mais idosos. Nosso compromisso é com a <strong>saúde</strong> e a
              <strong>felicidade</strong> dos seus pets, e trabalhamos
              incansavelmente para garantir que eles recebam o alimento ideal
              para uma vida longa e saudável.
            </p>
            <p>
              Na Super Pet Delivery, valorizamos a <strong>praticidade</strong>e
              o <strong>conforto</strong> dos nossos clientes. Com apenas alguns
              cliques, você pode fazer seu pedido online pelo WhatsApp e receber
              os produtos diretamente em sua casa, com a rapidez e eficiência
              que só a Super Pet Delivery oferece. Estamos sempre prontos para
              atender às suas necessidades e as do seu pet, com um serviço de
              atendimento ao cliente
              <strong>amigável e especializado</strong>.
            </p>
            <p>
              Junte-se à família <strong>Super Pet Delivery</strong> e descubra
              a maneira mais fácil e confiável de cuidar da alimentação do seu
              pet.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
