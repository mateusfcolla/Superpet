import Cookies from "js-cookie";
import { useEffect, useState } from "react";

interface ListCategoryResponse {
  total: number;
  categories: Category[];
}

interface Category {
  id: number;
  name: string;
  description: string;
}

export const submitAssociatedCategories = async (
  productId: number,
  checkedItems: number[],
  initialCheckedItems: number[]
) => {
  const token = Cookies.get("access_token");
  const url = `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/link_categories/multiple/${productId}`;

  // Determine which categories to associate and disassociate
  const categoriesToAssociate = checkedItems.filter(
    (id) => !initialCheckedItems.includes(id)
  );
  const categoriesToDisassociate = initialCheckedItems.filter(
    (id) => !checkedItems.includes(id)
  );

  // Convert categories to an array of objects
  const categoryObjectsToAssociate = categoriesToAssociate.map((id) => ({
    id,
  }));

  // Associate new categories
  if (categoryObjectsToAssociate.length > 0) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ categories: categoryObjectsToAssociate }),
      });

      if (!response.ok) {
        console.error("Failed to associate categories");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  // Disassociate removed categories
  if (categoriesToDisassociate.length > 0) {
    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ category_ids: categoriesToDisassociate }),
      });

      if (!response.ok) {
        console.error("Failed to disassociate categories");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
};

export interface CategoryBoxProps {
  setCheckedItems?: React.Dispatch<React.SetStateAction<number[]>>;
  setInitialCheckedItems?: React.Dispatch<React.SetStateAction<number[]>>;
  checkedItems?: number[];
  initialCheckedItems?: number[];
}

export default function CategoryBox({
  setCheckedItems,
  setInitialCheckedItems,
  checkedItems,
  initialCheckedItems,
}: CategoryBoxProps) {
  const [totalItems, setTotalItems] = useState<number>(0);
  const [ListCategoryResponse, setListCategoryResponse] = useState<Category[]>(
    []
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [categoriesPerPage, setCategoriesPerPage] = useState<number>(50);
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  /* const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [initialCheckedItems, setInitialCheckedItems] = useState<number[]>([]); */
  /* const setCheckedItems = setCheckedItems;
  const setInitialCheckedItems = setInitialCheckedItems;
  const checkedItems = checkedItems;
  const initialCheckedItems = initialCheckedItems; */

  const token = Cookies.get("access_token");
  async function fetchCategories(
    pageId: number,
    pageSize: number
  ): Promise<void> {
    try {
      let url = `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/categories?page_id=${pageId}&page_size=${pageSize}`;

      /*  if (sortField && sortDirection) {
        url += `&sort_field=${sortField}&sort_direction=${sortDirection}`;
      }

      if (search) {
        url += `&search=${search}`;
      } */
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        //const data: ListProductResponse = await response.json();
        const data: ListCategoryResponse = await response.json();
        setListCategoryResponse(data.categories);

        setTotalItems(data.total);
      } else {
        console.error("Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      //setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories(currentPage, categoriesPerPage);
  }, [currentPage, categoriesPerPage]);

  async function createCategory(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    try {
      let url = `${process.env.NEXT_PUBLIC_SUPERPET_DELIVERY_URL}:8080/categories`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newCategoryName,
          description: "",
        }),
      });

      if (response.ok) {
        setNewCategoryName("");
        setShowAddCategoryForm(false);
        fetchCategories(currentPage, categoriesPerPage);
      } else {
        console.error("Falha ao criar categoria");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
  /*  useEffect(() => {
    getAssociatedImages &&
      getAssociatedImages({
        currentId,
        setImages,
        setCheckedItems,
        setInitialCheckedItems,
      });
  }, []); */

  const handleCheck = (id: number, isChecked: boolean) => {
    if (isChecked) {
      setCheckedItems &&
        setCheckedItems((prevState) => {
          const newState = [...prevState, id];

          return newState;
        });
    } else {
      setCheckedItems &&
        setCheckedItems((prevState) => {
          const newState = prevState.filter((itemId) => itemId !== id);

          return newState;
        });
    }
  };

  return (
    <div className='category-box'>
      <div className='category-list'>
        {ListCategoryResponse.map((category) => (
          <div key={category.id} className='category-item'>
            <input
              type='checkbox'
              id={`checkbox-${category.id}`}
              checked={checkedItems && checkedItems.includes(category.id)}
              onChange={(e) => handleCheck(category.id, e.target.checked)}
              className=''
            />
            <label
              className={` ${
                checkedItems && checkedItems.includes(category.id) && "checked "
              }`}
              htmlFor={`checkbox-${category.id}`}>
              <span></span>
              <div className='category-name'>{category.name}</div>
            </label>
          </div>
        ))}
      </div>
      {!showAddCategoryForm && (
        <button
          className='text-wk-secondary add-new-category-btn'
          onClick={(e) => {
            e.stopPropagation();
            setShowAddCategoryForm(true);
          }}>
          Adicionar nova categoria
        </button>
      )}
      {showAddCategoryForm && (
        <form className='w-full' onSubmit={createCategory}>
          <label className='mb-4'>
            <input
              placeholder='Nome da categoria'
              type='text'
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
          </label>
          <div className='mt-4 flex gap-7 flex-row '>
            <button
              className='wk-btn wk-btn--sm wk-btn--primary w-1/2'
              type='submit'>
              Salvar
            </button>

            <button
              className='wk-btn wk-btn--sm wk-btn--danger w-1/2'
              type='button'
              onClick={(e) => {
                e.stopPropagation();
                setShowAddCategoryForm(false);
              }}>
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
