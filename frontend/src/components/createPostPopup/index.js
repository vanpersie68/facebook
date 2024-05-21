import { useRef, useState } from "react";
import "./style.css";
import EmojiPickerBackgrounds from "./EmojiPickerBackgrounds";
import AddToYourPost from "./AddToYourPost";
import ImagePreview from "./ImagePreview";
import useClickOutside from "../../helpers/clickOutside";
import { createPost } from "../../functions/post";
import PulseLoader from "react-spinners/PulseLoader";
import PostError from "./PostError";
import dataUrlToBlob from "../../helpers/dataUrlToBlob";
import { uploadImages } from "../../functions/uploadImages";

export default function CreatePostPopup({user, setVisible: setVisible, posts, dispatch, profile}){
    const popup = useRef(null);
    const [text, setText] = useState("");
    const [showPrev, setShowPrev] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [images, setImages] = useState([]);
    const [background, setBackground] = useState("");

    useClickOutside(popup, ()=>{
        setVisible(false);
    });

    const postSubmit = async() => {
        if(background){
            setLoading(true);
            const response = await createPost(null, background, text, null, user.id, user.token);
            setLoading(false);
            if(response.status === "ok"){
                // dispatch的目的是为了让我们新增的贴子,不需要刷新页面,直接就能显示在网页上
                dispatch({
                    type: profile ? "PROFILE_POSTS" : "POSTS_SUCCESS",
                    payload: [response.data, ...posts],
                });
                setBackground("");
                setText("");
                setVisible(false);
            } else {
                setError(response);
            }
        } else if(images && images.length){
            setLoading(true);
            const postImages = images.map((image) => {
                return dataUrlToBlob(image);
            });

            const path = `${user.username}/postImages`;
            //FormData 是一种用于将数据以键值对的形式传递给服务器的对象。
            let formData = new FormData();
            //使用 append 方法将键为 "path"，值为 path 的键值对添加到 formData 对象中。这是为了将路径信息传递给服务器。
            formData.append("path", path);
            postImages.forEach((image) => {
                //使用 append 方法将键为 "file"，值为当前 Blob 对象的键值对添加到 formData 对象中。这是为了将每个图片文件传递给服务器。
                formData.append("file", image);
            });
            const response = await uploadImages(formData, path, user.token);
            const res = await createPost(null, null, text, response, user.id, user.token);
            setLoading(false);
            if(res.status === "ok"){
                dispatch({
                    type: profile ? "PROFILE_POSTS" : "POSTS_SUCCESS",
                    payload: [res.data, ...posts],
                });
                setText("");
                setImages("");
                setVisible(false);
            } else {
                setError(res);
            }
        } else if(text){
            setLoading(true);
            const response = await createPost(null, null, text, null, user.id, user.token);
            setLoading(false);
            if(response.status === "ok"){
                dispatch({
                    type: profile ? "PROFILE_POSTS" : "POSTS_SUCCESS",
                    payload: [response.data, ...posts],
                });
                setText("");
                setBackground("");
                setVisible(false);
            } else {
                setError(response);
            }
        } else {
            console.log("nothing");
        }
    };

    return(
        <div className="blur">
            <div className="postBox" ref={popup}>
                {error && <PostError error={error} setError={setError} />}
                <div className="box_header">
                    <div className="small_circle">
                        <i className="exit_icon" onClick={() => {setVisible(false)}}></i>
                    </div>
                    <span>Create Post</span>
                </div>
                <div className="box_profile">
                    <img src={user?.picture} alt="" className="box_profile_img"/>
                    <div className="box_col">
                        <div className="box_profile_name">
                            {user.first_name} {user.last_name}
                        </div>
                        <div className="box_privacy">
                            <img src="../../../icons/public.png" alt="" />
                            <span>Public</span>
                        </div>
                        <i className="arrowDown_icon"></i>
                    </div>
                </div>

                {!showPrev ? (
                    <EmojiPickerBackgrounds text={text} user={user} setText={setText} showPrev={showPrev} background={background} setBackground={setBackground}/>
                ) : (
                    <ImagePreview text={text} user={user} setText={setText} showPrev={showPrev} images={images} setImages={setImages} setShowPrev={setShowPrev} setError={setError}/>
                )}
                <AddToYourPost setShowPrev={setShowPrev}/>
                {/*  disabled作用根据 loading 变量的值来动态设置按钮的禁用状态。如果 loading 为 true，按钮将被禁用，否则按钮是可用的。 */}
                <button className="post_submit" onClick={() => postSubmit()} disabled={loading}>
                    {/* 这是一个条件渲染的表达式，根据 loading 的值选择性地渲染按钮的内容。如果 loading 为 true，则渲染一个名为 PulseLoader 的加载动画组件
                    （可能是从某个库引入的），否则渲染文本 "Post"。 */}
                    {loading ? <PulseLoader color="#fff" size={5} /> : "Post"}
                </button>
            </div>
        </div>
    );
};