"use client";
import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import SaveIcon from "../../../public/admin-save.svg";
import Link from "next/link";
import NumberFormat from "react-number-format";
import { MdClear } from "react-icons/md";
import { CreateClientRequest } from "./criar/page";
import { Client } from "../fetchClients";
import { EditClientFormRequest } from "./[clientid]/page";

export interface formConfigInterface {
  handleSubmit: (e: FormEvent) => void;
  formData: {
    full_name: string;
    phone_whatsapp: string;
    phone_line: string;
    pet_name: string;
    pet_breed: string;
    address_street: string;
    address_city: string;
    address_number: string;
    address_neighborhood: string;
    address_reference: string;
  };
  setFormData: (data: CreateClientRequest) => void;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    setFormData: (data: CreateClientRequest | EditClientFormRequest) => void,
    formData: CreateClientRequest | EditClientFormRequest
  ) => void;
  submitButtonText: string;
}

export default function ClientForm({
  formConfig,
}: {
  formConfig: formConfigInterface;
}) {
  return (
    <div className='wk-form'>
      <form className='' onSubmit={formConfig.handleSubmit}>
        <h2 className='wk-form__row-title'>Informações Básicas</h2>
        <div className='wk-form__row grid grid-cols-3 gap-9 gap-y'>
          <div className=''>
            <label>
              <h4 className=''>Nome</h4>
              <input
                type='text'
                name='full_name'
                value={formConfig.formData.full_name}
                onChange={(e) =>
                  formConfig.handleChange(
                    e,
                    formConfig.setFormData,
                    formConfig.formData
                  )
                }
                placeholder='Ex: João Silva'
              />
            </label>
          </div>
          <div className=''>
            <label>
              <h4 className=''>WhatsApp</h4>
              <NumberFormat
                format='(##) # ####-####'
                isNumericString={true}
                value={formConfig.formData.phone_whatsapp}
                onValueChange={({ value }: { value: string }) =>
                  formConfig.setFormData({
                    ...formConfig.formData,
                    phone_whatsapp: value,
                  })
                }
                placeholder='Ex: (00) 9 9999-9999'
              />
            </label>
          </div>
          <div className=''>
            <label>
              <h4 className=''>Telefone</h4>
              <NumberFormat
                format='(##) ####-####'
                isNumericString={true}
                value={formConfig.formData.phone_line}
                onValueChange={({ value }: { value: string }) =>
                  formConfig.setFormData({
                    ...formConfig.formData,
                    phone_line: value,
                  })
                }
                placeholder='Ex: (00) 9999-9999'
              />
            </label>
          </div>
        </div>

        <h2 className='wk-form__row-title'>Informações do Pet</h2>
        <div className='wk-form__row grid grid-cols-3 gap-9 gap-y'>
          <div className=''>
            <label>
              <h4 className=''>Nome do Pet</h4>
              <input
                type='text'
                name='pet_name'
                value={formConfig.formData.pet_name}
                onChange={(e) =>
                  formConfig.handleChange(
                    e,
                    formConfig.setFormData,
                    formConfig.formData
                  )
                }
                placeholder='Ex: Max'
              />
            </label>
          </div>
          <div className=''>
            <label>
              <h4 className=''>Raça do Pet</h4>
              <input
                type='text'
                name='pet_breed'
                value={formConfig.formData.pet_breed}
                onChange={(e) =>
                  formConfig.handleChange(
                    e,
                    formConfig.setFormData,
                    formConfig.formData
                  )
                }
                placeholder='Ex: Labrador'
              />
            </label>
          </div>
        </div>

        <h2 className='wk-form__row-title'>Endereço</h2>
        <div className='wk-form__row grid grid-cols-8 gap-9 gap-y'>
          <div className=' col-span-2'>
            <label>
              <h4 className=''>Rua</h4>
              <input
                type='text'
                name='address_street'
                value={formConfig.formData.address_street}
                onChange={(e) =>
                  formConfig.handleChange(
                    e,
                    formConfig.setFormData,
                    formConfig.formData
                  )
                }
                placeholder='Ex: Rua das Flores'
              />
            </label>
          </div>
          <div className='col-span-2'>
            <label>
              <h4 className=''>Número</h4>
              <input
                type='text'
                name='address_number'
                value={formConfig.formData.address_number}
                onChange={(e) =>
                  formConfig.handleChange(
                    e,
                    formConfig.setFormData,
                    formConfig.formData
                  )
                }
                placeholder='Ex: 123'
              />
            </label>
          </div>
          <div className='col-span-2'>
            <label>
              <h4 className=''>Bairro</h4>
              <input
                type='text'
                name='address_neighborhood'
                value={formConfig.formData.address_neighborhood}
                onChange={(e) =>
                  formConfig.handleChange(
                    e,
                    formConfig.setFormData,
                    formConfig.formData
                  )
                }
                placeholder='Ex: Bela Vista'
              />
            </label>
          </div>
          <div className=' col-span-2'>
            <label>
              <h4 className=''>Cidade</h4>
              <input
                type='text'
                name='address_city'
                value={formConfig.formData.address_city}
                onChange={(e) =>
                  formConfig.handleChange(
                    e,
                    formConfig.setFormData,
                    formConfig.formData
                  )
                }
                placeholder='Ex: Palhoça'
              />
            </label>
          </div>
          <div className='col-span-3'>
            <label>
              <h4 className=''>Referência</h4>
              <textarea
                name='address_reference'
                value={formConfig.formData.address_reference}
                onChange={(e) =>
                  formConfig.handleChange(
                    e,
                    formConfig.setFormData,
                    formConfig.formData
                  )
                }
                placeholder='Ex: Próximo ao mercado'
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
