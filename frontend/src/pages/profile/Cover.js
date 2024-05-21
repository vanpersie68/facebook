import { useCallback, useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import useClickOutside from "../../helpers/clickOutside";
import getCroppedImg from "../../helpers/getCroppedImg";
import { uploadImages } from "../../functions/uploadImages";
import { useSelector } from "react-redux";
import { updateCover } from "../../functions/user";
import { createPost } from "../../functions/post";
import PulseLoader from "react-spinners/PulseLoader";
import OldCovers from "./OldCovers";

export default function Cover({ cover, visitor, photos }) {
    // 是否显示 菜单页面
    const [showCoverMenu, setShowCoverMenu] = useState(false);
    // 是否显示 select Photo 后的页面
    const [show, setShow] = useState(false);
    // 设置封面照片
    const [coverPicture, setCoverPicture] = useState("");
    const [loading, setLoading] = useState(false);
    const { user } = useSelector((state) => ({ ...state }));
    // 用来处理 截图界面 的宽度
    const coverRef = useRef(null);
    // 用来处理 图片 的选择
    const selectPicRef = useRef(null);
    // 用来处理 不需要刷新界面就可以 更改图片
    const currentPicRef = useRef(null);

    // 点击 “add cover photo” 按钮显示菜单页面，当点击到菜单页面外后，菜单会消失
    const menuRef = useRef(null);
    useClickOutside(menuRef, () => setShowCoverMenu(false));

    const [error, setError] = useState("");
    // 管理裁剪框的位置
    const [crop, setCrop] = useState({x:0, y:0});
    // 管理图像的缩放比例
    const [zoom, setZoom] = useState(1); //数值越大表示缩放比例越大
    // 存储表示图像裁剪区域的像素信息的值
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const [width, setWidth] = useState();
    useEffect(() => {
        // 更新宽度 --- 获取 coverRef引用的DOM元素的clientWidth属性，即元素的宽度
        setWidth(coverRef.current.clientWidth);
    }, [window.innerWidth]);

    const handleImage = (event) => {
        let file = event.target.files[0];
        if(file.type !== "image/jpeg" && file.type !== "image/png" && file.type !== "image/webp" && file.type !== "image/gif"){
            setError(`${file.name} format is not supported. `);
            setShowCoverMenu(false);
            return;
        } else if(file.size > 1024 * 1024 * 5){
            setError(`${file.name} is too large max 5mb allowed. `);
            setShowCoverMenu(false);
            return;
        }

        //读取文件内容
        const reader = new FileReader();
        //开始读取指定的文件内容。该方法会以数据 URL 的形式返回文件的内容，其中包含文件的 base64 编码
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            //回调函数使用 event.target.result 获取读取的文件内容
            setCoverPicture(event.target.result);
        };
    };

    // 回调函数，当用户完成裁剪时触发，在用户完成对图像的裁剪操作时，将裁剪区域的像素信息存储到组件的状态中
    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    /* 这段代码的主要作用是根据条件（show参数的值）执行不同的操作，其中包括裁剪图像并更新组件的状态。如果show为真，
    它将重置缩放和裁剪状态，然后将裁剪后的图像设置为新的图像。如果show为假，它只是打印信息并返回裁剪后的图像对象。 */
    // 这段代码使用回调函数，确保在组件重新渲染时，不会创建新的getCroppedImage函数实例
    const getCroppedImage = useCallback(
        async () => {
            try {
                //返回一个经过裁剪的图像
                const img = await getCroppedImg(coverPicture, croppedAreaPixels);
                return img;
            } catch (error) {
                console.log(error);
            }
        }, [croppedAreaPixels] //只有在croppedAreaPixels发生变化时，getCroppedImage函数才会重新创建
    );

    //执行上传和更新个人背景图片
    const updateCoverPicture = async() => {
        try {
            setLoading(true);
            let img = await getCroppedImage();
            //使用fetch函数获取图像数据，然后将其转换为Blob对象，并将结果赋值给变量blob。这一步是为了准备图像数据进行上传 
            let blob = await fetch(img).then((b) => b.blob());
            //构建上传路径
            const path = `${user.username}/cover_pictures`;
            //创建一个FormData对象，用于将图像数据和其他表单字段一起发送到服务器
            let formData = new FormData();
            //将图像 Blob对象追加到FormData中，并使用"file"作为字段名
            formData.append("file", blob);
            //将路径信息追加到FormData中，使用"path"作为字段名
            formData.append("path", path);
            //将图片上传到 Cloudinary 中， 返回的是一个装有图片url地址的数组
            const res = await uploadImages(formData, path, user.token);
            //将上传后的图片URL和用户的令牌发送到服务器，用于更新用户的个人背景图片
            const updated_picture = await updateCover(res[0].url, user.token);
    
            if(updated_picture === "ok"){
                // 对应的参数 type, background, text, images, user, token
                const new_post = await createPost("coverPicture", null, null, res, user.id, user.token);

                if(new_post.status === "ok"){
                    setLoading(false);
                    setCoverPicture("");
                    // 直接更改为新的图片，不需要刷新网页才显示更改
                    currentPicRef.current.src = res[0].url;
                } else {
                    setLoading(false);
                    setError(new_post);
                }
            } else {
                setLoading(false);
                setError(updated_picture);
            }
        } catch (error) {
            setLoading(false);
            setError(error.response.data.message);
        }
    };

    return (
        <div className="profile_cover" ref={coverRef}>
            {/* 悬浮在最上面的横幅 --- 当有 背景 图片的时候才会显示 */}
            {coverPicture && (
                <div className="save_changes_cover">
                    <div className="save_changes_left">
                        <i className="public_icon"></i>
                        Your cover photo is public
                    </div>
                    <div className="save_changes_right">
                        <button className="blue_btn opacity_btn" onClick={() => setCoverPicture("")}>Cancel</button>
                        <button className="blue_btn" onClick={() => updateCoverPicture()}> 
                            {loading ? <PulseLoader color="#fff" size={5} /> : "Save changes"}
                        </button>
                    </div>
                </div>
            )}

            {/* 选取图片 */}
            <input type="file" ref={selectPicRef} hidden accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImage} />

            {/* 当出现错误页面的时候 */}
            {error && (
                <div className="postError comment_error cover_error">
                    <div className="postError_error">{error}</div>
                    <button className="blue_btn" onClick={() => setError("")}>Try again</button>
                </div>
            )}

            {/*  截图所选中的区域  --- 只有在选择了背景图片后才会显示*/}
            {coverPicture && (
                <div className="cover_cropper">
                    <Cropper image={coverPicture} crop={crop} zoom={zoom} aspect={width / 350} onCropChange={setCrop} 
                        onCropComplete={onCropComplete} onZoomChange={setZoom} showGrid={true} objectFit="horizontal-cover"/>
                </div>
            )}

            {/* 在没有更改背景图片 且有背景图片的情况下 显示背景图片 */}
            {cover && !coverPicture && (<img src={cover} className="cover" alt="" ref={currentPicRef}/>)}

            {/* 菜单选项 --- 只有在用户自己登录的时候 才可以显示菜单 */}
            {!visitor && (
                <div className="update_cover_wrapper">
                    <div className="open_cover_update" onClick={() => setShowCoverMenu((prev) => !prev)}>
                        <i className="camera_filled_icon"></i>
                        Add Cover Photo
                    </div>

                    {showCoverMenu && (
                        <div className="open_cover_menu" ref={menuRef}>
                            <div className="open_cover_menu_item hover1" onClick={() => setShow(true)}>
                                <i className="photo_icon"></i>
                                Select Photo
                            </div>
                            <div className="open_cover_menu_item hover1" onClick={() => selectPicRef.current.click()}>
                                <i className="upload_icon"></i>
                                Upload Photo
                            </div>
                        </div>
                    )}
                </div>
            )}
            {show && (
                <OldCovers photos={photos} setCoverPicture={setCoverPicture} setShow={setShow} />
            )}
        </div>
    );
}