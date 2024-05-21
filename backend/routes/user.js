const express = require("express");
const { register, activateAccount, login, sendVerification, findUser, sendResetPasswordCode, validateResetCode, 
    changePassword, getProfile, updateProfilePicture, updateCover, updateDetails, addFriend, cancelRequest,
    follow, unfollow, acceptRequest, unfriend, deleteRequest, search, addToSearchHistory, getSearchHistory,
    removeFromSearch, getFriendsPageInfos
} = require("../controllers/user");
const {authUser} = require("../middlewares/auth")

const router = express.Router();

router.post("/register", register);
router.post("/activate", authUser, activateAccount);
router.post("/login", login);

/*当向“/sendVerification”发出 POST 请求时，authUser首先执行中间件。如果 JWT 有效，则会将解码后的用户信息添加到请求 ( req.user) 中。
然后，sendVerification执行该函数，可以从中获取用户信息req.user并进行与认证相关的具体逻辑。 */
router.post("/sendVerification", authUser, sendVerification);

router.post("/findUser", findUser);
router.post("/sendResetPasswordCode", sendResetPasswordCode);
router.post("/validateResetCode", validateResetCode);
router.post("/changePassword", changePassword);
router.get("/getProfile/:username", authUser ,getProfile);
router.put("/updateProfilePicture", authUser, updateProfilePicture);
router.put("/updateCover", authUser, updateCover);
router.put("/updateDetails", authUser, updateDetails);
router.put("/addFriend/:id", authUser, addFriend);
router.put("/cancelRequest/:id", authUser, cancelRequest);
router.put("/follow/:id", authUser, follow);
router.put("/unfollow/:id", authUser, unfollow);
router.put("/acceptRequest/:id", authUser, acceptRequest);
router.put("/unfriend/:id", authUser, unfriend);
router.put("/deleteRequest/:id", authUser, deleteRequest);
router.post("/search/:searchTerm", authUser, search);
router.put("/addToSearchHistory", authUser, addToSearchHistory);
router.get("/getSearchHistory", authUser, getSearchHistory);
router.put("/removeFromSearch", authUser, removeFromSearch);
router.get("/getFriendsPageInfos", authUser, getFriendsPageInfos);

module.exports = router;
