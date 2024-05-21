import {combineReducers} from "redux";
import {userReducer} from "./userReducer";
import { themeReducer } from "./themeReducer";

/*这段代码是使用 redux 中的 combineReducers 函数来组合多个 reducer 的典型例子 */
const rootReducer = combineReducers({
    user: userReducer,
    darkTheme: themeReducer,
});

export default rootReducer;