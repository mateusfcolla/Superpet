import { PagesConfig } from "./WkTable";
import RightArrow from "../../../public/right-arrow.svg";
import RightArrowDouble from "../../../public/right-arrow-double.svg";
import LeftArrow from "../../../public/left-arrow.svg";
import LeftArrowDouble from "../../../public/left-arrow-double.svg";

interface PaginationConfig {
  totalNumberOfItems: number;
  pages: PagesConfig;
  maxButtonsToShow: number;
  className?: string;
}

export default function WkPagination({
  totalNumberOfItems,
  pages,
  maxButtonsToShow,
  className,
}: PaginationConfig) {
  const totalPages = Math.ceil(totalNumberOfItems / pages.itemsPerPage);
  const buttons: JSX.Element[] = [];

  if (totalPages <= maxButtonsToShow) {
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          className={`wk-pagination__button ${
            pages.currentPage.value === i ? "wk-pagination__button--active" : ""
          }`}
          onClick={() => pages.currentPage.setter(i)}
          disabled={pages.currentPage.value === i}>
          {i}
        </button>
      );
    }
  } else {
    const startPage = Math.max(
      1,
      pages.currentPage.value - Math.floor(maxButtonsToShow / 2)
    );
    const endPage = Math.min(totalPages, startPage + maxButtonsToShow - 1);

    if (startPage > 1) {
      buttons.push(
        <button
          key='first'
          className='wk-pagination__button wk-pagination__button--arrow'
          onClick={() => pages.currentPage.setter(1)}>
          <LeftArrowDouble />
        </button>
      );

      buttons.push(
        <button
          key='prev'
          className='wk-pagination__button wk-pagination__button--arrow'
          onClick={() => pages.currentPage.setter(pages.currentPage.value - 1)}>
          <LeftArrow />
        </button>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          className={`wk-pagination__button ${
            pages.currentPage.value === i ? "wk-pagination__button--active" : ""
          }`}
          onClick={() => pages.currentPage.setter(i)}
          disabled={pages.currentPage.value === i}>
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      buttons.push(
        <button
          key='next'
          className='wk-pagination__button wk-pagination__button--arrow'
          onClick={() => pages.currentPage.setter(pages.currentPage.value + 1)}>
          <RightArrow />
        </button>
      );

      buttons.push(
        <button
          key='last'
          className='wk-pagination__button wk-pagination__button--arrow'
          onClick={() => pages.currentPage.setter(totalPages)}>
          <RightArrowDouble />
        </button>
      );
    }
  }

  return (
    <div className={`wk-pagination ${className ? className : ""}`}>
      {buttons}
    </div>
  );
}
