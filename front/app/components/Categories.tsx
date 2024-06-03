"use client";
import { FaPaw } from "react-icons/fa6";
import Image from "next/image";
import Cat1 from "../../public/static/images/catDogs.png";
import Cat2 from "../../public/static/images/catFelinos.png";
import Cat3 from "../../public/static/images/catMedicamentos.png";
import Cat4 from "../../public/static/images/catAcessorios.png";
import Cat5 from "../../public/static/images/catPromocoes.png";
import Link from "next/link";
import { motion } from "framer-motion";
import { popFromLeft, popFromRight, popFromBottom } from "../util/animationVariants";

export default function Categories() {
  return (
    <motion.div
    className='wk-categories'
    initial="offscreen"
    whileInView="onscreen"
    viewport={{ once: true, amount: 0.4 }}>
      <div className='container py-40'>
        <motion.div variants={popFromLeft} className='text-6xl text-front-blue text-center flex justify-center gap-7 mb-24'>
          <FaPaw /> Navegue por Categorias!
        </motion.div>
        <div className='grid grid-cols-1 md:grid-cols-3 relative h-full gap-7 mt-20 md:mb-7'>
          <motion.div variants={popFromLeft} className='image-wrapper'>
            <Link href='/produtos?category=Cachorros'>
              <Image draggable={false} src={Cat1} alt='Cachorros' />
            </Link>
          </motion.div>
          <motion.div variants={popFromBottom} className='image-wrapper'>
            <Link href='/produtos?category=Gatos'>
              <Image draggable={false} src={Cat2} alt='Gatos' />
            </Link>
          </motion.div>
          <motion.div variants={popFromRight} className='image-wrapper'>
            <Link href='/produtos?category=Medicamentos'>
              <Image draggable={false} src={Cat3} alt='Medicamentos' />
            </Link>
          </motion.div>
        </div>
        <motion.div variants={popFromBottom} className='grid grid-cols-1 md:grid-cols-2 gap-7'>
          <Link href='/produtos?category=Acessórios-e-Brinquedos'>
            <Image draggable={false} src={Cat4} alt='Acessorios' />
          </Link>
          <Link href='/produtos?category=Promoções'>
            <Image draggable={false} src={Cat5} alt='Promoções' />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
