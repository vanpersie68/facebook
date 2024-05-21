import { Form, Formik } from "formik";
import { useState } from "react";
import RegisterInput from "../inputs/registerInput";
import * as Yup from "yup"; 
import DateOfBirthSelect from "./DateOfBirthSelect";
import GenderSelect from "./GenderSelect";
import axios from "axios";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import DotLoader from "react-spinners/DotLoader";

export default function RegisterForm({setVisible}){
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const userInfos = {
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        bYear: new Date().getFullYear(),
        bMonth: new Date().getMonth() + 1, //在javascript中月份是从1开始的，所以要加1
        bDay: new Date().getDate(),
        gender: "", 
    };

    const [user, setUser] = useState(userInfos);
    //使用解构赋值从 user 状态中提取了各个属性的值。这些值分别存储在对应的变量中，比如 first_name 存储了 user 对象中的 first_name 属性的值。
    const {first_name, last_name, email, password, bYear, bMonth, bDay, gender} = user;
    const handleRegisterChange = (event) => {
        const {name, value} = event.target;
        setUser({ ...user, [name]: value});
    };

    const yearTemp = new Date().getFullYear();
    /*Array.from 是一个用于从类数组对象或可迭代对象创建新数组的静态方法。它的第一个参数是一个类数
    组对象或可迭代对象，第二个参数是一个映射函数，用于对数组中的每个元素进行处理, 对于数组中的每个元素，
    该函数会计算 bYear - index 的值，其中 index 是元素在数组中的索引。这样就生成了一个递减的年份序列*/
    const years = Array.from(new Array(108), (value, index) => yearTemp - index);
    const months = Array.from(new Array(12), (value, index) => 1 + index);
    //getDays 函数返回给定年份和月份的最后一天的日期
    const getDays = () => {
        return new Date(bYear, bMonth, 0).getDate();
    };
    const days = Array.from(new Array(getDays()), (val, index) => 1 + index);

    const RegisterValidation = Yup.object({
        first_name: Yup.string().required("What is your First name?").min(2, "First name must between 2 and 16 characters.").max(16, "First name must between 2 and 16 characters.").matches(/^[aA-zZ\s]+$/, "Numbers and special characters are not allowed."),
        last_name: Yup.string().required("What is your Last name?").min(2, "Last name must between 2 and 16 characters.").max(16, "Last name must between 2 and 16 characters.").matches(/^[aA-zZ\s]+$/, "Numbers and special characters are not allowed."),
        email: Yup.string().required("You'll need this when you log in and if you ever read to reset your password.").email("Enter a valid email address."),
        password: Yup.string().required("Enter a combination of at least six numbers letters and punctuation marks(such as ! and &).").min(6, "Password must be at least 6 characters.").max(36, "Password can't be more than 36 characters."),
    });

    const [dateError, setDateError] = useState("");
    const [genderError, setGenderError] = useState("");
    //用来接受后端已经设定的 传过来的失败信息
    const [error, setError] = useState("");
    //用来接受后端已经设定的 传过来的成功信息
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const registerSubmit = async() => {
        try {
            const {data} = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/register`, {first_name, last_name, email, password, bYear, bMonth, bDay, gender});
            setSuccess(data.message);
            setError("");
            /* 这行代码使用了解构赋值语法，从一个对象 data 中提取了名为 message 的属性，并将其赋值给变量 message，同时使用剩余属性（rest）
            将对象中除了 message 属性之外的所有属性收集到一个新的对象 rest 中。*/
            const {message, ...rest} = data;
            //目的是为了让用户看到成功or失败的消息，故意在页面休眠两秒
            setTimeout(() => {
                //调用 dispatchEvent 发送一个名为 "LOGIN" 的事件，带有 test 作为 payload。这可能是派发给 Redux 或其他状态管理工具的操作。
                dispatch({type: "LOGIN", payload: rest});
                Cookies.set("user", JSON.stringify(rest)); //将用户信息存储在 Cookies 中，其中 JSON.stringify(rest) 将用户信息转换为 JSON 格式。
                navigate("/"); //将用户重定向到应用的根路径。
            }, 2000);
        } catch(error){
            setSuccess("");
            setError(error.response.data.message);
            setLoading(false);
        }
    };

    return(
        <div className="blur">
            <div className="register">
                <div className="register_header">
                    <i className="exit_icon" onClick={() => setVisible(false)}></i>
                    <span>Sign up</span>
                    <span>It is quick and easy</span>
                </div>
            
                <Formik 
                    enableReinitialize 
                    initialValues={{first_name, last_name, email, password, bYear, bMonth, bDay, gender}}
                    validationSchema={RegisterValidation} 
                    onSubmit={() => {
                        let current_date = new Date();
                        let picked_date = new Date(bYear, bMonth - 1, bDay);
                        let atLeast14 = new Date(1970 + 14, 0, 1); 
                        let noMoreThan70 = new Date(1970 + 70, 0, 1);
                        
                        /* 计算的是 现在的时间 - 选择的时间 的毫秒数；因为javascript中年份的开始日期是1970年1月1日。所以我们计算
                        1984 的毫秒数，就可以得出14年的毫秒数的数值是多少，然后比较两者的大小，就知道用户的年龄是否小于14周岁。
                         */
                        if(current_date - picked_date < atLeast14) {
                            setDateError( "It looks like you've enetered the wrong info. Please make sure that you use your real date of birth.");
                        } else if(current_date - picked_date > noMoreThan70){
                            setDateError( "It looks like you've enetered the wrong info. Please make sure that you use your real date of birth.");
                        } else if(gender === ""){
                            setDateError("");
                            setGenderError("Please choose a gender. You can change who can see this later");
                        } else{
                            setDateError("");
                            setGenderError("");
                            registerSubmit();
                        }
                    }}
                >
                    {(formik) => (
                        <Form className="register_form">
                            <div className="reg_line">
                                <RegisterInput
                                    type="text"
                                    placeholder="First name"
                                    name="first_name"
                                    onChange={handleRegisterChange}
                                />
                                <RegisterInput 
                                    type="text"
                                    placeholder="Surname"
                                    name="last_name"
                                    onChange={handleRegisterChange}
                                />
                            </div>
                            <div className="reg_line">
                                <RegisterInput
                                    type="text"
                                    placeholder="Mobile number or email address"
                                    name="email"
                                    onChange={handleRegisterChange}
                                />
                            </div>
                            <div className="reg_line">
                                <RegisterInput
                                    type="password"
                                    placeholder="New password"
                                    name="password"
                                    onChange={handleRegisterChange}
                                />
                            </div>
                            <div className="reg_col">
                                <div className="reg_line_header">
                                    Date of birth
                                    <i className="info_icon"></i>
                                </div>
                                <DateOfBirthSelect
                                    bDay={bDay}
                                    bMonth={bMonth}
                                    bYear={bYear}
                                    days={days}
                                    months={months}
                                    years={years}
                                    handleRegisterChange={handleRegisterChange}
                                    dateError={dateError}
                                />
                            </div>

                            <div className="reg_col">
                                <div className="reg_line_header">
                                    Gender
                                    <i className="info_icon"></i>
                                </div>
                                <GenderSelect
                                    handleRegisterChange={handleRegisterChange}
                                    genderError={genderError}
                                />
                            </div>
                            <div className="reg_infos">
                                By clicking Sign Up, you agree to our{" "}
                                <span>Terms, Data Policy &nbsp;</span>
                                and <span>Cookie Policy.</span> You may receive SMS
                                notifications from us and can opt out at any time.
                            </div>
                            <div className="reg_btn_wrapper">
                                <button className="blue_btn open_signup">Sign Up</button>
                            </div>
                            {/* 这样的布局使得根据不同的状态（加载中、出现错误、成功等）在 UI 中显示相应的内容。 */}
                            {/* 组件的使用，它显示一个加载旋转器，其中的 color 属性设置了加载器的颜色，loading 属性用于确定是否显示加载器，size 属性设置了加载器的大小。 */}
                            <DotLoader color="#1876f2" loading={loading} size={30} />
                            {error && <div className="error_text">{error}</div>}
                            {success && <div className="success_text">{success}</div>}
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
}