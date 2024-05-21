export default function Bio({infos, handleChange, max, setShowBio, updateDetails, placeholder, name, detail, setShow, rel}) {
    return(
        <div className="add_bio_wrap">
            {rel ? ( //当更改 Relationship 属性的时候才会出现这一部分
                <select className="select_rel" name={name} value={infos.relationshio} onChange={handleChange}>
                    <option value="Single">Single</option>
                    <option value="In a relationship">In a relationship</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                </select>
            ) : ( //除了更改 Relationship 时都显示文字输入框
                <textarea placeholder={placeholder} name={name} value={infos?.[name]} maxLength={detail ? 25 : 100}
                    className="textarea_blue details_input" onChange={handleChange}></textarea>
            )}

            {!detail && (<div className="remaining">{max} characters remaining</div>)}
            <div className="flex">
                <div className="flex flex_left">
                    <i className="public_icon"></i>Public
                </div>
                <div className="flex flex_right">
                    <button className="gray_btn" onClick={() => (!detail ? setShowBio(false) : setShow(false))}>Cancel</button>
                    <button className="blue_btn" onClick={() => {
                        updateDetails();
                        if(detail){
                            setShow(false);
                        }
                    }}>Save</button>
                </div>
            </div>
        </div>
    );
}