import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import * as React from "react";

/**
 * props:
 *  - value: dayjs | null
 *  - onChange: (dayjs|null) => void
 *  - label?: string
 */
export default function TimeSelect({ value, onChange, label = "시간" }) {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
                label={label}
                ampm={false}                 // 24시간제
                value={value}
                onChange={onChange}
                // 분 단위 간격: 5분/10분 등 필요시 열어주세요
                // minutesStep={5}
                slotProps={{
                    textField: { size: "small" } // 입력창 크기
                }}
            />
        </LocalizationProvider>
    );
}
