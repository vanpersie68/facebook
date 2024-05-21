import "./style.css";
import { ErrorMessage, useField } from "formik";
import { useMediaQuery } from "react-responsive";

export default function LoginInput({ placeholder, bottom, ...props }){
    const [field, meta] = useField(props);

    const view1 = useMediaQuery({
        query: "(min-width: 539px)",
    });
    const view2 = useMediaQuery({
        query: "(min-width: 850px)",
    });
    const view3 = useMediaQuery({
        query: "(min-width: 1170px)",
    });

    const test1 = view3 && field.name === "first_name";
    const test2 = view3 && field.name === "last_name";

    return (
        <div className="input_wrap register_input_wrap">
            <input
                className={meta.touched && meta.error ? "input_error_border" : ""}
                style={{
                    width: `${
                        view1 && (field.name === "first_name" || field.name === "last_name") 
                            ?  "100%" : view1 && (field.name === "email" || field.name === "password") ? "370px" : "300px"
                    }`,
                }}
                type={field.type}
                name={field.name}
                placeholder={placeholder}
                {...field} 
                {...props} 
            />

            {meta.touched && meta.error && (
                <div className={view3 ? "input_error input_error_desktop" : "input_error"} 
                // left的作用如果是 view3情况下，是first_name 则在输入框左侧提示错误信息 , 是last_name 则在输入框右侧提示错误信息
                    style={{ transform: "translateY(2px)", left: `${test1 ? "-107%" : test2 ? "107%" : ""}` }}>
                {meta.touched && meta.error && <ErrorMessage name={field.name} />}
                {meta.touched && meta.error && (
                    // 如果不是姓，并且视图是view3尺寸，箭头在左；如果是姓，箭头在右；如果不是view3尺寸，箭头在下
                    <div className={view3 && field.name !== "last_name" ? "error_arrow_left" : view3 && field.name === "last_name"
                    ? "error_arrow_right" : !view3 && "error_arrow_bottom"}></div>
                )}
                </div>
            )}      

            {meta.touched && meta.error && <i className="error_icon"></i>}
        </div>
    );
}