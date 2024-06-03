"use client";
import { use, useEffect, useState } from "react";
import { Product } from "../admin/produtos/ListProducts";
import { associatedImagesProps } from "../admin/produtos/ProductForm";
import { FaPaw } from "react-icons/fa";
import "../styles/public-components/parts/Header.scss";
import "../styles/public-components/parts/Products.scss";
import "../styles/public-components/parts/Footer.scss";
import WkPagination from "../admin/components/WkPagination";
import Link from "next/link";
import {
  Category,
  ListCategoryResponse,
} from "../admin/categorias/ListCategories";
import SearchIcon from "../../public/admin-search.svg";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function Produtos() {
  const [totalItems, setTotalItems] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [productsPerPage, setProductsPerPage] = useState<number>(9);
  const [listProductResponse, setListProductResponse] = useState<Product[]>([]);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
    null
  );
  const [listCategory, setListCategory] = useState<Category[]>([]);
  const [categoriesPerPage, setCategoriesPerPage] = useState<number>(50);
  const [filter, setFilter] = useState<number[] | null>(null);
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [currentPageCategory, setCurrentPageCategory] = useState<number>(1);

  const searchParams = useSearchParams();

  const queryParam = searchParams.getAll("category").join("&");
  interface ListProductResponse {
    total: number;
    products: Product[];
  }
  /*   interface productsWithImages extends Product {
    images: string[];
  } */

  function handleSortDirectionChange(value: string) {
    if (value === "asc" || value === "desc" || value === null) {
      setSortDirection(value);
    } else {
      setSortDirection(null);
    }
  }

  useEffect(() => {
    if (queryParam) {
      const categoriesFromUrl = queryParam
        .split("&")
        .map((category) => category.replace(/-/g, " "));
      const checkedIds = [];
      const checkedNames = [];
      for (const category of listCategory) {
        if (categoriesFromUrl.includes(category.name)) {
          checkedIds.push(category.id);
          checkedNames.push(category.name);
        }
      }
      setCheckedItems(checkedIds);
      setCheckedNames(checkedNames);
    }
  }, [queryParam, listCategory]);

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

  async function fetchProducts(
    pageId: number,
    pageSize: number,
    sortField: string | null,
    sortDirection: "asc" | "desc" | null,
    search?: string,
    filter?: string
  ): Promise<void> {
    try {
      let url = `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/products?page_id=${pageId}&page_size=${pageSize}`;

      if (sortField && sortDirection) {
        url += `&sort_field=${sortField}&sort_direction=${sortDirection}`;
      }

      if (search) {
        let searchValue = search.replace(/\./g, "<dot>");
        searchValue = searchValue.replace(/,/g, ".");
        searchValue = searchValue.replace(/<dot>/g, ",");
        url += `&search=${searchValue}`;
      }

      if (filter) {
        url += `&category_id=${filter}`;
      }

      if (checkedItems && checkedItems.length > 0) {
        checkedItems.forEach((id) => {
          url += `&category_ids=${id}`;
        });
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
      setLoading(false);
    }
  }
  async function fetchCategories(
    pageId: number,
    pageSize: number
  ): Promise<void> {
    try {
      let url = `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/categories?page_id=${pageId}&page_size=${pageSize}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: ListCategoryResponse = await response.json();
        setListCategory(data.categories);

        setTotalItems(data.total);
      } else {
        console.error("Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories(currentPageCategory, categoriesPerPage);
  }, [currentPageCategory, categoriesPerPage]);

  useEffect(() => {
    fetchProducts(
      currentPage,
      productsPerPage,
      sortField,
      sortDirection,
      search,
      filter?.toString()
    );
  }, [
    currentPage,
    productsPerPage,
    sortField,
    sortDirection,
    search,
    filter,
    checkedItems,
  ]);

  const pagesConfig = {
    currentPage: {
      value: currentPage,
      setter: setCurrentPage,
    },
    itemsPerPage: productsPerPage,
    setItemsPerPage: setProductsPerPage,
  };

  const [checkedNames, setCheckedNames] = useState<string[]>([]);

  const handleCheck = (id: number, name: string, isChecked: boolean) => {
    if (isChecked) {
      setCheckedItems &&
        setCheckedItems((prevState) => {
          const newState = [...prevState, id];
          setCheckedNames((prevNames) => {
            // Only add name if it's not already in checkedNames
            const newNames = prevNames.includes(name)
              ? prevNames
              : [...prevNames, name];
            // Update the URL
            const urlCategories = newNames
              .map((name) => `category=${name.replace(/ /g, "-")}`)
              .join("&");
            window.history.pushState(
              { category: newState },
              "",
              `?${urlCategories}` // replace spaces with hyphens
            );
            return newNames;
          });
          return newState;
        });
    } else {
      setCheckedItems &&
        setCheckedItems((prevState) => {
          const newState = prevState.filter((itemId) => itemId !== id);
          setCheckedNames((prevNames) => {
            const newNames = prevNames.filter((itemName) => itemName !== name);
            // Update the URL
            const urlCategories = newNames
              .map((name) => `category=${name.replace(/ /g, "-")}`)
              .join("&");
            if (newNames.length > 0) {
              window.history.pushState(
                { category: newState },
                "",
                `?${urlCategories}` // replace spaces with hyphens
              );
            } else {
              window.history.pushState(
                { category: newState },
                "",
                window.location.pathname // remove ?category when no category is selected
              );
            }
            return newNames;
          });
          return newState;
        });
    }
  };

  return (
    <div className='wk-products wk-products--page'>
      <div className='container'>
        <div className='text-6xl text-front-blue text-center flex justify-center gap-7 mb-36 '>
          <FaPaw /> Os Melhores Produtos
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-4'>
          <div className='filter text-black mb-12 lg:mb-0 wk-block mr-5'>
            <h3 className='text-black text-2xl mb-8'>
              Filtrar por categorias:{" "}
            </h3>
            <div className='category-list'>
              {listCategory.map((category) => (
                <div key={category.id} className='category-item'>
                  <input
                    type='checkbox'
                    id={`checkbox-${category.id}`}
                    checked={checkedItems && checkedItems.includes(category.id)}
                    onChange={(e) =>
                      handleCheck(category.id, category.name, e.target.checked)
                    }
                    className=''
                  />
                  <label
                    className={` ${
                      checkedItems &&
                      checkedItems.includes(category.id) &&
                      "checked "
                    }`}
                    htmlFor={`checkbox-${category.id}`}>
                    <span></span>
                    <div className='category-name'>{category.name}</div>
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className='col-span-3 '>
            <div className='product-selection-header'>
              <div className='search-wrapper'>
                {/* <input
                  type='text'
                  onChange={(e) => setSearch(e.target.value)}
                /> */}
                <div className='wk-table__search-bar--wrapper'>
                  <SearchIcon className='wk-table__search-bar--icon' />
                  <input
                    className='wk-table__search-bar'
                    type='text'
                    id='search'
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={`Pesquise por Nome, Descrição etc...`}
                  />
                </div>
              </div>
              <div className='sorting-wrapper'>
                <select
                  onChange={(e) => {
                    setSortField(e.target.value);
                  }}>
                  <option value=''>Ordenar por</option>
                  <option value='name'>Nome</option>
                  <option value='description'>Descrição</option>
                  <option value='price'>Preço</option>
                  <option value='username'>Username</option>
                  <option value='sku'>SKU</option>
                  <option value='created_at'>Data de Criação</option>
                </select>
                <select
                  name=''
                  onChange={(e) => handleSortDirectionChange(e.target.value)}
                  id=''>
                  <option value=''>Ordem</option>
                  <option value='asc'>Ascendente</option>
                  <option value='desc'>Descendente</option>
                </select>
              </div>
            </div>

            <div className='wk-product-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 text-black gap-12'>
              {listProductResponse && listProductResponse.length > 0 ? (
                listProductResponse.map((product) => (
                  <div key={product.id} className='product-card'>
                    <Link
                      href={`/produtos/${product.url}-florianopolis-sao-jose-palhoca-biguacu-santo-amaro`}>
                      <div className='product-image'>
                        <img src={product.images} alt={product.name} />
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
                              ? `R$ ${parseFloat(product.price).toLocaleString(
                                  "pt-BR",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )}`
                              : "Consulte"}
                          </p>
                        </div>
                        <h3 className='product-title'>{product.name}</h3>
                      </div>
                    </Link>
                  </div>
                ))
              ) : (
                <p>Nenhum produto encontrado.</p>
              )}
            </div>
            <WkPagination
              totalNumberOfItems={totalItems}
              pages={pagesConfig}
              maxButtonsToShow={5}
              className='product-pagination'
            />
          </div>
        </div>
      </div>
    </div>
  );
}
