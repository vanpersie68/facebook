import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "./pages/login";
import Profile from "./pages/profile";
import Home from "./pages/home";
import LoggedInRoutes from "./routes/LoggedInRoutes";
import NotLoggedInRoutes from "./routes/NotLoggedInRoutes";
import Activate from "./pages/home/Activate";
import Reset from "./pages/reset";
import CreatePostPopup from "./components/createPostPopup";
import Friends from "./pages/friends";
/* useReducer 是 React 中的一个 Hook，用于管理组件内部的状态。它提供了一种更复杂
和灵活的状态管理方式，尤其适用于需要处理多个相关状态或有复杂状态逻辑的组件。*/
import { useEffect, useState, useReducer } from "react";
import axios from "axios";
import { postsReducer } from "./functions/reducers";

function App() {
    const [visible, setVisible] = useState(false);
    const { user, darkTheme } = useSelector((state) => ({ ...state }));

    // 使用 useReducer 创建状态管理器，处理加载状态、帖子数据和错误信息
    const [{ loading, error, posts }, dispatch] = useReducer(postsReducer, {
        loading: false,
        posts: [],
        error: "",
    });

    useEffect(() => {
        if(user) getAllPosts();
    }, [user, user?.token]);

    // 异步函数，用于获取所有帖子数据
    const getAllPosts = async () => {
        try {
            dispatch({
                type: "POSTS_REQUEST",
            });
            const { data } = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/getAllPosts`, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });

            dispatch({
                type: "POSTS_SUCCESS",
                payload: data,
            });
        } catch (error) {
            dispatch({
                type: "POSTS_ERROR",
                payload: error.response.data.message,
            })
        }
    };

    return (
        <div className={darkTheme && "dark" }>
            {visible && <CreatePostPopup user={user} setVisible={setVisible} 
                posts={posts} dispatch={dispatch}/>} 
            <Routes>
                <Route element={<LoggedInRoutes />}>
                    <Route path="/profile" element={<Profile setVisible={setVisible} 
                        getAllPosts={getAllPosts} />} exact />
                    <Route path="/profile/:username" element={<Profile setVisible={setVisible} 
                        getAllPosts={getAllPosts} />} exact />
                    <Route path="/friends" element={<Friends setVisible={setVisible} 
                        getAllPosts={getAllPosts} />} exact />
                    <Route path="/friends/:type" element={<Friends setVisible={setVisible} 
                        getAllPosts={getAllPosts} />} exact />
                    <Route path="/" element={<Home setVisible={setVisible} 
                        posts={posts} loading={loading} getAllPosts={getAllPosts} />} exact />
                    <Route path="/activate/:token" element={<Activate />} exact />
                </Route>

                <Route element={<NotLoggedInRoutes />}>
                    <Route path="/login" element={<Login />} exact />
                </Route>
                <Route path="/reset" element={<Reset />} />
            </Routes>
        </div>
    );
}

export default App;
