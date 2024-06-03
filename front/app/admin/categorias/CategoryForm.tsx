"use client";
import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import SaveIcon from "../../../public/admin-save.svg";
import Link from "next/link";
import NumberFormat from "react-number-format";
import { MdClear } from "react-icons/md";
import { Client } from "../fetchClients";
import { CreateCategoryRequest } from "./criar/page";
import { EditCategoryFormRequest } from "./[categoryid]/page";

export interface formConfigInterface {
  handleSubmit: (e: FormEvent) => void;
  setFormData: (data: CreateCategoryRequest) => void;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    setFormData: (
      data: CreateCategoryRequest | EditCategoryFormRequest
    ) => void,
    formData: CreateCategoryRequest | EditCategoryFormRequest
  ) => void;
  formData: {
    name: string;
    description: string;
  };
  submitButtonText: string;
}

export default function CategoryForm({
  formConfig,
}: {
  formConfig: formConfigInterface;
}) {
  const [selectedResultIndex, setSelectedResultIndex] = useState<number | null>(
    null
  );

  return (
    <div className='wk-form'>
      <form className='' onSubmit={formConfig.handleSubmit}>
        <h2 className='wk-form__row-title'>Informações Básicas</h2>
        <div className='wk-form__row grid grid-cols-3 gap-9 gap-y'>
          <label>
            <h4 className=''>Nome</h4>
            <input
              type='text'
              name='name'
              value={formConfig.formData.name}
              required
              placeholder='Ex: Ração'
              onChange={(e) =>
                formConfig.handleChange(
                  e,
                  formConfig.setFormData,
                  formConfig.formData
                )
              }
            />
          </label>
        </div>

        <div className='wk-form__row grid grid-cols-3 gap-9 gap-y'>
          <div className=''>
            <label>
              <h4 className=''>Descrição</h4>
              <textarea
                name='description'
                value={formConfig.formData.description}
                onChange={(e) =>
                  formConfig.handleChange(
                    e,
                    formConfig.setFormData,
                    formConfig.formData
                  )
                }
              />
            </label>
          </div>
        </div>

        <div className='wk-form__footer'>
          <button className='wk-btn wk-btn--md wk-btn--primary' type='submit'>
            {formConfig.submitButtonText || "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
