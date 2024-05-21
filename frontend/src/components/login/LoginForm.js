/*Formik 是 React 应用程序的流行表单管理库。它通过提供实用程序和组件简化了在 React 应用程序中构建和处理表单的过程。
Formik是一个 React 表单管理库，可以帮助您完成以下任务：形成状态管理。表单验证。表单提交和处理。与 React 组件集成。 */
import {Formik, Form} from "formik";
import { Link } from "react-router-dom";
import LoginInput from "../../components/inputs/loginInput";
import { useState } from "react";
//Yup 是一个用于进行 JavaScript 对象验证的库，通常在前端表单验证中使用。使用 Yup，你可以定义验证规则，检查用户输入是否符合预期，并生成验证错误信息。
import * as Yup from "yup"; 
import DotLoader from "react-spinners/DotLoader";
import axios from "axios";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const loginInfos = {
    email: "",
    password: "",
};

export default function LoginForm({setVisible}){
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [login, setLogin] = useState(loginInfos);
    const { email, password } = login;
    const handleLoginChange = (event) => {
        //从事件对象的 target 属性中提取出输入框的 name 和 value 属性。name 表示输入框的名称，而 value 表示输入框当前的值。
        const {name, value} = event.target;
        // (...) 表示使用原始的 user 对象的所有属性，然后更新特定字段（由 name 变量指定）的值为输入框当前的值 (value)
        setLogin({ ...login, [name]: value });
    };

    //对表单中的信息进行验证
    const loginValidation = Yup.object({
        email: Yup.string().required("Email address is required.").email("Must be a valid email.").max(100),
        password: Yup.string().required("Password is required"),
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const loginSubmit = async() => {
        try {
            setLoading(true);
            const {data} = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/login`, {email, password});
            dispatch({type: "LOGIN", payload: data});
            Cookies.set("user", JSON.stringify(data));
            navigate("/");
        }catch(error){
            setLoading(false);
            setError(error.response.data.message);
        }
    };

    return (
        <div className="login_wrap">
            <div className="login_1">
                <img src="../../icons/facebook.svg" alt="" />
                <span>This is my own practice Website!</span>
            </div>

            <div className="login_2">
                <div className="login_2_wrap">
                    <Formik 
                        enableReinitialize //enableReinitialize 是 Formik 的一个配置选项，设置为 true 时，允许 Formik 在 initialValues 属性发生变化时重新初始化表单状态。这在动态更新表单初始值时非常有用。
                        initialValues={{email, password}} //initialValues 是一个包含表单字段初始值的对象。在这个例子中，它包含了 email 和 password 字段的初始值。这些值将用于初始化表单字段的状态。
                        validationSchema={loginValidation} //对表单中的信息进行验证
                        onSubmit={() => {
                            loginSubmit();
                        }}
                    >
                        {(formik) =>(
                            <Form>
                                <LoginInput 
                                    type="text"
                                    name="email"
                                    placeholder="Email address or Phone number"
                                    onChange={handleLoginChange}
                                />
                                <LoginInput 
                                    type="password"
                                    name="password" 
                                    placeholder="Password"
                                    onChange={handleLoginChange}
                                    bottom //告诉LoginInput在显示错误提示时将错误信息显示在底部
                                />
                                <button className="blue_btn" type="submit">Log In</button>
                            </Form>
                        )}
                    </Formik>
                    {/* 在 React 组件中，你可以使用 Link 组件来创建链接，指向你应用程序中的不同路由。通常，to 属性用于指定目标路由的路径。 */}
                    <Link className="forgot_password" to="/reset">Forgotten password ?</Link>

                    <DotLoader color="#1876f2" loading={loading} size={30} />
                    {error && <div className="error_text">{error}</div>}

                    <div className="sign_splitter"></div>
                    <button className="blue_btn open_signup" onClick={() => setVisible(true)}>Create Account</button>
                </div>
                <Link to="/" className="sign_extra">
                    <b>Create a Page </b>for a celebrity, brand or business
                </Link>
            </div>
        </div>
    );
}