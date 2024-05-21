// 将 Data URI 转换为 Blob 对象，便于在 JavaScript 中处理和操作。
export default function dataURItoBlob(dataURI) {
    var byteString;
    // 检查 Data URI 是否包含 base64 编码
    if (dataURI.split(",")[0].indexOf("base64") >= 0) {
        // 如果是 base64 编码，使用 atob 进行解码
        byteString = atob(dataURI.split(",")[1]);
    } else {
        // 否则，使用 unescape 进行解码
        byteString = unescape(dataURI.split(",")[1]);
    }

    // 获取 Data URI 中的 MIME 类型
    var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

    // 将解码后的数据存储为 Uint8Array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    // 使用 Uint8Array 创建 Blob 对象，并设置 MIME 类型
    return new Blob([ia], { type: mimeString });
}
