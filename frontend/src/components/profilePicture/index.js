import { useRef, useState } from "react";
import "./style.css";
import UpdateProfilePicture from "./UpdateProfilePicture";
import useOnClickOutside from "../../helpers/clickOutside";
import { useSelector } from "react-redux";

export default function ProfilePicture({setShow, pRef, photos}) {
    const popup = useRef(null);
    const { user } = useSelector((state) => ({ ...state }));
    useOnClickOutside(popup, () => setShow(false));

    const refInput = useRef(null);
    const [image, setImage] = useState("");
    const [error, setError] = useState("");
    
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
            setImage(event.target.result);
        };
    };


    return(
        <div className="blur">
            <input type="file" ref={refInput} hidden onChange={handleImage} accept="image/jpeg,image/png,image/webp,image/gif" />
            <div className="postBox pictureBox" ref={popup}>
                <div className="box_header">
                    <div className="small_circle">
                        <i className="exit_icon" onClick={() => setShow(false)}></i>
                    </div>
                    <span>Update profile picture</span>
                </div>

                <div className="update_picture_wrap">
                    <div className="update_picture_buttons">
                        {/* 只有点击了这里的按钮，才会出发 上面的 <input type="file">标签，
                            因为这个标签被我们进行了隐藏，需要一个按钮去触发 */}
                        <button className="light_blue_btn" onClick={() => refInput.current.click()}>
                            <i className="plus_icon filter_blue"></i>
                            Upload photo
                        </button>
                        <button className="gray_btn">
                            <i className="frame_icon"></i>
                            Add frame
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="postError comment_error">
                        <div className="postError_error">{error}</div>
                        <button className="blue_btn" onClick={() => setError("")}>
                            Try again
                        </button>
                    </div>
                )}

                <div className="old_pictures_wrap scrollbar">
                    <h4>Your profile pictures</h4>
                    <div className="old_pictures">
                        {photos.filter((img) => img.folder === `${user.username}/profile_pictures`)
                            .map((photo) => (
                                <img src={photo.secure_url} key={photos.public_id} alt=""
                                    onClick={() => setImage(photo.secure_url)}/>
                        ))}
                    </div>
                    <h4>Other pictures</h4>
                    <div className="old_pictures">
                        {photos.filter((img) => img.folder !== `${user.username}/profile_pictures`)
                            .map((photo) => (
                                <img src={photo.secure_url} key={photos.public_id} alt=""
                                    onClick={() => setImage(photo.secure_url)}/>
                        ))}
                    </div>
                </div>

                {/* 选择图片后 进入到描述图片的阶段 */}
                {image && <UpdateProfilePicture image={image} setImage={setImage} setError={setError} pRef={pRef} setShow={setShow}/>}  
            </div>
        </div>
    )
}