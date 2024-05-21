import { useEffect } from "react";

export default function useClickOutside(ref, fun){
    useEffect(() => {
        const listener = (e) => {
            /*  检查是否存在有效的 ref 引用，并且点击事件的目标是否在 ref 指向的元素内。如果是，
            说明点击发生在 ref 指向的元素内部，直接返回，不执行后续逻辑。 */
            if(!ref.current || ref.current.contains(e.target)){
                return;
            }
            //如果点击事件发生在 ref 指向的元素之外，调用传递给 Hook 的回调函数 fun。
            fun();
        }
        
        //在文档上添加两个事件监听器，分别监听鼠标按下（mousedown）和触摸屏触摸（touchstart）事件。
        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);

        return () => {
            //移除之前添加的事件监听器，以防止在组件卸载时引起内存泄漏
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [ref]); //这个清理函数只有在 ref 发生变化时才会重新运行，因为 ref 是作为 useEffect 的依赖项传递的。
}