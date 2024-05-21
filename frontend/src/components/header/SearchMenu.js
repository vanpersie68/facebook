import { useEffect, useRef, useState } from "react";
import { Return, Search } from "../../svg";
import useClickOutside from "../../helpers/clickOutside"
import { search, addToSearchHistory, getSearchHistory, removeFromSearch } from "../../functions/user";
import { Link } from "react-router-dom";

export default function SearchMenu({color, setShowSearchMenu, token}){
    const [iconVisible, setIconVisible] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);
    const [searchHistory, setSearchHistory] = useState([]);
    const menu = useRef(null);
    const input = useRef(null);

    // 点击菜单以外的地方，会自动关闭搜索菜单
    useClickOutside(menu, () => {
        setShowSearchMenu(false);
    })

    useEffect(() => {
        getHistory();
    }, []);

    const getHistory = async() => {
        const res = await getSearchHistory(token);
        setSearchHistory(res);
    }

    // 目的是为了让用户在点击菜单后，自动获取焦点到输入框中，这样用户可以直接在搜索框中输入要搜索的内容
    useEffect(() => {
        input.current.focus();
    }, []);

    const searchHander = async() => {
        if(searchTerm === ""){
            setResults("");
        } else {
            const res = await search(searchTerm, token);
            setResults(res);
        }
    };

    const addToSearchHistoryHandler = async(searchUser) => {
        await addToSearchHistory(searchUser, token);
        getHistory();
    };

    const handleRemove = async(searchUser) => {
        removeFromSearch(searchUser, token);
        getHistory();
    }

    return(
        <div className="header_left search_area scrollbar" ref={menu}>
            <div className="search_wrap">
                {/* 对应的是点开搜索框 小箭头的区域 */}
                <div className="header_logo" onClick={() => setShowSearchMenu(false)}>
                    <div className="circle hove1" >
                        <Return color={color} />
                    </div>
                </div>

                {/* 对应的是点开搜索框，带放大镜搜索的区域 */}
                {/* 使用focus的原因，当点击放大镜小图标的时候，也会实现自动获取焦点到输入框中 */}
                <div className="search" onClick={() => {input.current.focus(); }}>
                    {iconVisible && (
                        <div>
                            <Search color={color} />
                        </div>
                    )}
                    
                    <input type="text" placeholder="Search Facebook" ref={input} value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyUp={searchHander}
                        onFocus={() => setIconVisible(false)} //当输入框获得焦点时触发的事件处理函数, 隐藏图标
                        onBlur={() => setIconVisible(true)} //当输入框失去焦点时触发的事件处理函数, 显示图标
                    />
                </div>
            </div>

            {results == "" && (
                <div className="search_history_header">
                    <span>Recent searches</span>
                    <a>Edit</a>
                </div>
            )}
        
            <div className="search_history scrollbar">
                {searchHistory && results == "" && searchHistory
                .filter((user) => user.user && user.user.username)  
                .sort((a, b) => {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                })
                .map((user) => (
                    <div className="search_user_item hover1" key={user._id}>    
                        <Link className="flex" to={`/profile/${user.user.username}`}
                            onClick={() => addToSearchHistoryHandler(user.user._id)}>
                            <img src={user.user.picture} alt=""/>
                            <span>
                                {user.user.first_name} {user.user.last_name}
                            </span>
                        </Link>
                        <i className="exit_icon" onClick={() => {
                            handleRemove(user.user._id);
                        }}></i>
                    </div>
                ))}
            </div>

            <div className="search_results scrollbar">
                {results && results.map((user) => (
                    <Link to={`/profile/${user.username}`} className="search_user_item hover1"  
                        onClick={() => addToSearchHistoryHandler(user._id)} key={user._id}>
                        <img src={user.picture} alt="" />
                        <span>
                            {user.first_name} {user.last_name}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
};