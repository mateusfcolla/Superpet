/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import Image from "next/image";
import Logo from "../../public/static/images/superpet-logo.png";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { InstagramLogoIcon } from "@radix-ui/react-icons";
import { FaTimes, FaWhatsapp } from "react-icons/fa";
import { RiMapPin2Fill } from "react-icons/ri";
import { FaSearch } from "react-icons/fa";
import { Product } from "../admin/produtos/ListProducts";
import { associatedImagesProps } from "../admin/produtos/ProductForm";

interface ListProductResponse {
  total: number;
  products: Product[];
}

export default function Header() {
  const [currentRoute, setCurrentRoute] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuItem2, setIsMenuItem2] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [listProductResponse, setListProductResponse] = useState<Product[]>([]);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  async function fetchProducts(
    pageId: number,
    pageSize: number,
    search?: string
  ): Promise<void> {
    try {
      let url = `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/products?page_id=${pageId}&page_size=${pageSize}`;

      if (search) {
        let searchValue = search.replace(/\./g, "<dot>");
        searchValue = searchValue.replace(/,/g, ".");
        searchValue = searchValue.replace(/<dot>/g, ",");
        url += `&search=${searchValue}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          //Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: ListProductResponse = await response.json();

        if (data && data.products) {
          const productsWithImages = await Promise.all(
            data.products.map(getProductWithImages)
          );
          setListProductResponse(productsWithImages);
        } else {
          setListProductResponse([]);
          console.log("No products found");
        }
      } else {
        console.error("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      //setLoading(false);
    }
  }

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
        return data;
      } else {
        console.error("Failed to edit product");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const getProductWithImages = async (product: Product) => {
    const images = await getAssociatedImages({
      currentId: product.id.toString(),
      setImages: () => {}, // Fix: Pass an empty function instead of null
    });
    if (Array.isArray(images) && images.length > 0) {
      // Fix: Check if images is an array
      return {
        ...product,
        images:
          `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080` +
          images[0].image_path,
        alt: images[0].alt,
      };
    } else {
      return { ...product, images: "" };
    }
  };

  useEffect(() => {
    // Update the current route when the route changes
    setCurrentRoute(pathname);
  }, [pathname]);

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);

    // Focus the input when the search box is opened
    if (!isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleSearchChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (query.trim() !== "") {
      await fetchProducts(1, 8, query);
      setIsResultsOpen(true);
    } else {
      setIsResultsOpen(false);
    }
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setIsResultsOpen(false);
    setSearchQuery("");
  };

  const isActive = (href: string) => {
    // Compare the current route with the link's href
    return currentRoute === href ? "wk-header__nav-item--active" : "";
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const toggleMenuItem2 = () => {
    setIsMenuItem2(!isMenuItem2);
  };

  return (
    <>
      <header
        className={`wk-header ${
          pathname === "/login" || pathname.startsWith("/admin")
            ? "hidden"
            : pathname === "/"
            ? "wk-header--home"
            : ""
        }`}>
        <div className='wk-header__socials-nav'>
          <a
            href='https://www.instagram.com/superpet.delivery/'
            target='_blank'>
            <InstagramLogoIcon />
            @superpet.delivery
          </a>
          <a
            href='https://api.whatsapp.com/send?phone=554899805164&text=Ol%C3%A1%2C%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20sobre%20os%20produtos%20da%20SuperPet.'
            target='_blank'>
            <FaWhatsapp />
            (48) 9980-5164
          </a>
          <a href='https://maps.app.goo.gl/QvXd9NArgN2aUMoC7' target='_blank'>
            <RiMapPin2Fill />
            R. Princesa Isabel, 260 - Pte. do Imaruim, Palhoça - SC
          </a>
        </div>
        <div className='wk-header__wrapper container'>
          <Link href='/'>
            <Image
              className='wk-header__image'
              src={Logo}
              alt='Logo'
              width={90}
              height={90}
            />
          </Link>

          <button
            className={`wk-hamburger ${isMenuOpen ? "open" : ""}`}
            onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </button>
          <nav
            className={`wk-header__nav relative ${
              isMenuOpen ? "wk-header__nav--active" : ""
            }`}>
            <ul className='wk-header__nav-list'>
              <li className={`wk-header__nav-item ${isActive("/")}`}>
                <Link href='/'>Início</Link>
              </li>
              <li className={`wk-header__nav-item ${isActive("/produtos")}`}>
                <Link href='/produtos'>Produtos</Link>
              </li>
              <li className={`wk-header__nav-item ${isActive("/quem-somos")}`}>
                <Link href='/quem-somos'>Quem Somos</Link>
              </li>
              <li className={`wk-header__nav-item ${isActive("/contato")}`}>
                <Link href='/contato'>Contato</Link>
              </li>
              <div
                className={`wk-header__search text-front-blue ${
                  isSearchOpen
                    ? "wk-header__search--open"
                    : "wk-header__search--close"
                }`}>
                <button
                  className='wk-header__search-icon'
                  onClick={() => !isSearchOpen && toggleSearch()}>
                  <FaSearch />
                </button>
                <input
                  className='wk-header__search-input'
                  type='text'
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder='Pesquisar...'
                  ref={searchInputRef}
                />
                {isSearchOpen && (
                  <button
                    className='wk-header__search-close'
                    onClick={closeSearch}>
                    <FaTimes />
                  </button>
                )}
              </div>
            </ul>
          </nav>
        </div>
        <div
          className={`wk-header__search-box ${
            isResultsOpen ? "wk-header__search-box--open" : ""
          }`}>
          {isResultsOpen && (
            <>
              <div className='wk-products container wk-product-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 text-black gap-12'>
                {listProductResponse && listProductResponse.length > 0 ? (
                  listProductResponse.map((product) => (
                    <div key={product.id} className='product-card'>
                      <Link
                        href={`/produtos/${product.url}-florianopolis-sao-jose-palhoca-biguacu-santo-amaro`}>
                        <div className='product-image'>
                          <img src={product.images} alt={product.alt} />
                        </div>
                        <div className='product-info'>
                          <div className='flex flex-row justify-center items-center gap-4'>
                            <p className='product-price product-price--old mb-3 text-xs'>
                              {product.old_price &&
                              parseFloat(product.old_price) > 0 ? (
                                <del>{`R$ ${parseFloat(
                                  product.old_price
                                ).toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}`}</del>
                              ) : null}
                            </p>
                            <p className='product-price mb-3'>
                              {parseFloat(product.price) > 0
                                ? `R$ ${parseFloat(
                                    product.price
                                  ).toLocaleString("pt-BR", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}`
                                : "Consulte"}
                            </p>
                          </div>
                          <h3 className='product-title'>{product.name}</h3>
                        </div>
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className='text-3xl'>Nenhum Produto Encontrado</p>
                )}
              </div>
            </>
          )}
        </div>
      </header>
    </>
  );
}
