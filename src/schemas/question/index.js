import { createApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import projectService from "./../project"
import { verifyJson } from "@/outter/fr-schema-antd-utils/src/utils/component"
import { message } from "antd"
import { checkedAndUpload } from "@/utils/minio"
const Minio = require("minio")

const schema = {
    question_standard: {
        title: "标准问",
        required: true,
        searchPrefix: "like",
        type: schemaFieldType.TextArea,
        props: {
            // 最小高度
            autoSize: { minRows: 2, maxRows: 6 },
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
    },

    group: {
        title: "分组",
        searchPrefix: "like",
        // required: true,
        sorter: true,
    },
    label: {
        title: "标签",
        type: schemaFieldType.Select,
        props: {
            mode: "tags",
        },
    },
    global_key: {
        title: "全局变量",
    },
    answer: {
        title: "答案",
        required: true,
        listHide: true,
        type: schemaFieldType.BraftEditor,
        // span: 24,
        position: "right",
        itemProps: {
            labelCol: {
                span: 4,
            },
        },
        lineWidth: "480px",
        props: {
            style: {
                // width: "348px",
                height: "388px",

                border: "1px solid #d9d9d9",
                // overflow: "scroll",
            },
            wrapperWidth: "900px",
            wrapperStyle: {
                marginLeft: "-34px",
                marginTop: "20px",
            },
            media: {
                uploadFn: async (param) => {
                    let bucketName = "zknowninfo"
                    // param.progress(100)
                    // await service.getMinioToken()
                    let minioConfig = (
                        await projectService.service.getMinioToken()
                    ).data
                    var minioClient = new Minio.Client({
                        endPoint: minioConfig.endpoint,
                        port: parseInt(minioConfig.port),
                        useSSL: minioConfig.secure,
                        accessKey: minioConfig.AccessKeyId,
                        secretKey: minioConfig.SecretAccessKey,
                        sessionToken: minioConfig.SessionToken,
                    })
                    checkedAndUpload(
                        bucketName,
                        param.file,
                        minioClient,
                        minioConfig,
                        (res) => {
                            // 输出url
                            let fileName = param.file.name
                            message.success(`文件上传成功`)
                            param.success({
                                url: minioConfig.secure
                                    ? "https://" +
                                      minioConfig.endpoint +
                                      "/" +
                                      bucketName +
                                      "/" +
                                      fileName
                                    : "http://" +
                                      minioConfig.endpoint +
                                      "/" +
                                      bucketName +
                                      "/" +
                                      fileName,
                                meta: {
                                    loop: true, // 指定音视频是否循环播放
                                    autoPlay: false, // 指定音视频是否自动播放
                                    controls: false, // 指定音视频是否显示控制栏
                                    //   poster: 'http://xxx/xx.png', // 指定视频播放器的封面
                                },
                            })
                        }
                    )
                },
            },
            // 全屏 fullscreen
            controls: [
                // "undo",
                // "redo",
                // "separator",
                "font-size",
                // "line-height",
                // "letter-spacing",
                "text-color",
                "bold",
                "italic",
                // "underline",
                // "text-indent",
                // "text-align",
                // "list-ul",
                // "list-ol",
                "media",
                "blockquote",
                "code",
                // "separator",
                "link",
                {
                    key: "fullscreen",
                    text: <b>全屏</b>,
                },
            ],
        },
    },
}

const service = createApi("question", schema, null, "eq.")
service.get = async function (args) {
    const res = await createApi("question", schema, null, null).get(args)
    let list = res.list.map((item) => {
        return {
            ...item,
            question_extend: item.question_extend
                ? item.question_extend.join("\n")
                : null,
            ...item.info,
        }
    })
    return { ...res, list: list }
}
service.getMinioConfig = async function (args) {
    const res = await createApi("minio", schema, null, "").get(args)
    return res
}
service.post = async function (args, schema) {
    let question_extend = null
    Object.keys(schema).forEach(function (key) {
        if (schema[key].isExpand) {
            if (args[key]) {
                if (args["info"]) {
                    args["info"][key] = args[key]
                } else {
                    args["info"] = {}
                    args["info"][key] = args[key]
                }
            }
            args[key] = undefined
        }
    })

    if (args.question_extend) {
        question_extend = args.question_extend.split("\n")
    }
    const res = await createApi("question", schema, null, "eq.").post({
        ...args,
        question_extend: question_extend,
    })

    return res
}
service.patch = async function (args, schema) {
    let question_extend = null
    Object.keys(schema).forEach(function (key) {
        if (schema[key].isExpand) {
            if (args[key]) {
                if (args["info"]) {
                    args["info"][key] = args[key]
                } else {
                    args["info"] = {}
                    args["info"][key] = args[key]
                }
            }
            args[key] = undefined
        }
    })
    if (args.question_extend) {
        question_extend = args.question_extend.split("\n")
    }
    const res = await createApi("question", schema, null, "eq.").patch({
        ...args,
        question_extend: question_extend,
    })

    return res
}
// service.search = createApi("rpc/question_search", schema).getBasic
service.search = createApi("search", schema).getBasic

export default {
    schema,
    service,
}
