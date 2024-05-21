import { useEffect, useRef, useState } from "react";
import Picker from "emoji-picker-react";

export default function EmojiPickerBackgrounds({ text, user, setText, type2, background, setBackground }) {
    //用来操作打开和关闭 “选择表情”的页面
    const [picker, setPicker] = useState(false);
    const [showBackgrounds, setShowBackgrounds] = useState(false);
    const [cursorPosition, setCursorPosition] = useState();
    const textRef = useRef(null);
    const backgroundRef = useRef(null);

    //useEffect 会在 cursorPosition 改变时触发
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
        //设置添加emoji后 鼠标光标的位置
        setCursorPosition(start.length + emoji.length);
    };
    
    //背景图片
    const postBackgrounds = [
        "../../../images/postBackgrounds/1.jpg",
        "../../../images/postBackgrounds/2.jpg",
        "../../../images/postBackgrounds/3.jpg",
        "../../../images/postBackgrounds/4.jpg",
        "../../../images/postBackgrounds/5.jpg",
        "../../../images/postBackgrounds/6.jpg",
        "../../../images/postBackgrounds/7.jpg",
        "../../../images/postBackgrounds/8.jpg",
        "../../../images/postBackgrounds/9.jpg",
    ];

    const backgroundHandler = (i) => {
        // 设置由 backgroundRef 引用的元素的背景图片
        backgroundRef.current.style.backgroundImage = `url(${postBackgrounds[i]})`;
        // 使用选定的背景设置背景状态
        setBackground(postBackgrounds[i]);
        // 将 CSS 类 "bgHander" 添加到由 backgroundRef 引用的元素上
        backgroundRef.current.classList.add("bgHandler");
    };

    const removeBackgrounderHander = (i) => {
        backgroundRef.current.style.backgroundImage = "";
        setBackground("");
        backgroundRef.current.classList.remove("bgHandler");
    };

    return(
        <div className={type2 ? "images_input" : ""}>
            <div className={!type2 ? "flex_center" : ""} ref={backgroundRef}>
                <textarea 
                    ref={textRef}
                    maxLength="250"
                    value={text}
                    placeholder={`What's on your mind, ${user.first_name}`}
                    // 如果是 type2 类型的界面会缩小
                    className={`post_input ${type2 ? "input2" : ""}`}
                    onChange={(event) => setText(event.target.value)}
                    style={{
                        paddingTop: `${
                          background
                            //这部分计算了一个动态的值，根据 textRef 引用的当前值的长度来调整 paddingTop。
                            ? Math.abs(textRef.current.value.length * 0.1 - 32)
                            : "0"
                        }%`, //因为 paddingTop 通常使用百分比来设置，特别是在响应式设计中。
                    }}
                ></textarea>
            </div>

            <div className={!type2 ? "post_emojis_wrap" : ""}>
                {picker &&(
                    // 如果是 type2 类型的 表情界面的位置会发生改变
                    <div className={`comment_emoji_picker ${type2 ? "movepicker2" : "rlmove"}`}>
                        <Picker onEmojiClick={handleEmoji} />
                    </div>
                )}

                {/* 背景为Aa彩虹的标志：用来选择背景的  */}
                {!type2 && <img src="../../../icons/colorful.png" alt="" onClick={() => {setShowBackgrounds((prev) => !prev)}}/>}
                {!type2 && showBackgrounds && (
                    <div className="post_backgrounds">
                        <div className="no_bg" onClick={() => {removeBackgrounderHander()}}></div>
                        {
                            postBackgrounds.map((bg, i) => (
                                <img src={bg} key={i} alt="" onClick={() => {backgroundHandler(i)}}/>
                            ))
                        }
                    </div>
                )}
            
                {/* 打开选择“表情”的页面 */}
                <i className={`emoji_icon_large ${type2 ? "moveleft" : ""}`} onClick={() => {setPicker((prev) => !prev)}}></i>
            </div>
        </div>
    );
}