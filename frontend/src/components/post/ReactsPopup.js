const reactsArray = [
    {
        name: "like",
        image: "../../../reacts/like.gif",
    },
    {
        name: "love",
        image: "../../../reacts/love.gif",
    },
    {
        name: "haha",
        image: "../../../reacts/haha.gif",
    },
    {
        name: "wow",
        image: "../../../reacts/wow.gif",
    },
    {
        name: "sad",
        image: "../../../reacts/sad.gif",
    },
    {
        name: "angry",
        image: "../../../reacts/angry.gif",
    },
];

export default function ReactsPopup({visible, setVisible, reactHandler}){
    return(
        <>
            {visible && (
                <div className="reacts_popup" 
                    //鼠标放在 表情包 区域后的 0.5s 后也会显示表情包组件； 否则离开 Like 区域 会导致表情包组件消失
                    onMouseOver={() => {setTimeout(() => {setVisible(true)}, 500)}} 
                    onMouseLeave={() => {setTimeout(() => {setVisible(false)}, 500)}}
                >
                    {reactsArray.map((react, i) => (
                        <div className="react" key={i} onClick={() => reactHandler(react.name)}>
                            <img src={react.image} alt="" />
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};