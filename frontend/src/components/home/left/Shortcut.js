export default function Shortcut({ link, img, name }) {
    return(
        /* 这是 HTML 中的 target 属性的一种设置，用于指定链接在何处打开。具体而言，"_blank" 表示链接将在新的浏览器窗口或标签页
        中打开。这样，用户点击链接时，会在新标签页中打开与链接关联的页面。rel="noreferrer" 的作用是防止在用户点击链接时发送 HTTP referrer 
        头部信息。这样，用户访问链接的源信息将不被传递给链接目标页面，提供了一定的隐私保护 */
        <a href={link} target="_blank" className="shortcut_item">
            <img src={img} alt="" />
            <span>{name}</span>
        </a>
    );
}