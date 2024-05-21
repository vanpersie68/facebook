import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import "./styles/dark.css";
import "./styles/icons/icons.css";
import App from "./App";
// BrowserRouter 是 React Router 提供的一种路由方式，它使用浏览器的 pushState API 来保持 UI 和 URL 的同步。
import { BrowserRouter as Router } from "react-router-dom";
// Redux 是一个用于管理应用状态的状态管理库，createStore 是创建 Redux store 的函数。
import { createStore } from "redux";
// Provider 是 React Redux 提供的组件，用于在React应用中提供 Redux store。
import { Provider } from "react-redux";
// composeWithDevTools 是 Redux DevTools Extension 提供的函数，用于增强 Redux store 的功能
import { composeWithDevTools } from "redux-devtools-extension";
import rootReducer from "./reducers";
//创建一个常量 store 来存储 Redux store 的实例。这个实例将包含整个应用程序的状态
const store = createStore(rootReducer, composeWithDevTools());

ReactDOM.render(
    <Provider store={store}>
        <Router>
            <App />
        </Router>
    </Provider>,
    document.getElementById("root")
);
