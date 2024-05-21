import { Link } from "react-router-dom";
import "./style.css";
import Moment from "react-moment";
import { Dots, Public } from "../../svg";
import ReactsPopup from "./ReactsPopup";
import { useState, useEffect, useRef } from "react";
import CreateComment from "./CreateComment";
import Comment from "./comment";
import PostMenu from "./PostMenu";
import { getReacts } from "../../functions/post";
import { reactPost } from "../../functions/post";


export default function Post({ post, user, profile }) {
    const [visible, setVisible] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [reacts, setReacts] = useState();
    const [check, setCheck] = useState();
    const [total, setTotal] = useState(0);
    const [count, setCount] = useState(1);
    const [checkSaved, setCheckSaved] = useState();
    
    const [comments, setComments] = useState([]);
    const postRef = useRef(null);

    useEffect(() => {
        getPostReacts();
    }, [post]);
    
    useEffect(() => {
        setComments(post?.comments);
    }, [post]);

    const reactHandler = async(type) => {
        reactPost(post._id, type, user.token);
        if(check === type){
            setCheck();
            //如果找到满足条件的元素，则 findIndex 返回该元素在数组中的索引; 如果没有找到满足条件的元素，则返回 -1。
            let index = reacts.findIndex((x) => x.react === check);
            if(index !== -1){
                setReacts(prevReacts => {
                    const updatedReacts = [...prevReacts];
                    updatedReacts[index] = {...updatedReacts[index], count: updatedReacts[index].count - 1};
                    setTotal(prevTotal => prevTotal - 1);
                    return updatedReacts;
                });
            }
        } else {
            setCheck(type);
            let index = reacts.findIndex((x) => x.react === type);
            let index1 = reacts.findIndex((x) => x.react === check);
            if (index !== -1) {
                setReacts(prevReacts => { //prevReacts 是之前的状态的副本
                    const updatedReacts = [...prevReacts]; //创建状态的副本，确保不直接修改原始状态。
                    //如果找到了满足条件的元素，对这个元素进行更新。通过创建这个元素的副本，确保了不直接修改原始状态。这里是将元素的 count属性递增1。
                    updatedReacts[index] = { ...updatedReacts[index], count: updatedReacts[index].count + 1 };
                    //同时，使用 setTotal 函数更新另一个状态 total，递增1。
                    setTotal(prevTotal => prevTotal + 1);
                    //将更新后的状态返回，这将成为新的 React 状态。
                    return updatedReacts;
                });
            }

            if (index1 !== -1) {
                setReacts(prevReacts => {
                    const updatedReacts = [...prevReacts];
                    updatedReacts[index1] = { ...updatedReacts[index1], count: updatedReacts[index1].count - 1 };
                    setTotal(prevTotal => prevTotal - 1);
                    return updatedReacts;
                });
            }
        }
    };

    const getPostReacts = async() => {
        const res = await getReacts(post._id, user.token);
        setReacts(res.reacts);
        setCheck(res.check);
        setTotal(res.total);
        setCheckSaved(res.checkSaved);
    };

    const showMore = () => {
        setCount((prev) => prev + 3);
    }

    return(
        <div className="post" style={{ width: `${profile && "100%"}` }} ref={postRef}>
            <div className="post_header" >
                <Link to={`/profile/${post.user.username}`} className="post_header_left"> 
                    <img src={post.user.picture} alt="" />
                    <div className="header_col">
                        <div className="post_profile_name">
                            {post.user.first_name} {post.user.last_name}
                            <div className="updated_p">
                                {/* 更改 user.gender 中的值 */}
                                {post.type === "profilePicture" && `updated ${post.user.gender === "male" ? "his" : "her"} profile picture`}
                                {post.type === "coverPicture" && `updated ${post.user.gender === "male" ? "his" : "her"} cover picture`}
                            </div>
                        </div>
                        <div className="post_profile_privacy_date">
                            {/* 使用 Moment 组件，指定 fromNow 属性来显示相对时间，即距离当前时间的时间差。
                            interval={30} 表示每 30 秒刷新一次，确保相对时间实时更新 */}
                            <Moment fromNow interval={30}>
                                {post.createdAt}
                            </Moment>
                            . <Public color="#828387" />
                        </div>
                    </div>
                </Link>
                {/* 菜单区域 */}
                <div className="post_header_right hover1" onClick={() => setShowMenu((prev) => !prev)}>
                    <Dots color="#828387" />
                </div>
            </div>

            {post.background ? (
                <div className="post_bg" style={{backgroundImage: `url(${post.background})`}}>
                    <div className="post_bg_text">{post.text}</div>
                </div>
            ) : post.type === null ? ( //正常发布的贴子的类型是 null
                <>
                    <div className="post_text">{post.text}</div>
                    {post.images && post.images.length && (
                        <div className={
                            post.images.length === 1 ? "grid_1" : 
                            post.images.length === 2 ? "grid_2" :
                            post.images.length === 3 ? "grid_3" :
                            post.images.length === 4 ? "grid_4" :
                            post.images.length >= 5 && "grid_5"
                        }>
                            {/* 前五张图片显示 */}
                            {post.images.slice(0, 5).map((image, i) => (
                                <img src={image.url} key={i} alt="" className={`img-${i}`} />
                            ))}
                            {/* 后面的图片显示为 +数字 */}
                            {post.images.length > 5 && (
                                <div className="more-pics-shadow">
                                    +{post.images.length - 5}
                                </div>
                            )}
                        </div>
                    )}
                </>
            ) : post.type === "profilePicture" ? ( //更新头像的贴子的类型是 profilePicture
                <div className="post_profile_wrap">
                    {/* 以特殊的样式 显示更新头像的贴子的图片 */}
                    <div className="post_updated_bg">
                        <img src={post.user.cover} alt="" />
                    </div>
                    <img src={post.images[0].url} alt="" className="post_updated_picture" />
                </div>
            ) : (  //更新背景的贴子的类型是 cover
                <div className="post_cover_wrap"> 
                    <img src={post.images[0].url} alt="" />
                </div>
            )}
            <div className="post_infos">
                <div className="reacts_count">
                    <div className="reacts_count_imgs">
                        {reacts && reacts.sort((a, b) => {
                            //降序排列
                            return b.count - a.count;
                        }).slice(0, 3).map((react, i) =>  react.count > 0 && (
                            <img src={`../../../reacts/${react.react}.svg`} alt="" key={i}/>
                        ))}
                    </div>
                    <div className="reacts_count_num">{total > 0 && total}</div>
                </div>
                <div className="to_right">
                    <div className="comment_count">{comments.length} comments</div>
                    <div className="share_count">0 share</div>
                </div>
            </div>
            <div className="post_actions">
                {/* 表情包区域 */}
                <ReactsPopup visible={visible} setVisible={setVisible} reactHandler={reactHandler} />
                <div className="post_action hover1" 
                    //鼠标放在 Like 区域后的 0.5s 后显示表情包组件
                    onMouseOver={() => {setTimeout(() => {setVisible(true)}, 500)}}
                    onMouseLeave={() => {setTimeout(() => {setVisible(false)}, 500)}}
                    onClick={() => reactHandler(check ? check : "like")}
                > 
                    {check ? (
                        <img src={`../../../reacts/${check}.svg`} alt="" className="small_react" style={{width: "18px"}} />
                    ) : (
                        <i className="like_icon"></i>
                    )}
                    <span style={{color: `${check === "like" ? "#4267b2" : 
                        check === "love" ? "#f63459" : check === "haha"  ? "#f7b125" : 
                        check === "sad" ? "#f7b125" : check === "wow" ? "#f7b125" : 
                        check === "angry" ? "#e4605a" : ""}`}}>
                            {check ? check : "Like"}
                    </span>
                </div>
                <div className="post_action hover1">
                    <i className="comment_icon"></i>
                    <span>Comment</span>
                </div>
                <div className="post_action hover1">
                    <i className="share_icon"></i>
                    <span>Share</span>
                </div>
            </div>
            <div className="comments_wrap">
                <div className="comment_order"></div>
                <CreateComment user={user} postId={post._id} setComments={setComments} setCount={setCount} />
                {/* 每次仅展示一条评论 */}
                {comments && comments.sort((a, b) => {
                    return new Date(b.commentAt) - new Date(a.commentAt);
                }).slice(0, count).map((comment, i) => <Comment comment={comment} key={i} />)}

                {/* 点击更多后 会展示四条评论 */}
                {count < comments.length && (
                    <div className="view_comments" onClick={() => showMore()}>View more comments</div>
                )}
            </div>
            {showMenu && (
                <PostMenu userId={user.id} postUserId={post.user._id} imagesLength={post?.images?.length} 
                    setShowMenu={setShowMenu} postId={post._id} token={user.token} checkSaved={checkSaved}
                    setCheckSaved={setCheckSaved} images={post.images} postRef={postRef} />
            )}
        </div>
    );
}