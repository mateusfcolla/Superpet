"use client";
import { FaPaw, FaStar } from "react-icons/fa6";
import Image from "next/image";
import TestChat1 from "../../public/static/images/TestimonialChat1.png";
import TestChat2 from "../../public/static/images/TestimonialChat2.png";
import TestChat3 from "../../public/static/images/TestimonialChat3.png";
import luke from "../../public/static/images/luke.png";
import milady from "../../public/static/images/milady.png";
import russo from "../../public/static/images/russo.png";
import { motion } from "framer-motion";
import {
  popFromBottom,
  popFromLeft,
  popFromRight,
  popFromTop,
} from "../util/animationVariants";

export default function Testimonials() {
  return (
    <motion.div
      className='wk-testimonials'
      initial='offscreen'
      whileInView='onscreen'
      viewport={{ once: true, amount: 0.4 }}>
      <div className='container py-40'>
        <motion.div
          variants={popFromTop}
          className='text-6xl text-front-blue text-center flex justify-center gap-7 mb-24'>
          <FaPaw /> Depoimentos
        </motion.div>
        <div className='grid grid-cols-1 lg:grid-cols-3 relative h-full gap-20 md:gap-10 xl:gap-20 mt-20 justify-items-center'>
          <motion.div variants={popFromLeft} className='wk-testimonial'>
            <div className='wk-testimonial__pet'>
              <Image draggable={false} src={luke} alt='Luke Skywalker' />
            </div>
            <div className='wk-testimonial__chat'>
              <div className='wk-testimonial__stars color-1'>
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
              </div>
              <div className='wk-testimonial__text text-black text-center pt-4'>
                &quot;Quando o meu humano pede a minha comida, o pessoal da{" "}
                <b>Super Pet Delivery</b> entrega <b>super rápido</b>.&quot;
              </div>
              <div className='wk-testimonial__author text-black text-right font-bold'>
                Luke Skywalker, 1 Ano
              </div>
              <Image draggable={false} src={TestChat1} alt='' />
            </div>
          </motion.div>
          <motion.div variants={popFromBottom} className='wk-testimonial'>
            <div className='wk-testimonial__pet'>
              <Image draggable={false} src={russo} alt='Russo' />
            </div>
            <div className='wk-testimonial__chat'>
              <div className='wk-testimonial__stars color-2'>
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
              </div>
              <div className='wk-testimonial__text text-black text-center '>
                &quot;Todo mundo que me conhece sabe que não gosto de motos, mas
                a moto do pessoal da <b>Super Pet Delivery</b> é{" "}
                <b>uma exceção</b>, já que depois da vinda deles ganho muita
                coisa boa dos meus humanos&quot;
              </div>
              <div className='wk-testimonial__author text-black text-right font-bold'>
                Russo, 6 Anos
              </div>
              <Image draggable={false} src={TestChat2} alt='' />
            </div>
          </motion.div>
          <motion.div variants={popFromRight} className='wk-testimonial'>
            <div className='wk-testimonial__pet'>
              <Image draggable={false} src={milady} alt='Milady' />
            </div>
            <div className='wk-testimonial__chat'>
              <div className='wk-testimonial__stars color-3'>
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
              </div>
              <div className='wk-testimonial__text text-black text-center '>
                &quot;Dizem que eu sou uma <b>Pet Rainha</b> e que só como e
                bebo do melhor! Meus humanos, por razões óbvias, escolheram a{" "}
                <b>Super Pet Delivery</b>, que é <b>simplesmente a melhor</b> da
                grande Florianópolis&quot;
              </div>
              <div className='wk-testimonial__author text-black text-right font-bold'>
                Milady , 2 Anos
              </div>
              <Image draggable={false} src={TestChat3} alt='' />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
