import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import CreatePost from "../../components/createPost";
import Header from "../../components/header";
import LeftHome from "../../components/home/left";
import RightHome from "../../components/home/right";
import Stories from "../../components/home/stories";
import ActivateForm from "./ActivateForm";
import "./style.css";
import axios from "axios";
import Cookies from "js-cookie";

export default function Activate(){
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {user} = useSelector((user) => ({...user}));
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    // 从路由参数中获取token
    const {token} = useParams(); 

    // 使用useEffect钩子，在组件挂载时执行activateAccount函数
    //组件挂载指的是组件被插入到DOM中的过程。当你使用ReactDOM.render()方法将React组件渲染到DOM时，这个过程就开始了。
    useEffect(() => {
        activateAccount();
    }, []);

    const activateAccount = async() => {
        try{
            setLoading(true);
            const {data} = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/activate`, 
                //此处的token 和 user.token 来源不同；token是从请求体中获取，user.token是从前端登录用户中获取
                {token},  // 发送的请求数据对象，包括从路由参数中获取的token
                
                {headers: { // 请求配置，包括自定义的请求头
                    Authorization: `Bearer ${user.token}`, // 在请求头中添加Authorization字段，值为Bearer加上 此时登录用户的token
                }}
            );

            setSuccess(data.message);
            Cookies.set("user", JSON.stringify({...user, verified: true}));
            dispatch({type: "VERIFY", payload: true});

            setTimeout(() => {
                navigate("/");
            }, 3000);
        } catch(error){
            setError(error.response.data.message);
            setTimeout(() => {
                navigator("/");
            }, 3000);
        }
    };

    return(
        <div className="home">
            {success && (
                <ActivateForm type="success" header="Account verification succeded." text={success} loading={loading} />
            )}
            {error && (
                <ActivateForm type="error" header="Account verification failed." text={error} loading={loading} />
            )}
            <Header />
            <LeftHome user={user} />
            <div className="home_middle">
                <Stories />
                <CreatePost user={user} />
            </div>
            <RightHome user={user} />
        </div>
    );
}