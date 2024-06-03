"use client";
import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import SaveIcon from "../../../public/admin-save.svg";
import Link from "next/link";
import NumberFormat from "react-number-format";
import { MdClear } from "react-icons/md";
import { Client } from "../fetchClients";
import { CreateSaleRequest } from "./criar/page";
import { EditSaleFormRequest } from "./[saleid]/page";

export interface formConfigInterface {
  handleSubmit: (e: FormEvent) => void;
  searchClient: string;
  setSearchClient: React.Dispatch<React.SetStateAction<string>>;
  searchResults: Client[];
  handleClientSelect: (
    client: Client,
    formData: CreateSaleRequest,
    setFormData: (data: CreateSaleRequest) => void,
    setSearchClient: (data: string) => void,
    setSearchResults: (data: Client[]) => void
  ) => void;
  formData: {
    client_id: number;
    product: string;
    price: string;
    observation: string;
  };
  setFormData: (data: CreateSaleRequest) => void;
  setSearchResults: (data: Client[]) => void;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    setDisplayPrice: (data: string) => void,
    setFormData: (data: CreateSaleRequest | EditSaleFormRequest) => void,
    formData: CreateSaleRequest | EditSaleFormRequest
  ) => void;
  displayPrice: string;
  setDisplayPrice: (data: string) => void;
  handlePriceChange: (
    value: string,
    setDisplayPrice: (data: string) => void,
    setFormData: (data: CreateSaleRequest | EditSaleFormRequest) => void,
    formData: CreateSaleRequest | EditSaleFormRequest
  ) => void;
  submitButtonText: string;
}

export default function SaleForm({
  formConfig,
}: {
  formConfig: formConfigInterface;
}) {
  const [selectedResultIndex, setSelectedResultIndex] = useState<number | null>(
    null
  );

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "ArrowDown":
        setSelectedResultIndex((prevIndex) =>
          prevIndex === null || prevIndex >= formConfig.searchResults.length - 1
            ? 0
            : prevIndex + 1
        );
        break;
      case "ArrowUp":
        setSelectedResultIndex((prevIndex) =>
          prevIndex === null || prevIndex <= 0
            ? formConfig.searchResults.length - 1
            : prevIndex - 1
        );
        break;
      case "Enter":
        event.preventDefault();
        if (selectedResultIndex !== null) {
          formConfig.handleClientSelect(
            formConfig.searchResults[selectedResultIndex],
            formConfig.formData,
            formConfig.setFormData,
            formConfig.setSearchClient,
            formConfig.setSearchResults
          );
        }
        break;
      default:
        break;
    }
  };
  return (
    <div className='wk-form'>
      <form className='' onSubmit={formConfig.handleSubmit}>
        <div className='grid grid-cols-3 gap-9 gap-y'>
          <label>
            <h4 className=''>Cliente</h4>
            <div className='flex relative'>
              <input
                type='text'
                name='search_client'
                className=''
                value={formConfig.searchClient}
                onChange={(e) => formConfig.setSearchClient(e.target.value)}
                autoComplete='off'
                placeholder='Ex: João Garcia'
                onKeyDown={handleKeyDown}
              />
              {formConfig.searchClient && (
                <MdClear
                  className='clear-icon'
                  onClick={() => formConfig.setSearchClient("")}
                />
              )}

              {formConfig.searchResults &&
                formConfig.searchResults.length > 0 && (
                  <ul className='search-results'>
                    {formConfig.searchResults.map((client, index) => (
                      <li
                        key={client.id}
                        className={
                          index === selectedResultIndex ? "selected" : ""
                        }
                        onClick={() =>
                          formConfig.handleClientSelect(
                            client,
                            formConfig.formData,
                            formConfig.setFormData,
                            formConfig.setSearchClient,
                            formConfig.setSearchResults
                          )
                        }>
                        <span> [ </span>
                        {client.id.toString().padStart(3, "0")} <span> ] </span>{" "}
                        {client.full_name}
                      </li>
                    ))}
                  </ul>
                )}
            </div>
          </label>

          <div className=''>
            <label>
              <h4 className=''>Nome do Produto</h4>
              <input
                type='text'
                name='product'
                value={formConfig.formData.product}
                onChange={(e) =>
                  formConfig.handleChange(
                    e,
                    formConfig.setDisplayPrice,
                    formConfig.setFormData,
                    formConfig.formData
                  )
                }
                placeholder='Ex: Areia para gatos'
              />
            </label>
          </div>

          <div className=''>
            <label>
              <h4 className=''>Valor</h4>
              <NumberFormat
                value={formConfig.displayPrice}
                onValueChange={(values: any) => {
                  formConfig.handlePriceChange(
                    values.value,
                    formConfig.setDisplayPrice,
                    formConfig.setFormData,
                    formConfig.formData
                  );
                }}
                thousandSeparator='.'
                decimalSeparator=','
                prefix={"R$ "}
              />
            </label>
          </div>

          <div className=''>
            <label>
              <h4 className=''>Observação</h4>
              <textarea
                name='observation'
                value={formConfig.formData.observation}
                onChange={(e) =>
                  formConfig.handleChange(
                    e,
                    formConfig.setDisplayPrice,
                    formConfig.setFormData,
                    formConfig.formData
                  )
                }
              />
            </label>
          </div>
        </div>

        <div className='wk-form__footer'>
          <Link
            className='wk-btn wk-btn--md wk-btn--default'
            href='/admin/vendas'>
            Cancelar
          </Link>
          <button className='wk-btn wk-btn--md wk-btn--primary' type='submit'>
            <SaveIcon className='wk-icon' />
            {formConfig.submitButtonText || "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
