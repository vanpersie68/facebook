import axios from "axios";
import { useEffect, useReducer, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { profileReducer } from "../../functions/reducers";
import Header from "../../components/header";
import Cover from "./Cover";
import ProfilePictureInfos from "./ProfilePictureInfos";
import ProfileMenu from "./ProfileMenu";
import PplYouMayKnow from "./PplYouMayKnow";
import CreatePost from "../../components/createPost";
import GridPosts from "./GridPosts";
import "./style.css";
import Post from "../../components/post";
import Photos from "./Photos";
import Friends from "./Friends";
import Intro from "../../components/intro";
import { useMediaQuery } from "react-responsive";
import CreatePostPopup from "../../components/createPostPopup";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { HashLoader } from "react-spinners";

export default function Profile({ getAllPosts}){
    const [visible, setVisible] = useState(false);
    const {username} = useParams();
    const navigate = useNavigate();
    const {user} = useSelector((state) => ({...state}));
    const [photos, setPhotos] = useState({});

    // 如果没有定义查询用户的名字，则查询当前登录的用户
    var userName = username === undefined ? user.username : username;
    // 判断访问者是不是用户自己
    var visitor = userName === user.username ? false : true;
    
    const [{ loading, error, profile }, dispatch] = useReducer(profileReducer, {
        loading: false,
        profile: {},
        error: "",
    });

    useEffect(() => {
        getProfile();
    }, [userName]);

    useEffect(() => {
        setOthername(profile?.details?.otherName);
    }, [profile]);

    const [othername, setOthername] = useState();
    const path = `${userName}/*`;
    const max = 30;
    const sort = "desc";

    const getProfile = async() => {
        try{
            dispatch({ type: "PROFILE_REQUEST" });
            const {data} = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/getProfile/${userName}`,{
                headers: {
                    Authorization: `Bearer ${user.token}`,
                }
            });

            if(data.ok === false){
                navigate("/profile");
            } else {
                try{
                    // 获取用户上传的所有图片
                    const images = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/listImages`, {path, sort, max}, {
                        headers: {
                            Authorization: `Bearer ${user.token}`,
                        },
                    });
                    setPhotos(images.data);
                } catch(error){
                    console.log(error);
                }
                dispatch({ type: "PROFILE_SUCCESS", payload: data });
            }
        } catch(error){
            dispatch({ type: "PROFILE_ERROR", payload: error.response.data.message });
        }
    };

    /* ----- 这部分用来处理 profile 页面 向下滚动时的操作：由于左侧比右侧的长度小，所以当页面向下滚动的时候，一旦左侧页面到底，将固定不动，只有右侧页面向下滚动 -------- */
    const profileTop = useRef(null);
    const leftSide = useRef(null);
    const [height, setHeight] = useState();
    const [leftHeight, setLeftHeight] = useState();
    const [scrollHeight, setScrollHeight] = useState();
    useEffect(() => {
        // 获取 profileTop 元素的高度并加上 300，将结果设置为 height 状态的新值。
        setHeight(profileTop.current.clientHeight + 300);
        // 获取 leftSide 元素的高度，将结果设置为 leftHeight 状态的新值。
        setLeftHeight(leftSide.current.clientHeight);
        // 添加滚动事件监听器，调用 getScroll 函数，并设置为被动监听以提高性能。
        window.addEventListener("scroll", getScroll, { passive: true });

        // 在组件卸载或更新前移除滚动事件监听器。
        return () => {
            window.addEventListener("scroll", getScroll, { passive: true });
        };
    }, [loading, scrollHeight]);

    // 检查屏幕宽度是否大于 901 像素。
    const check = useMediaQuery({
        query: "(min-width:901px)",
    });

    // 用于更新 scrollHeight 状态的值为当前页面的垂直偏移量。
    const getScroll = () => {
        setScrollHeight(window.pageYOffset);
    };
    /* ----------------------------------------------------------------------------------------------------------------------------------------------------- */

    return (
        <div className="profile">
            {visible && (
                <CreatePostPopup user={user} setVisible={setVisible} 
                    posts={profile?.posts} dispatch={dispatch} profile />
            )}
            <Header page="profile" getAllPosts={getAllPosts}/>
            <div className="profile_top" ref={profileTop}>
                <div className="profile_container">
                    {loading ? (
                        <>
                            <div className="profile_cover">
                                <Skeleton height="347px" containerClassName="avatar-skeleton" 
                                    style={{borderRadius: "8px"}}/>
                            </div>

                            <div className="profile_img_wrap" style={{marginBottom: "-3rem", 
                                transform: "translateY(-8px) "}}>
                                <div className="profile_w_left">
                                    <Skeleton circle height="180px" width="180px" containerClassName="avatar-skeleton" 
                                        style={{transform: "translateY(-3.3rem)"}}/>
                                    <div className="profile_w_col">
                                        <div className="profile_name">
                                            <Skeleton height="35px" width="200px" containerClassName="avatar-skeleton" />
                                            <Skeleton height="30px" width="100px" containerClassName="avatar-skeleton" 
                                                style={{transform: "translateY(2.5px) "}}/>
                                        </div>

                                        <div className="profile_friend_count">
                                            <Skeleton height="20px" width="90px" containerClassName="avatar-skeleton" 
                                                style={{marginTop: "5px"}}/>
                                        </div>

                                        <div className="profile_friend_imgs">
                                            {Array.from(new Array(6), (val, i) => i + 1).map(
                                                (id, i) => (
                                                    <Skeleton height="32px" width="32px" containerClassName="avatar-skeleton" 
                                                        style={{ transform: `translateX(${-i * 7}px)` }} />
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className={`friendship ${!visitor && "fix"}`}>
                                    <Skeleton height="36px" width={120} containerClassName="avatar-skeleton"/>
                                    <div className="flex">
                                        <Skeleton height="36px" width={120} containerClassName="avatar-skeleton" />
                                        {visitor && (
                                            <Skeleton height="36px" width={120} containerClassName="avatar-skeleton" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <Cover cover={profile.cover} visitor={visitor} photos={photos.resources} />
                            <ProfilePictureInfos profile={profile} visitor={visitor} photos={photos.resources} othername={othername} />
                            <ProfileMenu />
                        </>
                    )}
                </div>
            </div>

            <div className="profile_bottom">
                <div className="profile_container">
                    <div className="bottom_container">
                        <PplYouMayKnow />
                        <div className={`profile_grid ${check && scrollHeight >= height && leftHeight > 1000
                            ? "scrollFixed showLess" : check && scrollHeight >= height && leftHeight < 1000 && "scrolledFixed showMore"
                        }`}>
                            <div className="profile_left" ref={leftSide}>
                                {loading ? (
                                    <>
                                        <div className="profile_card">
                                            <div className="profile_card_header">Intro</div>
                                            <div className="sekelton_loader">
                                                <HashLoader color="#1876f2" />
                                            </div>
                                        </div>

                                        <div className="profile_card">
                                            <div className="profile_card_header">
                                                Photos
                                                <div className="profile_header_link">
                                                    Sell all photos
                                                </div>
                                            </div>

                                            <div className="sekelton_loader">
                                                <HashLoader color="#1876f2" />
                                            </div>
                                        </div>

                                        <div className="profile_card">
                                            <div className="profile_card_header">
                                                Friends
                                                <div className="profile_header_link">
                                                    See all friends
                                                </div>
                                            </div>
                                            
                                            <div className="sekelton_loader">
                                                <HashLoader color="#1876f2" />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Intro detailss={profile.details} visitor={visitor} setOthername={setOthername} />
                                        <Photos username={userName} token={user.token} photos={photos}/>
                                        <Friends friends={profile.friends}/>
                                    </>
                                )}
                                <div className="relative_fb_copyright">
                                    <Link to="/">Privacy </Link>
                                    <span>. </span>
                                    <Link to="/">Terms </Link>                                    
                                    <span>. </span>
                                    <Link to="/">Advertising </Link>                                    
                                    <span>. </span>
                                    <Link to="/">Ad Choices 
                                        <i className="ad_choices_icon"></i>{" "}
                                    </Link>
                                    <span>. </span>
                                    <Link to="/"></Link>Cookies <span>. </span>
                                    <Link to="/">More </Link>
                                    <span>. </span> <br />
                                    Meta © 2022
                                </div>
                            </div>
                            <div className="profile_right">
                                {!visitor && (
                                    <CreatePost user={user} profile setVisible={setVisible} />
                                )}
                                <GridPosts />
                                {loading ? (
                                    <div className="sekelton_loader">
                                        <HashLoader color="#1876f2" />
                                    </div>
                                ): (
                                    <div className="posts">
                                        {profile.posts && profile.posts.length ? (
                                            profile.posts.map((post) => (
                                                <Post post={post} user={user} key={post._id} profile />
                                            ))
                                        ) : (
                                            <div className="no_posts">No posts available</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}