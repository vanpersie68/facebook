import { Link } from "react-router-dom";

export default function Friends({ friends }) {
    return (
        <div className="profile_card">
            <div className="profile_card_header">
                Friends
                <div className="profile_header_link">See all friends</div>
            </div>
            {friends && (
                <div className="profile_card_count">
                    {/* 显示有多少个朋友 */}
                    {friends.length === 0 ? "" : friends.length === 1 
                        ? "1 friend" : `${friends.length} friends`}
                </div>
            )}

            <div className="profile_card_grid">
                {/* 显示朋友 */}
                {friends && friends.slice(0, 9).map((friend, i) => (
                    <Link to={`/profile/${friend.username}`} className="profile_photo_card" key={i}>
                        <img src={friend.picture} alt="" />
                        <span>
                            {friend.first_name} {friend.last_name}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}