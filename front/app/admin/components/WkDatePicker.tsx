import {
  DateRangePicker,
  DateRangePickerItem,
  DateRangePickerValue,
} from "@tremor/react";
import { useState } from "react";
import { ptBR } from "date-fns/locale";

interface datePickerConfig {
  setCheckedItems: (value: number[]) => void;
  getItemsFromDateRange: (from: string, to: string) => void;
}

export default function WkDatePicker({
  setCheckedItems,
  getItemsFromDateRange,
}: datePickerConfig) {
  const [value, setValue] = useState<DateRangePickerValue>({});

  return (
    <DateRangePicker
      className='max-w-md mx-auto'
      value={value}
      locale={ptBR}
      placeholder='Selecione por período'
      onValueChange={(newValue) => {
        setValue(newValue);
        if (newValue.from && newValue.to) {
          const from = newValue.from.toISOString();
          newValue.to.setHours(23, 59, 59, 999);
          const to = newValue.to.toISOString();

          getItemsFromDateRange(from, to);
        }
      }}
      selectPlaceholder='Selecionar'
      color='rose'>
      <DateRangePickerItem key='ytd' value='ytd' from={new Date(2023, 0, 1)}>
        Ultimo ano
      </DateRangePickerItem>
      <DateRangePickerItem
        key='week'
        value='week'
        from={new Date(new Date().setDate(new Date().getDate() - 7))}>
        Ultima semana
      </DateRangePickerItem>
      <DateRangePickerItem
        key='month'
        value='month'
        from={new Date(new Date().setMonth(new Date().getMonth() - 1))}>
        Ultimo mês
      </DateRangePickerItem>
      <DateRangePickerItem
        key='6months'
        value='6months'
        from={new Date(new Date().setMonth(new Date().getMonth() - 6))}>
        Ultimos 6 meses
      </DateRangePickerItem>
    </DateRangePicker>
  );
}
