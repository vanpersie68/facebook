import { useCallback, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Cropper from "react-easy-crop"; //主要作用是允许用户在前端对图像进行裁剪，以满足特定的尺寸或纵横比。
import getCroppedImg from "../../helpers/getCroppedImg";
import { createPost } from "../../functions/post";
import { uploadImages } from "../../functions/uploadImages";
import { updateProfile} from "../../functions/user";
import PulseLoader from "react-spinners/PulseLoader";
import Cookies from "js-cookie";

export default function UpdateProfilePicture({ image, setImage, setError, setShow, pRef}) {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => ({ ...state }));
    const [description, setDescription] = useState("");
    // 管理裁剪框的位置
    const [crop, setCrop] = useState({x:0, y:0});
    // 管理图像的缩放比例
    const [zoom, setZoom] = useState(1); //数值越大表示缩放比例越大
    const slider = useRef(null);
    // 存储表示图像裁剪区域的像素信息的值
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [loading, setLoading] = useState(false);

    // 回调函数，当用户完成裁剪时触发，在用户完成对图像的裁剪操作时，将裁剪区域的像素信息存储到组件的状态中
    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    // 图像放大操作
    const zoomIn = () => {
        slider.current.stepUp();
        setZoom(slider.current.value);
    };

    // 图像缩小操作
    const zoomOut = () => {
        slider.current.stepDown();
        setZoom(slider.current.value);
    };

    /* 这段代码的主要作用是根据条件（show参数的值）执行不同的操作，其中包括裁剪图像并更新组件的状态。如果show为真，
    它将重置缩放和裁剪状态，然后将裁剪后的图像设置为新的图像。如果show为假，它只是打印信息并返回裁剪后的图像对象。 */
    // 这段代码使用回调函数，确保在组件重新渲染时，不会创建新的getCroppedImage函数实例
    const getCroppedImage = useCallback(
        async () => {
            try {
                //返回一个经过裁剪的图像
                const img = await getCroppedImg(image, croppedAreaPixels);
                return img;
            } catch (error) {
                console.log(error);
            }
        }, [croppedAreaPixels] //只有在croppedAreaPixels发生变化时，getCroppedImage函数才会重新创建
    );
 
    //执行上传和更新个人资料图片
    const updateProfilePicture = async() => {
        try {
            setLoading(true);
            let img = await getCroppedImage();
            //使用fetch函数获取图像数据，然后将其转换为Blob对象，并将结果赋值给变量blob。这一步是为了准备图像数据进行上传 
            let blob = await fetch(img).then((b) => b.blob());
            //构建上传路径
            const path = `${user.username}/profile_pictures`;
            //创建一个FormData对象，用于将图像数据和其他表单字段一起发送到服务器
            let formData = new FormData();
            //将图像 Blob对象追加到FormData中，并使用"file"作为字段名
            formData.append("file", blob);
            //将路径信息追加到FormData中，使用"path"作为字段名
            formData.append("path", path);
            //将图片上传到 Cloudinary 中， 返回的是一个装有图片url地址的数组
            const res = await uploadImages(formData, path, user.token);
            //将上传后的图片URL和用户的令牌发送到服务器，用于更新用户的个人资料图片
            const updated_picture = await updateProfile(res[0].url, user.token);
    
            if(updated_picture === "ok"){
                // 对应的参数 type, background, text, images, user, token
                const new_post = await createPost("profilePicture", null, description, res, user.id, user.token);

                if(new_post.status === "ok"){
                    setLoading(false);
                    setImage("");
                    // 直接更改为新的图片，不需要刷新网页才显示更改
                    pRef.current.style.backgroundImage = `url(${res[0].url})`;
                    // 更新Cookies
                    Cookies.set("user", JSON.stringify({...user, picture: res[0].url}));
                    dispatch({type: "UPDATEPICTURE", payload: res[0].url});
                    setShow(false);
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

    return(
        <div className="postBox update_img" >
            <div className="box_header">
                {/* 退出按钮 */}
                <div className="small_circle" onClick={() => setImage("")}>
                    <i className="exit_icon"></i>
                </div>
                <span>Update profile picture</span>
            </div>

            {/* 文本输入区域 */}
            <div className="update_image_desc">
                <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} 
                    className="textarea_blue details_input"></textarea>
            </div>

            <div className="update_center">
                {/* 截图所选中的区域 */}
                <div className="crooper">
                    {/* Cropper 组件用于实现图像裁剪功能。
                        - image: 图片的 URL 或者 base64 编码。
                        - crop: 控制裁剪框的位置的状态。
                        - zoom: 控制图像的缩放比例的状态。
                        - aspect: 定义裁剪区域的纵横比例，这里是正方形。
                        - cropShape: 定义裁剪区域的形状，这里是圆形。
                        - onCropChange: 当用户拖动裁剪框时触发的回调，用于更新 crop 状态。
                        - onCropComplete: 当用户完成裁剪操作时触发的回调，用于处理裁剪完成后的逻辑。
                        - onZoomChange: 当用户缩放图像时触发的回调，用于更新 zoom 状态。
                        - showGrid: 是否显示裁剪框的网格，这里设置为不显示。 */}
                    <Cropper image={image} crop={crop} zoom={zoom} aspect={1 / 1 } cropShape="round" 
                        onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} showGrid={false}/>
                </div>
                <div className="slider">
                    {/* 标尺的 减少按钮 */}
                    <div className="slider_circle hover1" onClick={() => zoomOut()}>
                        <i className="minus_icon"></i>
                    </div>
                    {/* 标尺 
                        - type="range": 设置输入元素的类型为滑动条。
                        - min={1}: 设置滑动条的最小值为 1。
                        - max={3}: 设置滑动条的最大值为 3。
                        - step={0.2}: 设置滑动条的步长为 0.2，表示每次拖动滑块时值的变化量。
                        - ref={slider}: 使用 React 的 ref 特性，将该输入元素的引用传递给之前创建的 slider 对象，以便在其他部分引用该输入元素。
                        - value={zoom}: 将滑动条的当前值设置为组件中的 zoom 状态，确保滑动条显示的值与应用状态同步。
                        - onChange={(e) => setZoom(e.target.value)}: 当用户拖动滑块时触发的事件处理函数，将滑动条的当前值更新到组件的 zoom 状态中。 */}
                    <input type="range" min={1} max={3} step={0.2} ref={slider} value={zoom} onChange={(e) => setZoom(e.target.value)}/>
                    {/* 标尺的 增加按钮 */}
                    <div className="slider_circle hover1" onClick={() => zoomIn()}>
                        <i className="plus_icon"></i>
                    </div>
                </div>
            </div>

            <div className="flex_up">
                <div className="gray_btn">
                    <i className="crop_icon"></i>Crop photo
                </div>
                <div className="gray_btn">
                    <i className="temp_icon"></i>Make Temporary
                </div>
            </div>
            <div className="flex_p_t">
                <i className="public_icon"></i>
                Your profile picture is public
            </div>
            <div className="update_submit_wrap">
                <div className="blue_link" onClick={() => setImage("")}>Cancel</div>
                <button className="blue_btn"  onClick={() => updateProfilePicture()}>
                    {loading ? <PulseLoader color="#fff" size={5} /> : "Save"}
                </button>
            </div>
        </div>
    );
}