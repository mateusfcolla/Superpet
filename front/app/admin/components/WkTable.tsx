import EditIcon from "../../../public/admin-edit.svg";
import DuplicateIcon from "../../../public/admin-duplicate.svg";
import ReportIcon from "../../../public/admin-report.svg";
import SearchIcon from "../../../public/admin-search.svg";
import DeleteColor from "../../../public/admin-delete-color.svg";
import ReportIconAlt from "../../../public/admin-report-alt.svg";
import ArrowUp from "../../../public/admin-arrow-up.svg";
import DateIcon from "../../../public/admin-date.svg";
import { CheckIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { FormEvent, useState } from "react";
import ModalAreYouSure from "./ModalAreYouSure";
import { BiSolidUpArrow, BiSolidDownArrow } from "react-icons/bi";
import WkPagination from "./WkPagination";
import { toast } from "react-toastify";
import WkDatePicker from "./WkDatePicker";
import WkButton from "./WkButton";
export interface checkedInPageConfig {
  whichPages: number[];
}

export interface TableColumn {
  title: string;
  key: string;
  sortable: boolean;
  width: number;
  styles?: string;
  items: any[];
}

export interface InteractConfig {
  edit?: boolean | string[];
  duplicate?: boolean;
  delete?: deleteButtonConfig;
  report?: reportButtonConfig;
}

export interface buttonConfig {
  eventFunction: (id: number) => Promise<void>;
  items: number[];
  multipleFunction?: (ids: number[], typeOfPdf: string) => Promise<void>;
}

export interface deleteButtonConfig extends buttonConfig {
  isAssociated?: {
    isAssociated: boolean;
    message: string;
  };
  multipleFunction?: (ids: number[]) => Promise<void>;
}

export interface reportButtonConfig extends buttonConfig {
  isDocumentLoading: boolean;
}

export interface PagesConfig {
  currentPage: {
    value: number;
    setter: (value: number) => void;
  };
  itemsPerPage: number;
  setItemsPerPage: (value: number) => void;
}

export interface TableConfig {
  topClasses?: string;
  columns: TableColumn[];
  interact?: InteractConfig;
  totalNumberOfItems: number;
  pages?: PagesConfig;
  sortInfo?: SortInfo;
  searchBar?: SearchBarConfig;
  checkbox?: CheckboxConfig;
  checkAll?: CheckedAllConfig;
  dateRange?: { getItemsFromDateRange: (from: string, to: string) => void };
}

export interface CheckedAllConfig {
  handleCheckAll: () => void;
  allChecked: boolean;
}

export interface CheckboxConfig {
  checkedItems: number[];
  setCheckedItems: (value: number[]) => void;
  handleCheck: (id: number, isChecked: boolean) => void;
  items?: number[];
  handleCheckAllInPage?: (currentPageProp: number) => void;
  allCheckedInPage?: number[];
  setAllCheckedInPage?: (value: number[]) => void;
}
export interface SearchBarConfig {
  search: string;
  setSearch: (value: string) => void;
  placeholder?: string;
}
export interface SortInfo {
  field: string | null;
  direction: string | null;
  handleSort: (field: string) => void;
}

interface ListItemsResponse {
  config: TableConfig;
  className?: string;
}

export default function WkTable({ config, className }: ListItemsResponse) {
  //helper function
  const toasterFunction = (
    executeFunction: Promise<unknown> | (() => Promise<unknown>)
  ) => {
    toast.promise(executeFunction, {
      pending: {
        render: "Carregando documento...",
        type: toast.TYPE.INFO,
      },
      success: {
        render: "Documento carregado com sucesso!",
        type: toast.TYPE.SUCCESS,
      },
      error: {
        render: "Erro ao carregar documento.",
        type: toast.TYPE.ERROR,
      },
    });
  };
  const createOnClickHandler = (reportType: string) => () => {
    if (
      config.interact &&
      config.interact.report &&
      config.interact.report.multipleFunction &&
      config.checkbox &&
      config.checkbox.checkedItems.length > 0
    ) {
      toasterFunction(
        config.interact.report.multipleFunction(
          config.checkbox.checkedItems,
          reportType
        )
      );
    }
  };

  const [isWindowOpen, setIsWindowOpen] = useState(false);

  return (
    <>
      <div className='wk-table__sorting-header'>
        {config.searchBar ? (
          <div className='wk-table__search-bar--wrapper'>
            <SearchIcon className='wk-table__search-bar--icon' />
            <input
              className='wk-table__search-bar'
              type='text'
              id='search'
              value={config.searchBar.search}
              onChange={(e) =>
                config.searchBar && config.searchBar.setSearch(e.target.value)
              }
              placeholder={`${config.searchBar.placeholder || "Pesquisar..."}`}
            />
          </div>
        ) : (
          ""
        )}
        {config.checkAll ? (
          <div className='wk-table__buttons--wrapper'>
            <WkButton
              className='wk-btn wk-btn--sm wk-btn--default'
              onClick={config.checkAll.handleCheckAll}>
              <CheckIcon className='' />
              {config.checkAll.allChecked ||
              (config.checkbox && config.checkbox.checkedItems.length > 0)
                ? "Desmarcar todos"
                : "Marcar todos"}
            </WkButton>
          </div>
        ) : (
          ""
        )}
        {config.dateRange ? (
          <div className='wk-table__date-range--wrapper'>
            <WkDatePicker
              setCheckedItems={
                config.checkbox ? config.checkbox.setCheckedItems : () => {}
              }
              getItemsFromDateRange={config.dateRange.getItemsFromDateRange}
            />
          </div>
        ) : (
          ""
        )}
      </div>

      <table
        className={`wk-table ${className || ""} ${config.topClasses || ""}`}>
        <tbody>
          <tr className='wk-table__header-row'>
            {config.checkbox ? (
              <th className='wk-table__header wk-table__header--checkbox checkbox'>
                <input
                  id='tophead'
                  type='checkbox'
                  className={`${
                    config.checkAll && config.checkAll.allChecked
                      ? "cursor-default"
                      : ""
                  }`}
                  onChange={() =>
                    config.checkbox &&
                    config.checkbox.handleCheckAllInPage &&
                    config.checkbox.handleCheckAllInPage(
                      config.pages?.currentPage.value || 1
                    )
                  }
                  checked={
                    config.checkbox &&
                    config.checkbox.allCheckedInPage &&
                    config.checkbox.allCheckedInPage.includes(
                      config.pages?.currentPage.value || 1
                    )
                  }
                  disabled={config.checkAll && config.checkAll.allChecked}
                />

                <label htmlFor='tophead'>
                  <span
                    className={`${
                      config.checkAll && config.checkAll.allChecked
                        ? "!cursor-default !opacity-30"
                        : ""
                    }`}></span>
                </label>
              </th>
            ) : (
              ""
            )}
            {config.columns.map((column) => (
              <th
                key={column.key}
                className={`wk-table__header wk-table__header--${column.key} ${
                  column.sortable
                    ? "cursor-pointer wk-table__header--sortable"
                    : ""
                }`}
                onClick={() =>
                  column.sortable &&
                  config.sortInfo &&
                  config.sortInfo.handleSort(column.key)
                }
                style={{ width: `${column.width}%` }}>
                <div className='wk-table__header--wrapper'>
                  {column.title}
                  {column.sortable ? (
                    <span className={`wk-table__header--sortable `}>
                      <BiSolidUpArrow
                        className={`wk-table__header--sortable--up ${
                          config.sortInfo?.field === column.key &&
                          (config.sortInfo?.direction === "asc"
                            ? "wk-table__header--sortable--up--active"
                            : "")
                        } }`}
                      />
                      <BiSolidDownArrow
                        className={`wk-table__header--sortable--down ${
                          config.sortInfo?.field === column.key &&
                          (config.sortInfo?.direction === "desc"
                            ? "wk-table__header--sortable--down--active"
                            : "")
                        } }
                        }`}
                      />
                    </span>
                  ) : (
                    ""
                  )}
                </div>
              </th>
            ))}
            {config.interact ? (
              <th className='wk-table__header wk-table__header--interact'></th>
            ) : (
              ""
            )}
          </tr>

          {config.columns[0].items.length > 0 ? (
            config.columns[0].items.map((item, index) => (
              <tr
                key={index}
                className={`wk-table__row wk-table__item-row wk-table__row--${
                  index % 2 === 0 ? "even" : "odd"
                }`}
                onDoubleClick={() => { window.location.href = config.interact && config.interact.edit && Array.isArray(config.interact.edit) ? config.interact.edit[index] : "" } }
                >
                {config.checkbox ? (
                  <td className='wk-table__td wk-table__td--checkbox'>
                    <input
                      type='checkbox'
                      id={`checkbox-${
                        config.checkbox.items && config.checkbox.items[index]
                      }`}
                      checked={config.checkbox.checkedItems.includes(
                        config.checkbox.items ? config.checkbox.items[index] : 0
                      )}
                      onChange={(e) =>
                        config.checkbox &&
                        config.checkbox.items &&
                        config.checkbox.handleCheck(
                          config.checkbox.items[index],
                          e.target.checked
                        )
                      }
                    />
                    <label
                      htmlFor={`checkbox-${
                        config.checkbox.items && config.checkbox.items[index]
                      }`}>
                      <span></span>
                    </label>
                  </td>
                ) : (
                  ""
                )}
                {config.columns.map((column) => (
                  <td
                    key={column.key}
                    className={`wk-table__td wk-table__td--${column.key} ${
                      column.styles || ""
                    }`}>
                    {column.items[index]}
                  </td>
                ))}
                {config.interact ? (
                  <td className='wk-table__td wk-table__td--interact'>
                    <div className='wk-table__td--interact__wrapper'>
                      {config.interact && config.interact.report ? (
                        <button
                          className='wk-table__td--interact__report-button'
                          onClick={() => {
                            config.interact &&
                              config.interact.report &&
                              toasterFunction(
                                config.interact.report.eventFunction(
                                  config.interact.report.items[index]
                                )
                              );
                          }}
                          disabled={config.interact.report.isDocumentLoading}>
                          <ReportIcon />
                        </button>
                      ) : (
                        ""
                      )}
                      {config.interact.edit ? (
                        Array.isArray(config.interact.edit) ? (
                          <Link href={config.interact.edit[index]}>
                            <EditIcon />
                          </Link>
                        ) : (
                          ""
                        )
                      ) : (
                        ""
                      )}
                      {config.interact.duplicate ? (
                        <a className=''>
                          <DuplicateIcon />
                        </a>
                      ) : (
                        ""
                      )}
                      {config.interact && config.interact.delete ? (
                        <ModalAreYouSure
                          deleteFunction={config.interact.delete.eventFunction}
                          deleteIndex={config.interact.delete.items[index]}
                          isAssociated={config.interact.delete.isAssociated}
                        />
                      ) : (
                        ""
                      )}
                    </div>
                  </td>
                ) : (
                  ""
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={config.columns.length + 1} className='wk-table__td'>
                Nenhum resultado encontrado
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {config.pages ? (
        <div className='wk-pagination-wrapper'>
          <WkPagination
            totalNumberOfItems={config.totalNumberOfItems}
            pages={config.pages}
            maxButtonsToShow={7}
          />
          <input
            className='wk-pagination__clients-per-page-input'
            type='number'
            id='clientsPerPage'
            value={config.pages.itemsPerPage}
            onChange={(e) => {
              if (config.pages) {
                config.pages.setItemsPerPage(Number(e.target.value));
              }
              if (config.checkbox && config.checkbox.setAllCheckedInPage) {
                config.checkbox.setAllCheckedInPage([]);
              }
            }}
            min={5}
            max={100}
          />
        </div>
      ) : (
        ""
      )}

      {config.checkbox ? (
        <div
          className={`wk-table__footer  ${
            config.checkbox.checkedItems.length === 0 ? "!-bottom-44" : ""
          } `}>
          <div className='wk-table__footer-items-quantity'>
            <ArrowUp />
            {config.checkbox.checkedItems.length}
          </div>
          {config.interact && config.interact.report ? (
            <button
              onClick={createOnClickHandler("simple")}
              disabled={config.interact.report.isDocumentLoading}
              className='wk-btn wk-btn--sm wk-btn--default'>
              <ReportIconAlt />
              Gerar Relatório de Vendas
            </button>
          ) : (
            ""
          )}
          {config.interact && config.interact.report ? (
            <button
              onClick={createOnClickHandler("delivery")}
              disabled={config.interact.report.isDocumentLoading}
              className='wk-btn wk-btn--sm wk-btn--default'>
              <ReportIcon />
              Gerar Notas de Entrega
            </button>
          ) : (
            ""
          )}
          {config.interact &&
          config.interact.delete &&
          config.interact.delete.multipleFunction ? (
            <ModalAreYouSure
              deleteMultiple={config.interact.delete.multipleFunction}
              deleteMultipleIds={config.checkbox.checkedItems}
              buttonStyle='wk-btn wk-btn--sm wk-btn--default'
              ButtonIcon={DeleteColor}
              buttonText='Excluir selecionados'
            />
          ) : (
            ""
          )}
        </div>
      ) : (
        ""
      )}
    </>
  );
}
