import { useEffect, useRef, useState } from "react";
import Picker from "emoji-picker-react";
import { comment } from "../../functions/post";
import { uploadImages } from "../../functions/uploadImages";
import dataURItoBlob from "../../helpers/dataUrlToBlob";
import { ClipLoader } from "react-spinners";

export default function CreateComment({ user, postId, setComments, setCount }) {
    //负责点击 和 关闭表情
    const [picker, setPicker] = useState(false);
    const [text, setText] = useState("");
    const [error, setError] = useState("");
    const [commentImage, setCommentImage] = useState("");
    const [cursorPosition, setCursorPosition] = useState();
    const [loading, setLoading] = useState(false);
    const textRef = useRef(null);
    const imgInput = useRef(null);

    useEffect(() => {
        textRef.current.selectionEnd = cursorPosition;
    }, [cursorPosition]);

    const handleEmoji = (event, {emoji}) => {
        //当前鼠标选择的表情包
        const ref = textRef.current;
        //鼠标的光标会显示在textarea文本中
        ref.focus();
        //通过start 和 end 确定 emoji添加的位置
        const start = text.substring(0, ref.selectionStart);
        const end = text.substring(ref.selectionStart);
        //将 emoji 与原本的文本进行拼接
        const newText = start + emoji + end;
        //重新设置text的值
        setText(newText);
        //设置添加 emoji后 鼠标光标的位置
        setCursorPosition(start.length + emoji.length);
    };

    const handleImage = (event) => {
        let file = event.target.files[0];
        if(file.type !== "image/jpeg" && file.type !== "image/png" && file.type !== "image/webp" && file.type !== "image/gif"){
            setError(`${file.name} format is not supported. `);
            return;
        } else if(file.size > 1024 * 1024 * 5){
            setError(`${file.name} is too large max 5mb allowed. `);
            return;
        }

        //读取文件内容
        const reader = new FileReader();
        //开始读取指定的文件内容。该方法会以数据 URL 的形式返回文件的内容，其中包含文件的 base64 编码
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            //回调函数使用 event.target.result 获取读取的文件内容
            setCommentImage(event.target.result);
        };
    };

    const handleComment = async(event) => {
        if(event.key === "Enter"){
            if(commentImage != ""){
                setLoading(true);
                const img = dataURItoBlob(commentImage);
                const path = `${user.username}/post_images/${postId}`;
                let formData = new FormData();
                formData.append("path", path);
                formData.append("file", img);
                const imgComment = await uploadImages(formData, path, user.token);

                const comments = await comment(postId, text, imgComment[0].url, user.token);
                setComments(comments);
                setCount((prev) => ++prev);
                setLoading(false);
                setText("");
                setCommentImage("");
            } else {
                setLoading(true);
                const comments = await comment(postId, text, "", user.token);
                setComments(comments);
                setCount((prev) => ++prev);
                setLoading(false);
                setText("");
                setCommentImage("");
            }
        }
    };

    return(
        <div className="create_comment_wrap">
            <div className="create_comment">
                <img src={user?.picture} alt="" />
                <div className="comment_input_wrap">
                    {/* 表情的选择 */}
                    {picker && (
                        <div className="comment_emoji_picker">
                            <Picker onEmojiClick={handleEmoji} />
                        </div>
                    )}
                    {/* 选择文件，输入框被隐藏了，触发键在 “照相机” 的按键 */}
                    <input type="file" hidden ref={imgInput} accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleImage}/>
                    {/* 出现错误 */}
                    {error && (
                        <div className="postError comment_error">
                            <div className="postError_error">{error}</div>
                            <button className="blue_btn" onClick={() => setError("")}>Try again</button>
                        </div>
                    )}
                    <input type="text" ref={textRef} value={text} placeholder="Write a comment..." 
                        onChange={(event) => setText(event.target.value)} onKeyUp={handleComment}/>
                    <div className="comment_circle" style={{marginTop: "5px"}}>
                        <ClipLoader size={20} color="#1876f2" loading={loading} />
                    </div>

                    <div className="comment_circle_icon hover2" onClick={() => {setPicker((prev) => !prev)}}>
                        <i className="emoji_icon"></i>
                    </div>
                    <div className="comment_circle_icon hover2" onClick={() => imgInput.current.click()}>
                        <i className="camera_icon"></i>
                    </div>
                    <div className="comment_circle_icon hover2">
                        <i className="gif_icon"></i>
                    </div>
                    <div className="comment_circle_icon hover2">
                        <i className="sticker_icon"></i>
                    </div>
                </div>
            </div>
            {/* 如果图片存在，展示图片 */}
            {commentImage && (
                <div className="comment_img_preview">
                    <img src={commentImage} alt="" />
                    <div className="small_white_circle">
                        <i className="exit_icon" onClick={() => setCommentImage("")}></i>
                    </div>
                </div>
            )}
        </div>
    );
}