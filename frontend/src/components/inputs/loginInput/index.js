import "./style.css";
import { ErrorMessage, useField } from "formik";
//使用了 React Responsive 库中的 useMediaQuery 钩子。这个库用于在 React 应用中处理响应式设计，特别是根据不同的媒体查询（例如屏幕宽度）来动态调整组件的渲染或行为
import { useMediaQuery } from "react-responsive";

export default function LoginInput({ placeholder, bottom, ...props }){
    //使用 useField 钩子从 Formik 中获取表单字段的状态信息，其中 field 包含有关字段的属性，meta 包含有关字段的元信息（例如，是否被触摸过、是否有错误等)。
    const [field, meta] = useField(props);

    const desktopView = useMediaQuery({
        query: "(min-width: 850px)", //当视口宽度大于或等于 850 像素时，desktopView 将返回 true，否则返回 false
    });

    return (
        <div className="input_wrap">
            {/* meta.touched: 表示表单字段是否被触摸过，即用户是否在输入框中进行了交互。
                meta.error: 表示表单字段是否有验证错误。
                !bottom: 表示不在底部显示错误。 

                这是一个条件渲染的开始，只有当 meta.touched 为真（用户已经触摸过输入框）、
                meta.error 为真（存在验证错误）、!bottom 为真时，才会执行后面的代码块。*/}
            {/* 针对于邮箱错误的 */}
            {meta.touched && meta.error && !bottom && ( 
                //如果满足条件，就会渲染一个带有样式和类名的 <div> 元素，用于显示错误提示框。样式 transform: "translateY(3px)" 可能是用来微调提示框的位置。
                <div className={desktopView ? "input_error input_error_desktop" : "input_error"} style={{ transform: "translateY(3px)" }}>
                    {/* 如果存在触摸过的错误，并且有验证错误，就会渲染 ErrorMessage 组件。这个组件通常用于显示与字段验证相关的错误消息。 */}
                    {meta.touched && meta.error && <ErrorMessage name={field.name} />}
                    {/* 如果存在触摸过的错误，并且有验证错误，就会渲染一个表示错误的箭头，可能是为了强调错误的位置或提供更直观的反馈。 */}
                    {meta.touched && meta.error && (
                        <div className={desktopView ? "error_arrow_left" : "error_arrow_top"}></div>
                    )}
                </div>
            )}

            <input
                className={meta.touched && meta.error ? "input_error_border" : ""}
                type={field.type}
                name={field.name}
                placeholder={placeholder}
                {...field} //将 field 对象中的属性应用到输入框上，包括 value、onChange、onBlur 等。
                {...props} //将传递给组件的其他属性应用到输入框上。
            />

            {/* 针对于密码错误的 */}
            {meta.touched && meta.error && bottom && (
                <div className={desktopView ? "input_error input_error_desktop" : "input_error"} style={{ transform: "translateY(2px)" }}>
                {meta.touched && meta.error && <ErrorMessage name={field.name} />}
                {meta.touched && meta.error && (
                    <div className={desktopView ? "error_arrow_left" : "error_arrow_bottom"}></div>
                )}
                </div>
            )}      

            {meta.touched && meta.error && (
                <i className="error_icon" style={{ top: `${!bottom && !desktopView ? "63%" : "15px"}` }}></i>
            )}
        </div>
    );
}