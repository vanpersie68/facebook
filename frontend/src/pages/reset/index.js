import "./style.css";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import { useState } from "react";
import SearchAccount from "./SearchAccount";
import SendEmail from "./SendEmail";
import CodeVerification from "./CodeVerification";
import Footer from "../../components/login/Footer";
import ChangePassword from "./ChangePassword";

export default function Reset(){
    const {user} = useSelector ((state) => ({...state}));
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [visible, setVisible] = useState(0);
    const [loading, setLoading] = useState(false);

    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [conf_password, setConf_password] = useState("");
    const [error, setError] = useState("");
    const [userInfos, setUserInfos] = useState("");

    const logout = () => {
        Cookies.set("user", "");
        dispatch({type: "LOGOUT",});
        navigate("/login");
    };

    return(
        <div className="reset">
            <div className="reset_header">
                <img src="../../../icons/facebook.svg" alt="" />
                {/* 用户登录显示 Logout，用户没有登录 显示 Login */}
                {user ? ( 
                    <div className="right_reset">
                        <Link to="/profile">
                            <img src={user?.picture} alt="" />
                        </Link>
                        <button className="blue_btn" onClick={() => {logout();}}>Logout</button>
                    </div>
                ) : (
                    <Link to="/login" className="right_reset">
                        <button className="blue_btn">Login</button>
                    </Link>
                )}
            </div>

            <div className="reset_wrap">
                {visible === 0 && (
                    <SearchAccount 
                        email={email} 
                        setEmail={setEmail} 
                        error={error} 
                        setError={setError}
                        setLoading={setLoading}
                        setUserInfos={setUserInfos}
                        setVisible={setVisible}
                    />
                )}

                {visible === 1 && (
                    <SendEmail 
                        email={email}
                        userInfos={userInfos} 
                        error={error}
                        setError={setError}
                        setLoading={setLoading}
                        setUserInfos={setUserInfos}
                        setVisible={setVisible}
                    />
                )}
                {visible === 2 && (
                    <CodeVerification 
                        user={user} 
                        code={code} 
                        setCode={setCode}
                        error={error} 
                        setError={setError}
                        setLoading={setLoading}
                        setVisible={setVisible}
                        userInfos={userInfos}
                    />
                )}
                {visible === 3 && (
                    <ChangePassword 
                        password={password} 
                        conf_password={conf_password} 
                        setPassword={setPassword} 
                        setConf_password={setConf_password}
                        error={error}
                        setError={setError}
                        setLoading={setLoading}
                        setVisible={setVisible}
                        userInfos={userInfos}
                    />)}
            </div>
        </div>
    );  
};