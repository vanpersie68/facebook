import { useMediaQuery } from "react-responsive";

export default function DateOfBirthSelect({bDay, bMonth, bYear, days, months, years, handleRegisterChange, dateError}){
    const view1 = useMediaQuery({
        query: "(min-width: 539px)",
    });

    const view2 = useMediaQuery({
        query: "(min-width: 850px)",
    });

    const view3 = useMediaQuery({
        query: "(min-width: 1170px)",
    });

    return (
        //marginBottom 表示当 日期和性别框出现错误时，下面的边距向下扩充 90px
        <div className="reg_grid" style={{marginBottom: `${dateError && !view3 ? "90px" : "0"}`}}>
            <select name="bDay" value={bDay} onChange={handleRegisterChange}>
                {days.map((day, i) => (
                    <option value={day} key={i}>
                        {day}
                    </option>
                ))}
            </select>
            <select name="bMonth" value={bMonth} onChange={handleRegisterChange}>
                {months.map((month, i) => (
                    <option value={month} key={i}>
                        {month}
                    </option>
                ))}
            </select>
            {/* value={bYear} 设置当前的默认值 */}
            <select name="bYear" value={bYear} onChange={handleRegisterChange}>
                {/* i 是 map 函数提供的回调函数的第二个参数，表示数组元素的索引（index）。
                这是一个自动递增的整数，从0开始，对应于数组中每个元素的位置。 */}
                {years.map((year, i) => (
                    // value={year}: 设置 <option> 的值为当前年份。key={i}: 为 React 的优化提供唯一标识。
                    <option value={year} key={i}>
                        {year}
                    </option>
                ))}
            </select>
            {dateError && (
                <div className={!view3 ? "input_error" : "input_error input_error_select_large"}>
                    <div className={!view3 ? "error_arrow_bottom" : "error_arrow_left"}></div>
                    {dateError}
                </div>
            )}
        </div>
    );
};