/* eslint-disable @next/next/no-img-element */
"use client";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import Image from "next/image";
import Slide1 from "../../public/static/images/slider-1.jpg";
import Slide2 from "../../public/static/images/slider-2.jpg";
import Slide3 from "../../public/static/images/slider-3.jpg";
import { useEffect, useState } from "react";
import { Image as ImageType } from "../admin/galeria/ImageList";

export default function SimpleSlider() {
  const [images, setImages] = useState<ImageType[]>([]);

  // repeat code for a change :O
  interface associatedImagesProps {
    setImages: (data: any[]) => void;
  }

  const getSliderImages = async ({ setImages }: associatedImagesProps) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/slider_images?page_id=1&page_size=10`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            //Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        if (setImages) {
          const images = await Promise.all(
            data.SliderImages.map(async (item: any) => {
              const imageResponse = await fetch(
                `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/images/${item.image_id}`,
                {
                  method: "GET",
                  credentials: "include",
                  headers: {
                    "Content-Type": "application/json",
                    //Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (imageResponse.ok) {
                const image = await imageResponse.json();
                return { ...image, order: item.order };
              } else {
                console.error(`Failed to fetch image with ID ${item.image_id}`);
                return null;
              }
            })
          );

          const sortedImages = images
            .filter((image: any) => image !== null)
            .sort((a: any, b: any) => a.order - b.order);

          setImages(sortedImages);
        }
      } else {
        console.error("Failed to fetch slider images");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    getSliderImages({ setImages });
  }, []);

  var settings = {
    dots: true,
    autoplay: true,
    autoplaySpeed: 3000,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
  };
  return (
    <div className='wk-slider text-2xl max-w-full'>
      <Slider {...settings}>
        {images.map((image) => (
          <div key={image.id}>
            <img
              src={`${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080${image.image_path}`}
              alt={image.alt}
            />
          </div>
        ))}
      </Slider>
    </div>
  );
}
