"use client";
import { FaPaw } from "react-icons/fa6";
import { motion } from "framer-motion";
import { popFromTop } from "../util/animationVariants";

export default function FixedSocials() {
  return (
    <motion.div 
    className='wk-map-block'
    initial="offscreen"
    whileInView="onscreen"
    viewport={{ once: true, amount: 0.4 }}>
      <motion.div variants={popFromTop} className='text-6xl text-front-blue text-center flex justify-center gap-7 mb-24'>
        <FaPaw /> Onde Estamos
      </motion.div>
      <iframe
        src='https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14139.08302888555!2d-48.6558265!3d-27.6316157!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95273597c288c591%3A0x428507ff8e06abda!2sSuper%20Pet%20Delivery!5e0!3m2!1spt-BR!2sbr!4v1710979315735!5m2!1spt-BR!2sbr'
        width='100%'
        height='500'
        loading='lazy'></iframe>
    </motion.div>
  );
}
