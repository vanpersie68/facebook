import "./style.css";
import { Link } from "react-router-dom";
import {ArrowDown, Friends, Gaming, Home, HomeActive, Logo, Market, Menu, Messenger, Notifications, Search, Watch} from "../../svg";
import { useSelector } from "react-redux";
import { useRef, useState } from "react";
import SearchMenu from "./SearchMenu";
import useClickOutside from "../../helpers/clickOutside";
import AllMenu from "./AllMenu";
import UserMenu from "./userMenu/index";

export default function Header({page, getAllPosts}) {
    // 这段代码是使用React Redux库中的useSelector钩子，它用于从Redux store中选择和提取状态。useSelector接受一个函数作为参数，该函数的参数是整个Redux store的状态，然后返回我们想要从中提取的特定部分。
    const { user } = useSelector((user) => ({ ...user }));
    const color = "#65676b";
    const [showSearchMenu, setShowSearchMenu] = useState(false);
    const [showAllMenu, setShowAllMenu] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const allMenu = useRef(null);
    const userMenu = useRef(null);
    useClickOutside(allMenu, () => {
        setShowAllMenu(false);
    });

    useClickOutside(userMenu, () => {
        setShowUserMenu(false);
    });

    return (
        <header>
            <div className="header_left">
                <Link to="/" className="header_logo">
                    <div className="circle">
                        {/* facebook 的 logo */}
                        <Logo /> 
                    </div>
                </Link>
                <div className="search search1" onClick={() => setShowSearchMenu(true)}>
                    <Search color={color} />
                    <input type="text" placeholder="Search Facebook" className="hide_input"/>
                </div>
            </div>
            {showSearchMenu && (
                <SearchMenu color={color} setShowSearchMenu={setShowSearchMenu} token={user.token}/>
            )}

            <div className="header_middle">
                <Link to="/" className={`middle_icon  ${page === "home" ? "active" : "hover1"}`} onClick={() => getAllPosts()}>
                    {/* 取消 "home” 的蓝底颜色 */}
                    {page === "home" ? <HomeActive /> : <Home color={color} />}
                </Link>
                <Link to="/friends" className="middle_icon hover1">
                    <Friends color={color} />
                </Link>
                <Link to="/" className="middle_icon hover1">
                    <Watch color={color} />
                    <div className="middle_notification">9+</div>
                </Link>
                <Link to="/" className="middle_icon hover1">
                    <Market color={color} />
                </Link>
                <Link to="/" className="middle_icon hover1">
                    <Gaming color={color} />
                </Link>
            </div>

            <div className="header_right">
                {/* 让 头像位置 的图标 变为蓝底颜色 */}
                <Link to="/profile" className={`profile_link hover1 ${page === "profile" ? "active_link" : ""}`}>
                    {/* ？表示如果用户有图片，则显示，没有不显示 */}
                    <img src={user?.picture} alt="" /> 
                    <span>{user?.first_name}</span>
                </Link>

                <div className={showAllMenu ? "circle_icon hover1 active_header" : "circle_icon hover1"} ref={allMenu}>
                    <div onClick={() => setShowAllMenu((prev) => !prev)}>
                        <div style={{ transform: "translateY(2px)" }}>
                            <Menu />
                        </div>   
                    </div>
                    {showAllMenu && <AllMenu />}
                </div>
                <div className="circle_icon hover1">
                    <Messenger />
                </div>
                <div className="circle_icon hover1">
                    <Notifications />
                    <div className="right_notification">5</div>
                </div>
                <div className={showUserMenu ? "circle_icon hover1 active_header" : "circle_icon hover1"} ref={userMenu}>
                    <div onClick={() => {setShowUserMenu((prev) => !prev)}} >
                        <div style={{ transform: "translateY(2px)" }}>
                            <ArrowDown />
                        </div>
                    </div>
                    {showUserMenu && <UserMenu user={user} />}
                </div>
            </div>
        </header>
    );
}
