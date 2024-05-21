//userReducer: 这是 reducer 函数的名称。在 Redux 中，reducer 负责根据分派的 action 处理状态的转换。

import Cookies from "js-cookie";

//state表示 reducer 负责的当前状态。在这种情况下，默认状态设置为 null; action 是描述要对状态进行的更改类型的纯 JavaScript 对象。
export function userReducer(state=Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null, action){
    switch(action.type){
        case "LOGIN":
            return action.payload; //如果 action 类型是 "LOGIN"，则 reducer 返回 action 的 payload 属性。通常，payload 包含有关状态更改的信息。
        case "LOGOUT":
            return null;
        case "UPDATEPICTURE":
            return { ...state, picture: action.payload };
        case "VERIFY": 
            return { ...state, verified: action.payload };
        default:
            return state;
    }
}