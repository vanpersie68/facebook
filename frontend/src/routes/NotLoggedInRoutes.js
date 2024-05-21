import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function NotLoggedInRoutes(){
    const {user} = useSelector((state) => ({...state}));
    // 当用户没有登录的时候，执行子路由, <Outlet />代表子路由的 “/login”; 用户登录了，则跳转到 "/" 或 “/profile” 页面
    return user ? <Navigate to="/" /> : <Outlet />;
}