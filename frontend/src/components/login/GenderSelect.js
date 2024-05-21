import { useMediaQuery } from "react-responsive";

export default function GenderSelect({handleRegisterChange, genderError}){
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
        //marginBottom 表示当 日期和性别框出现错误时，下面的边距向下扩充 70px
        <div className="reg_grid" style={{marginBottom: `${genderError && !view3 ? "70px": "0"}`}}>
            <label htmlFor="male">
                Male
                <input 
                    type="radio"
                    name="gender"
                    id="male"
                    value="male"
                    onChange={handleRegisterChange}
                />
            </label>
            <label htmlFor="female">
                Female
                <input 
                    type="radio"
                    name="gender"
                    id="female"
                    value="female"
                    onChange={handleRegisterChange}
                />
            </label>
            <label htmlFor="custom">
                Custom
                <input 
                    type="radio"
                    name="gender"
                    id="custom"
                    value="custom"
                    onChange={handleRegisterChange}
                />
            </label>
            {genderError && (
                <div className={ !view3 ? "input_error" : "input_error input_error_select_large"}>
                    <div className={ !view3 ? "error_arrow_bottom" : "error_arrow_left"}> </div>
                    {genderError}
                </div>
            )}
        </div>
    );
}