import { useRef, useState, useEffect } from "react";
import useClickOutside from "../../helpers/clickOutside";
import {useSelector} from "react-redux";
import {acceptRequest, addFriend, cancelRequest, deleteRequest, follow, unfollow, unfriend } from "../../functions/user";

export default function Friendship({friendshipp, profileid}){
    // const friendship = {
    //     friends: false, //双方是否都是好友
    //     following: false, //发送者follow了接收者
    //     requestSent: false, //发送者 发送了 follow 接收者的请求
    //     requestReceived: true, //接收者 发送了 follow 发送者的请求 
    // };

    const [friendship, setFriendship] = useState(friendshipp);
    useEffect(() => {
        setFriendship(friendshipp);
    }, [friendshipp]);
    const [friendsMenu, setFriendsMenu] = useState(false);
    const [respondMenu, setRespondMenu] = useState(false);
    const menu = useRef(null);
    const menu1 = useRef(null);
    useClickOutside(menu, () => setFriendsMenu(false));
    useClickOutside(menu1, () => setRespondMenu(false));
    const { user } = useSelector((state) => ({ ...state }));

    const addFriendHandler = async() => {
        setFriendship({...friendship, requestSent: true, following: true});
        await addFriend(profileid, user.token);
    };

    const cancelRequestHandler = async() => {
        setFriendship({...friendship, requestSent: false, following: false});
        await cancelRequest(profileid, user.token);
    };

    const followHandler = async() => {
        setFriendship({...friendship, following: true});
        await follow(profileid, user.token);
    };

    const unfollowHandler = async() => {
        setFriendship({...friendship, following: false});
        await unfollow(profileid, user.token);
    };

    const acceptRequestHanlder = async() => {
        setFriendship({...friendship, friends: true, following: true, requestSent: false, requestReceived: false});
        await acceptRequest(profileid, user.token);
    };

    const unfriendHandler = async() => {
        setFriendship({...friendship, friends: false, following: false, requestSent: false, requestReceived: false});
        await unfriend(profileid, user.token);
    };

    const deleteRequestHanlder = async() => {
        setFriendship({...friendship, friends: false, following: false, requestSent: false, requestReceived: false});
        await deleteRequest(profileid, user.token);
    };

    return(
        <div className="friendship">
            {/* 是好友 */}
            {friendship?.friends ? (
                <div className="friends_menu_wrap">
                    <button className="gray_btn" onClick={() => setFriendsMenu(true)} >
                        <img src="../../../icons/friends.png" alt="" />
                        <span>Friends</span>
                    </button>
                    {friendsMenu && (
                        <div className="open_cover_menu" ref={menu}>
                            <div className="open_cover_menu_item hover1">
                                <img src="../../../icons/favoritesOutline.png" alt="" /> Favorites
                            </div>
                            <div className="open_cover_menu_item hover1">
                                <img src="../../../icons/editFriends.png" alt="" /> Edit Friend list
                            </div>

                            {/* 发送者follow了接收者 */}
                            {friendship?.following ? (
                                <div className="open_cover_menu_item hover1" onClick={() => unfollowHandler()}>
                                    <img src="../../../icons/unfollowOutlined.png" alt="" /> Unfollow
                                </div>
                            ) : (
                                <div className="open_cover_menu_item hover1" onClick={() => followHandler()}>
                                    <img src="../../../icons/unfollowOutlined.png" alt=""/> Follow
                                </div>
                            )}

                            <div className="open_cover_menu_item hover1" onClick={() => unfriendHandler()}>
                                <i className="unfriend_outlined_icon"></i> Unfriend
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                // 接收者没有发送请求 并且 发送者没有发送请求
                !friendship?.requestSent && !friendship?.requestReceived && (
                    <button className="blue_btn" onClick={() => addFriendHandler()}>
                        <img src="../../../icons/addFriend.png" alt="" className="invert" />
                        <span>Add Friend</span>
                    </button>
                )
            )}

            {/* 发送者 发送了 follow 接收者的请求 */}
            {friendship?.requestSent ? (
                <button className="blue_btn" onClick={() => cancelRequestHandler()}>
                    <img src="../../../icons/cancelRequest.png" className="invert" alt=""/>
                    <span>Cancel Request</span>
                </button>
            ) : (
                // 接收者 发送了 follow 发送者的请求 
                friendship?.requestReceived && (
                    <div className="friends_menu_wrap">
                        <button className="gray_btn" onClick={() => setRespondMenu(true)}>
                            <img src="../../../icons/friends.png" alt="" />
                            <span>Respond</span>
                        </button>
                        {respondMenu && (
                            <div className="open_cover_menu" ref={menu1}>
                                <div className="open_cover_menu_item hover1" onClick={() => acceptRequestHanlder()}>Confirm</div>
                                <div className="open_cover_menu_item hover1" onClick={() => deleteRequestHanlder()}>Delete</div>
                            </div>
                        )}
                    </div>
                )
            )}

            <div className="flex">
                {/* 发送者follow了这个用户 */}
                {friendship?.following ? (
                    <button className="gray_btn" onClick={() => unfollowHandler()}> 
                        <img src="../../../icons/follow.png" alt="" />
                        <span>Following</span>
                    </button>
                ) : (
                    // 发送者没有follow这个用户
                    <button className="blue_btn" onClick={() => followHandler()}>
                        <img src="../../../icons/follow.png" className="invert" alt="" />
                        <span>Follow</span>
                    </button>
                )}

                <button className={friendship?.friends ? "blue_btn" : "gray_btn"} >
                    <img src="../../../icons/message.png" className={friendship?.friends && "invert"} />
                    <span>Message</span>
                </button>
            </div>
        </div>
    );
}