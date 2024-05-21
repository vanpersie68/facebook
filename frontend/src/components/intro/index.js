import { useEffect, useState } from "react";
import Bio from "./Bio";
import axios from "axios";
import { useSelector } from "react-redux";
import EditDetails from "./EditDetails";
import "./style.css";

export default function Intro({ detailss, visitor, setOthername }) {
    const { user } = useSelector((state) => ({ ...state }));
    // 用来存储用户所有details信息的
    const [details, setDetails] = useState();
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        // 当组件第一次创建时，需要给details设置值
        setDetails(detailss);
    }, [detailss]);

    const initial = { 
        bio: details?.bio ? details.bio : "",
        othername: details?.othername ? details.othername : "",
        job: details?.job ? details.job : "",
        workplace: details?.workplace ? details.workplace : "",
        highSchool: details?.highSchool ? details.highSchool : "",
        college: details?.college ? details.college : "",
        currentCity: details?.currentCity ? details.currentCity : "",
        hometown: details?.hometown ? details.hometown : "",
        relationship: details?.relationship ? details.relationship : "",
        instagram: details?.instagram ? details.instagram : "",
    };

    // 用于更新用户的 details
    const [infos, setInfos] = useState(initial);
    // 是否显示 自我介绍的话
    const [showBio, setShowBio] = useState(false);
    // 输入框中 允许输入字符的长度
    const [max, setMax] = useState(infos?.bio ? 100 - infos?.bio.length : 100);

    const updateDetails = async() => {
        try{
            const {data} = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/updateDetails`, {infos}, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });

            setShowBio(false);
            setDetails(data);
            setOthername(data.othername);
        } catch(error){
            console.log(error.response.data.message);
        }
    };

    // 更新输入框中输入的值
    const handleChange = (e) => {
        // 根据 infos中 键值名称进行更新操作
        const {name, value} = e.target;
        setInfos({ ...infos, [name]: value });
        console.log("infos的值是: ", infos);
        setMax(100 - e.target.value.length);
    };
 
    return(
        <div className="profile_card">
            <div className="profile_card_header">Intro</div>
            {/* 显示自我介绍内容 */}
            {details?.bio && !showBio && (
                <div className="info_col">
                    {/* 显示自我介绍内容 */}
                    <span className="info_text">{details?.bio}</span>
                    {/* 只有用户自己能够曹祖 */}
                    {!visitor && (
                        // 当点击编辑 自我介绍的时候，要关闭 显示自我介绍的话
                        <button className="gray_btn hover1" onClick={() => setShowBio(true)}> Edit Bio </button>
                    )}
                </div>
            )}

            {!details?.bio && !showBio && !visitor && (
                <button className="gray_btn hover1 w100" onClick={() => setShowBio(true)}>Add Bio</button>
            )}

            {/* 编辑自我介绍 */}
            {showBio && (
                <Bio infos={infos} max={max} handleChange={handleChange} setShowBio={setShowBio} 
                    updateDetails={updateDetails} placeholder="Add Bio" name="bio" />
            )}

            {details?.job && details?.workplace ? (
                <div className="info_profile">
                    <img src="../../../icons/job.png" alt=""/>works as {details?.job} at <b>{details?.workplace}</b>
                </div>
            ) : details?.job && !details?.workplace ? (
                <div className="info_profile">
                    <img src="../../../icons/job.png" alt=""/>works at {details?.job}
                </div>
            ) : details?.workplace && !details?.job && (
                <div className="info_profile">
                    <img src="../../../icons/job.png" alt=""/>works at {details?.workplace}
                </div>
            )}

            {details?.relationship && (
                <div className="info_profile">
                    <img src="../../../icons/relationship.png" alt="" />{details?.relationship}
                </div>
            )}
            {details?.college && (
                <div className="info_profile">
                    <img src="../../../icons/studies.png" alt="" />studied at {details?.college}
                </div>
            )}
            {details?.highSchool && (
                <div className="info_profile">
                    <img src="../../../icons/studies.png" alt="" />studied at {details?.highSchool}
                </div>
            )}
            {details?.currentCity && (
                <div className="info_profile">
                    <img src="../../../icons/home.png" alt="" />Lives in {details?.currentCity}
                </div>
            )}
            {details?.hometown && (
                <div className="info_profile">
                    <img src="../../../icons/home.png" alt="" />From {details?.hometown}
                </div>
            )}
            {details?.hometown && (
                <div className="info_profile">
                    <img src="../../../icons/instagram.png" alt="" />
                    <a href={`https://www.instagram.com/${details?.instagram}`} target="_blank">{details?.instagram}</a>
                </div>
            )}

            {!visitor && (
                <button className="gray_btn hover1 w100" onClick={() => setVisible(true)}>Edit Details</button>
            )}
            {visible && !visitor && (
                <EditDetails details={details} handleChange={handleChange} updateDetails={updateDetails} infos={infos} setVisible={setVisible} />
            )}

            {!visitor && (
                <button className="gray_btn hover1 w100">Add Hobbies</button>
            )}
            {!visitor && (
                <button className="gray_btn hover1 w100">Add Featured</button>
            )}
        </div>
    );
}
