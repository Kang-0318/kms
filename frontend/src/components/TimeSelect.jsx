import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import * as React from "react";

export default function TimeSelect({ value, onChange, label = "시간" }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <TimePicker
        label={label}
        ampm={false}
        value={value}
        onChange={onChange}
        slotProps={{ textField: { size: "small" } }}
      />
    </LocalizationProvider>
  );
}
