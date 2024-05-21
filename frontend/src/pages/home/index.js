import { useSelector } from "react-redux";
import Header from "../../components/header/index";
import LeftHome from "../../components/home/left";
import RightHome from "../../components/home/right";
import Stories from "../../components/home/stories";
import CreatePost from "../../components/createPost/index"
import SendVerification from "../../components/home/sendVerification/index";
import Post from "../../components/post";
import "./style.css";
import { useEffect, useRef, useState } from "react";
import { HashLoader } from "react-spinners";

export default function Home({ setVisible, posts, loading, getAllPosts }) {
    const { user } = useSelector((user) => ({ ...user }));
    const middle = useRef(null);
    const [height, setHeight] = useState();

    useEffect(() => {
        /*  middle 是一个通过 useRef() 创建的引用，它可能引用了一个 DOM 元素。
            middle.current 是 middle 引用的当前值，即它引用的 DOM 元素。
            clientHeight 是 DOM 元素的只读属性，表示元素的可见高度，不包括边框和内边距。 */
        setHeight(middle.current.clientHeight);
    }, [loading, height]);

    return (
        <div className="home" style={{height: `${height + 150}px`}}>
            <Header page="home" getAllPosts={getAllPosts} />
            <LeftHome user={user} />
            <div className="home_middle" ref={middle}>
                <Stories />
                {user.verified === false && <SendVerification user={user} />}
                <CreatePost user={user} setVisible={setVisible} />

                {loading ? (
                    <div className="sekelton_loader">
                        <HashLoader color="#1876f2" />
                    </div>
                ) : (
                    <div className="posts">
                        {posts.map((post, i) => (
                            <Post key={i} post={post} user={user} />
                        ))}
                    </div>
                )}
            </div>
            <RightHome user={user} />
        </div>
    );
}