import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import Login from "../pages/login";

export default function LoggedInRoutes(){
    const {user} = useSelector((state) => ({...state}));
    // 当用户登录的时候，执行子路由, <Outlet />代表子路由的 “/” 和 “/profile”; 用户没有登录，则跳转到登录页面
    return user ? <Outlet /> : <Login />
}