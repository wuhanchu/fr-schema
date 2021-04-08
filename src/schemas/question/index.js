import { createApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { verifyJson } from "@/outter/fr-schema-antd-utils/src/utils/component"
import { message } from 'antd'
// import Minio from 'minio'
// 上传文件需要的配置

const Minio = require('minio');

const stream = require('stream');

// // 你的minio配置信息

console.log(Minio)


var minioClient = new Minio.Client({
    endPoint: '127.0.0.1',
    port: 80,
    useSSL: false,
    accessKey: 'admin',
    secretKey: 'dataknown1234'
});

// console.log(minioClient)

// base64转blob

export function toBlob(base64Data) {
    let byteString = base64Data

    if (base64Data.split(',')[0].indexOf('base64') >= 0) {
        byteString = atob(base64Data.split(',')[1]); // base64 解码

    } else {
        byteString = unescape(base64Data.split(',')[1]);

    }

    // 获取文件类型

    const mimeString = base64Data.split(';')[0].split(":")[1]; // mime类型

    // ArrayBuffer 对象用来表示通用的、固定长度的原始二进制数据缓冲区

    // let arrayBuffer = new ArrayBuffer(byteString.length) // 创建缓冲数组

    // let uintArr = new Uint8Array(arrayBuffer) // 创建视图

    const uintArr = new Uint8Array(byteString.length); // 创建视图

    for (let i = 0; i < byteString.length; i += 1) {
        uintArr[i] = byteString.charCodeAt(i);

    }

    // 生成blob

    const blob = new Blob([uintArr], {
        type: mimeString

    })

    // 使用 Blob 创建一个指向类型化数组的URL, URL.createObjectURL是new Blob文件的方法,可以生成一个普通的url,可以直接使用,比如用在img.src上

    return blob;

};

/**

* 上传文件

* @param {*} bucketName 桶名

* @param {*} file info为antd上传组件的file

* @param {*} callback 回调函数，返回下载url

*/

export function uploadFile(bucketName, file, callback) {
    // 获取文件类型及大小

    const fileName = file.name

    const mineType = file.type

    const fileSize = file.size

    // 参数

    const metadata = {
        "content-type": mineType,

        "content-length": fileSize

    }

    // 将文件转换为minio可接收的格式

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onloadend = e => {
        const dataurl = e.target.result;

        // base64转blob

        const blob = toBlob(dataurl);

        // blob转arrayBuffer

        const reader2 = new FileReader();

        reader2.readAsArrayBuffer(blob);

        reader2.onload = ex => {
            // 定义流

            const bufferStream = new stream.PassThrough();

            // 将buffer写入

            bufferStream.end(Buffer.from(ex.target.result));
            // 上传
            minioClient.putObject(bucketName, fileName, bufferStream, fileSize, metadata, err => {
                if (err == null) {
                    // 获取可下载的url

                    minioClient.presignedGetObject(bucketName, fileName, 24 * 60 * 60, (err1, presignedUrl) => {
                        if (err1) return;
                        // 将数据返回
                        callback(presignedUrl);

                    });

                }

            })

        }

    }

};

// 先判断桶是否存在, 如果可确保桶已经存在，则直接调用upload方法

export function checkedAndUpload(bucketName, info, callback) {
    minioClient.bucketExists(bucketName, err => {
        if (err) {
            minioClient.makeBucket(bucketName, 'us-east-1', err1 => {
                if (err1) {
                    console.error(`文件上传失败`);

                    return;

                }

                uploadFile(bucketName, info, callback);

            });

        } else {
            uploadFile(bucketName, info, callback);

        }

    });

}

// onChange = info => {
//     const { dispatch } = this.props;

//     const that = this;

//     if (info.file.status !== 'uploading') {
//         message.loading(`${info.file.name} 文件上传中，请等待`);

//     }

//     if (info.file.status === 'done') {
//         checkedAndUpload('resources', info, res => {
//             // 输出url

//             message.success(`${info.file.name}文件上传成功`);

//             const params = {
//                 url: res,

//                 key: that.state.uploadKey

//             }

//             console.log(res);

//             dispatch(RESOURCES_UPLOAD(params))

//         });

//     } else if (info.file.status === 'error') {
//         message.error(`${info.file.name}文件上传失败`);

//     }

// };

// render() {
//     // 上传组件 // 调用minio进行上传文件

//     const uploadProps = {
//         name: 'file',

//         headers: {
//             authorization: 'authorization-text',

//         },

//         onChange: this.onChange,

//     };

//     return

// }

const schema = {
    id: {
        title: "编号",
        sorter: true,
        addHide: true,
        editHide: true,
        readOnly: true,
    },

    question_standard: {
        title: "标准问",
        required: true,
        searchPrefix: "like",
        type: schemaFieldType.TextArea,
        props: {
            // 最小高度
            autoSize: { minRows: 2, maxRows: 6 },
        },
        itemProps: {
            labelCol: { span: 4 },
        },
        sorter: true,
    },
    question_extend: {
        title: "扩展问",
        // type: schemaFieldType.Select,
        type: schemaFieldType.TextArea,
        props: {
            autoSize: { minRows: 2, maxRows: 6 },
        },
        listHide: true,
        exportConcat: true,
        extra: "每行表示一个问题",
        itemProps: {
            labelCol: { span: 4 },
        },
    },

    group: {
        title: "分组",
        searchPrefix: "like",
        itemProps: {
            labelCol: { span: 4 },
        },
        // required: true,
        sorter: true,
    },
    label: {
        title: "标签",
        type: schemaFieldType.Select,
        props: {
            mode: "tags",
        },
        itemProps: {
            labelCol: { span: 4 },
        },
    },
    info: {
        title: "属性说明",
        listHide: true,
        // // required: true,
        type: schemaFieldType.AceEditor,
        itemProps: {
            labelCol: { span: 4 },
        },
        decoratorProps: { rules: verifyJson },
    },
    status: {
        title: "状态",
        listHide: true,
        itemProps: {
            labelCol: { span: 4 },
        },
    },

    answer: {
        title: "答案",
        required: true,
        listHide: true,
        type: schemaFieldType.BraftEditor,
        span: 24,
        lineWidth: "780px",
        props: {
            style: {
                height: "300px",
                border: "1px solid #d9d9d9",
                overflow: "hidden",
            },
            media: {
                // uploadFn: (param) => {
                //     console.log(param)
                //     // param.progress(100)
                //     checkedAndUpload('testxujinhao111', param.file, res => {
                //         // 输出url
                //         message.success(`文件上传成功`);
                //         param.success({
                //             url: res,
                //             meta: {
                //             id: 'xxx',
                //             title: 'xxx',
                //             alt: 'xxx',
                //             loop: true, // 指定音视频是否循环播放
                //             autoPlay: true, // 指定音视频是否自动播放
                //             controls: true, // 指定音视频是否显示控制栏
                //             //   poster: 'http://xxx/xx.png', // 指定视频播放器的封面
                //             }
                //         })
                //     });
                // }
                accepts: {
                    image: 'image/png,image/jpeg,image/gif,image/webp,image/apng,image/svg',
                    video: false,
                    audio: false
                }
            },
            controls: [
                "undo",
                "redo",
                "separator",
                "font-size",
                "line-height",
                "letter-spacing",
                "text-color",
                "bold",
                "italic",
                "underline",
                "text-indent",
                "text-align",
                "list-ul",
                // "list-ol",
                "media",
                "blockquote",
                "code",
                "separator",
                "link",
                {
                    key: "fullscreen",
                    text: <b>全屏</b>,
                },
            ],
        },
        itemProps: {
            labelCol: { span: 4 },
        },
    },
}

const service = createApi("question", schema, null, "eq.")
service.get = async function (args) {
    const res = await createApi("question", schema, null, "eq.").get(args)
    let list = res.list.map((item) => {
        console.log({
            ...item,
            question_extend: item.question_extend
                ? item.question_extend.join("\n")
                : null,
        })
        return {
            ...item,
            question_extend: item.question_extend
                ? item.question_extend.join("\n")
                : null,
        }
    })
    return { ...res, list: list }
}
service.post = async function (args) {
    let question_extend = null
    if (args.question_extend) {
        question_extend = args.question_extend.split("\n")
    }
    const res = await createApi("question", schema, null, "eq.").post({
        ...args,
        question_extend: question_extend,
    })

    return res
}
service.patch = async function (args) {
    let question_extend = null
    if (args.question_extend) {
        question_extend = args.question_extend.split("\n")
    }
    const res = await createApi("question", schema, null, "eq.").patch({
        ...args,
        question_extend: question_extend,
    })

    return res
}
service.search = createApi("rpc/question_search", schema).getBasic

export default {
    schema,
    service,
}
