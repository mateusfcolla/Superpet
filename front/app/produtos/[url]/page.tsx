/* eslint-disable @next/next/no-img-element */
"use client";
import { usePathname } from "next/navigation";
import "../../styles/public-components/main.scss";
import { RefObject, createRef, use, useEffect, useState } from "react";
import { ProductDetails } from "@/app/admin/produtos/[productid]/page";
import Cookies from "js-cookie";
import { associatedImagesProps } from "@/app/admin/produtos/ProductForm";
import ReactImageMagnify from "@blacklab/react-image-magnify";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import React from "react";

export default function SingleProduct() {
  const pathname = usePathname();
  var urlParts = pathname.split("/");
  var currentUrlFull = urlParts.at(-1);

  const [currentProduct, setCurrentProduct] = useState<ProductDetails | null>(
    null
  );
  const [images, setImages] = useState<any[]>([]);
  const [nav1, setNav1] = useState<Slider | undefined>(undefined);
  const [nav2, setNav2] = useState<Slider | undefined>(undefined);
  const [productNotFound, setProductNotFound] = useState(false);

  const slider1: RefObject<Slider> = createRef();
  const slider2: RefObject<Slider> = createRef();

  useEffect(() => {
    if (slider1.current && slider2.current) {
      setNav1(slider1.current);
      setNav2(slider2.current);
    }
  }, []);

  const [displayPrice, setDisplayPrice] = useState("0,00");
  // returning ordering-image-test-florianopolis-sao-jose-palhoca-biguacu-santo-amaro | use whatever is before -florianopolis-sao-jose-palhoca-biguacu-santo-amaro and save it onto a variable
  var currentUrl =
    currentUrlFull &&
    currentUrlFull.split("-florianopolis-sao-jose-palhoca-biguacu-santo-amaro");

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const token = Cookies.get("access_token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/product/${
            currentUrl ? currentUrl[0] : ""
          }`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data: ProductDetails = await response.json();

          setCurrentProduct({
            id: data.id,
            name: data.name,
            description: data.description,
            price: data.price.toString(),
            old_price: data.old_price.toString(),
            user_id: data.user_id,
            sku: data.sku,
          });
        } else if (response.status === 404) {
          setProductNotFound(true);
        } else {
          console.error("Failed to fetch products");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        //setLoading(false);
      }
    };

    if (currentUrl && currentUrl[0]) {
      fetchProductDetails();
    }
  }, [currentUrl ? currentUrl[0] : undefined]);

  const getAssociatedImages = async ({
    currentId,
    setImages,
  }: associatedImagesProps) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/images/by_product/${currentId}`,
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
        //toast.success("Imagem editada com sucesso!");
        const data = await response.json();

        setImages && setImages(data);
      } else {
        console.error("Failed to get images");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    if (currentProduct) {
      getAssociatedImages({
        currentId: currentProduct?.id.toString(),
        setImages: setImages,
      });
    }
  }, [currentProduct]);

  return (
    <div className='single-product pt-48 pb-80'>
      <div className='container'>
        {productNotFound ? (
          <div className='min-h-screen'>
            <h1 className='text-5xl text-gray-700'>
              Nenhum produto encontrado
            </h1>
          </div>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-2 min-h-screen gap-24'>
            <div className=''>
              <Slider
                className='slider-main'
                asNavFor={nav2}
                ref={slider1}
                {...{
                  slidesToShow: 1,
                  slidesToScroll: 1,
                  arrows: true,
                  infinite: images.length > 1,
                }}>
                {images.map((image, index) => (
                  <div key={index}>
                    <img
                      src={`${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080${image.image_path}`}
                      alt='product'
                      className='w-full'
                    />
                  </div>
                ))}
              </Slider>

              <Slider
                className='slider-nav'
                {...{
                  arrows: false,
                  infinite: images.length > 1,
                }}
                asNavFor={nav1}
                ref={slider2}
                slidesToShow={images.length > 1 ? images.length : 6}
                swipeToSlide={true}
                focusOnSelect={true}>
                {images.map((image, index) => (
                  <div key={index}>
                    <img
                      src={`${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080${image.image_path}`}
                      alt='product'
                      className='w-full'
                    />
                  </div>
                ))}
              </Slider>
            </div>
            <div className='product-details flex gap-5 flex-col'>
              <h1 className='text-5xl text-gray-700'>{currentProduct?.name}</h1>
              <div className='price-wrapper flex flex-row justify-start items-center gap-4 mb-6'>
                <h2 className='price text-3xl font-bold text-front-blue '>
                  {currentProduct && parseFloat(currentProduct.price) > 0
                    ? `R$ ${parseFloat(currentProduct.price).toLocaleString(
                        "pt-BR",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}`
                    : "Consulte"}
                </h2>
                <h3 className='price price--old text-xl text-center text-gray-500 line-through'>
                  {currentProduct &&
                  currentProduct.old_price &&
                  parseFloat(currentProduct.old_price) > 0 ? (
                    <del>{`R$ ${parseFloat(
                      currentProduct.old_price
                    ).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`}</del>
                  ) : null}
                </h3>
              </div>

              <p className='text-2xl text-black'>
                {currentProduct?.description.split("\n").map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
