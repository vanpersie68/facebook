import { useState } from "react";
import Bio from "./Bio";

export default function Detail({img, value, placeholder, name, handleChange, updateDetails, infos, text, rel,}) {
    // 是否显示 每个输入框
    const [show, setShow] = useState(false);

    return (
        <div>
            <div className="add_details_flex" onClick={() => setShow(true)}>
                {value ? ( // 每个要更改的属性原本都有值，则显示以下图片
                    <div className="info_profile">
                        <img src={`../../../icons/${img}.png`} alt="" />
                        {value}
                        <i className="edit_icon"></i>
                    </div>
                ) : ( // 每个要更改的属性原本都有值，则显示以下图片
                    <>
                        <i className="rounded_plus_icon"></i>
                        <span className="underline">Add {text}</span>
                    </>
                )}
            </div>  

            {/* 所有的文本输入框 */}
            {show && (
                <Bio placeholder={placeholder} name={name} handleChange={handleChange} updateDetails={updateDetails} 
                    infos={infos} detail setShow={setShow} rel={rel} />
            )}
        </div>
    );
}