const Minio = require("minio")
const stream = require("stream")

// let endPoint = 'server.aiknown.cn'
// let port = 32123
// let isHttps = false
// console.log(document.location.protocol)
// // 你的minio配置信息
// if (document.domain === "server.aiknown.cn") {
//     endPoint = "server.aiknown.cn"
//     port = 31321
//     isHttps = true
// }
// var minioClient = new Minio.Client({
//     endPoint: endPoint,
//     port: port,
//     useSSL: isHttps,
//     accessKey: "FJS8ZI8LN22F6Q08RFWW",
//     secretKey: "Xx1h02bOmKyXNRn0Hc2P2+B312zyhrDpwvkSJcLH",
//     sessionToken: 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3NLZXkiOiJGSlM4Wkk4TE4yMkY2UTA4UkZXVyIsImV4cCI6MzYwMDAwMDAwMDAwMCwicG9saWN5IjoiZ2xvYmFsLXBvbGljeSIsInNlc3Npb25Qb2xpY3kiOiJleUpXWlhKemFXOXVJam9pTWpBeE1pMHhNQzB4TnlJc0lsTjBZWFJsYldWdWRDSTZXM3NpVTJsa0lqb2lJaXdpUldabVpXTjBJam9pUVd4c2IzY2lMQ0pCWTNScGIyNGlPbHNpY3pNNktpSmRMQ0pTWlhOdmRYSmpaU0k2SW1GeWJqcGhkM002Y3pNNk9qcDZhMjV2ZDI1cGJtWnZMeW9pZlYxOSJ9.1RWlTMPG-EtUgKav6mTBpo82bG0azS7M8rkneCiF6wuLOz97UWUc69X0qBOtZWIcYf15QYOuJIWlEPqiZBwzHg'
// })

// base64转blob
export function toBlob(base64Data) {
    let byteString = base64Data
    if (base64Data.split(",")[0].indexOf("base64") >= 0) {
        byteString = atob(base64Data.split(",")[1]) // base64 解码
    } else {
        byteString = unescape(base64Data.split(",")[1])
    }
    // 获取文件类型
    const mimeString = base64Data.split(";")[0].split(":")[1] // mime类型
    // ArrayBuffer 对象用来表示通用的、固定长度的原始二进制数据缓冲区
    // let arrayBuffer = new ArrayBuffer(byteString.length) // 创建缓冲数组
    // let uintArr = new Uint8Array(arrayBuffer) // 创建视图
    const uintArr = new Uint8Array(byteString.length) // 创建视图
    for (let i = 0; i < byteString.length; i += 1) {
        uintArr[i] = byteString.charCodeAt(i)
    }
    // 生成blob
    const blob = new Blob([uintArr], {
        type: mimeString,
    })
    // 使用 Blob 创建一个指向类型化数组的URL, URL.createObjectURL是new Blob文件的方法,可以生成一个普通的url,可以直接使用,比如用在img.src上
    return blob
}

/**
 * 上传文件
 * @param {*} bucketName 桶名
 * @param {*} file info为antd上传组件的file
 * @param {*} callback 回调函数，返回下载url
 * @param {*} minioClient minio对象
 * @param {*} mininConfig 配置
 */

export function uploadFile(
    bucketName,
    file,
    minioClient,
    mininConfig,
    callback
) {
    // 获取文件类型及大小
    const fileName = file.name
    const mineType = file.type
    const fileSize = file.size
    // 参数
    const metadata = {
        "content-type": mineType,
        "content-length": fileSize,
    }

    // 将文件转换为minio可接收的格式
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = (e) => {
        const dataurl = e.target.result
        // base64转blob
        const blob = toBlob(dataurl)
        // blob转arrayBuffer
        const reader2 = new FileReader()
        reader2.readAsArrayBuffer(blob)
        reader2.onload = (ex) => {
            // 定义流
            const bufferStream = new stream.PassThrough()
            // 将buffer写入
            bufferStream.end(Buffer.from(ex.target.result))
            // 上传
            minioClient.putObject(
                bucketName,
                fileName,
                bufferStream,
                fileSize,
                metadata,
                (err) => {
                    if (err == null) {
                        // 获取可下载的url
                        minioClient.presignedGetObject(
                            bucketName,
                            fileName,
                            24 * 60 * 60,
                            (err1, presignedUrl) => {
                                if (err1) return
                                // 将数据返回
                                callback({
                                    // url: presignedUrl,
                                    url: encodeURI(
                                        mininConfig.secure
                                            ? "https://" +
                                                  mininConfig.endpoint +
                                                  "/" +
                                                  bucketName +
                                                  "/" +
                                                  fileName
                                            : "http://" +
                                                  mininConfig.endpoint +
                                                  "/" +
                                                  bucketName +
                                                  "/" +
                                                  fileName
                                    ),
                                    bucketName,
                                    fileName: file.name,
                                })
                            }
                        )
                    }
                }
            )
        }
    }
}

// 先判断桶是否存在, 如果可确保桶已经存在，则直接调用upload方法

export function checkedAndUpload(
    bucketName,
    info,
    minioClient,
    mininConfig,
    callback
) {
    minioClient.bucketExists(bucketName, (err) => {
        if (err) {
            minioClient.makeBucket(bucketName, "us-east-1", (err1) => {
                if (err1) {
                    console.error(`文件上传失败`)
                    return
                }
                uploadFile(bucketName, info, minioClient, mininConfig, callback)
            })
        } else {
            uploadFile(bucketName, info, minioClient, mininConfig, callback)
        }
    })
}

/**
 * 获取页面文件名
 * @param url 文件url
 * @param fileName 文件名称
 */
function downloadUrlFile(url, fileName) {
    url = url.replace(/\\/g, "/")
    const xhr = new XMLHttpRequest()
    xhr.open("GET", url, true)
    xhr.responseType = "blob"
    //xhr.setRequestHeader('Authorization', 'Basic a2VybWl0Omtlcm1pdA==');
    xhr.onload = () => {
        if (xhr.status === 200) {
            // 获取文件blob数据并保存
            saveAs(xhr.response, fileName)
        }
    }

    xhr.send()
}

/**
 * URL方式保存文件到本地
 * @param data 文件的blob数据
 * @param name 文件名
 */
function saveAs(data, name) {
    var urlObject = window.URL || window.webkitURL || window
    var export_blob = new Blob([data])
    var save_link = document.createElementNS(
        "http://www.w3.org/1999/xhtml",
        "a"
    )
    save_link.href = urlObject.createObjectURL(export_blob)
    save_link.download = name
    save_link.click()
}

export function downloadFile(bucketName, objectName, url) {
    // return minioClient.presignedGetObject(
    //     bucketName,
    //     objectName,
    //     24 * 60 * 60,
    //     function (err, presignedUrl) {
    //         if (err) return console.log(err)
    //         downloadUrlFile(presignedUrl, objectName)
    //         return presignedUrl
    //     }
    // )
    console.log(url)
    downloadUrlFile(url, objectName)
}
