//这是一个典型的 Redux reducer 函数，用于处理与帖子相关的状态
export function postsReducer(state, action) {
    switch (action.type) {
        case "POSTS_REQUEST":
            return { ...state, loading: true, error: "" };
        case "POSTS_SUCCESS":
            // 返回新的状态对象，设置 loading 为 false，更新帖子数据，同时清空 error
            return { ...state, loading: false, posts: action.payload, error: "" };
        case "POSTS_ERROR":
            // 返回新的状态对象，设置 loading 为 false，更新 error，同时清空帖子数据
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
};

export function profileReducer(state, action) {
    switch (action.type) {
        case "PROFILE_REQUEST":
            return { ...state, loading: true, error: "" };
        case "PROFILE_SUCCESS":
            return { ...state, loading: false, profile: action.payload, error: "" };
        case "PROFILE_POSTS":
            return { loading: false, profile: { ...state.profile, posts: action.payload }, error: "" };
        case "PROFILE_ERROR":
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
};

export function photosReducer(state, action) {
    switch (action.type) {
        case "PHOTOS_REQUEST":
            return { ...state, loading: true, error: "" };
        case "PHOTOS_SUCCESS":
            return { ...state, loading: false, photos: action.payload, error: "" };
        case "PHOTOS_ERROR":
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
};

export function friendspage(state, action) {
    switch (action.type) {
        case "FRIENDS_REQUEST":
            return { ...state, loading: true, error: "" };
        case "FRIENDS_SUCCESS":
            return { ...state, loading: false, data: action.payload, error: "" };
        case "FRIENDS_ERROR":
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
}
  