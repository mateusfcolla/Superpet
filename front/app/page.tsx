import Image from "next/image";
import LogoImage from "../public/static/images/superpet.png";
import WhatsappImagePath from "../public/static/images/whatsapp-logo.png";
import { FaWhatsapp, FaPhoneAlt } from "react-icons/fa";
import "./styles/main.scss";
import "./styles/public-components/main.scss";
import SimpleSlider from "./components/Slider";
import Categories from "./components/Categories";
import Brands from "./components/Brands";
import Testimonials from "./components/Testimonials";
import Products from "./components/Products";
import FixedSocials from "./components/FixedSocials";
import MapBlock from "./components/MapBlock";

export default function Home() {
  return (
    <main className='min-h-screen '>
      <FixedSocials />
      <SimpleSlider />
      <Categories />
      <Products />
      <Brands />
      <Testimonials />
      <MapBlock />
    </main>
  );
}
