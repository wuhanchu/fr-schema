import { createApi, createBasicApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import projectService from "./../project"
import { verifyJson } from "@/outter/fr-schema-antd-utils/src/utils/component"
import { message, Tooltip } from "antd"
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
        editable: true,
    },
    question_extend: {
        title: "扩展问",
        // type: schemaFieldType.Select,
        type: schemaFieldType.TextArea,
        props: {
            autoSize: { minRows: 2, maxRows: 6 },
        },
        exportConcat: true,
        extra: "每行表示一个问题",
        editable: true,
        render: (item, record) => (
            <Tooltip title={item}>
                {item && item.length > 20
                    ? item.substring(0, 20) + "..."
                    : item}
            </Tooltip>
        ),
    },

    group: {
        title: "分组",
        type: schemaFieldType.Select,
        searchPrefix: "like",
        // required: true,
        render: (data, item) => {
            return item.group
        },
        sorter: true,
        editable: true,
    },
    label: {
        title: "标签",
        type: schemaFieldType.Select,
        props: {
            mode: "tags",
        },
        editable: true,
    },
    global_key: {
        title: "全局变量",
        extra: "作为对话机器人的匹配主键",
        editable: true,
    },
    answer: {
        title: "答案",
        required: true,
        type: schemaFieldType.BraftEditor,
        // span: 24,
        position: "right",
        itemProps: {
            labelCol: {
                span: 4,
            },
        },
        lineWidth: "480px",
        editable: true,
        render: (item, record) => {
            let res = item && item.length > 20 ? item.substring(0, 20) + "..." : item
            return (
                <Tooltip
                    title={
                        <div
                            style={{ maxHeight: "400px", overflowY: "auto" }}
                            dangerouslySetInnerHTML={{ __html: item }}
                        />
                    }
                >
                    <div dangerouslySetInnerHTML={{ __html: res }} />
                </Tooltip>
            )
        },
        props: {
            style: {
                height: "388px",
                border: "1px solid #d9d9d9",
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
                                      ":" +
                                      minioConfig.port +
                                      "/" +
                                      bucketName +
                                      "/" +
                                      fileName
                                    : "http://" +
                                      minioConfig.endpoint +
                                      ":" +
                                      minioConfig.port +
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
                        },
                        () => {
                            message.error(`文件上传失败`)
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
    external_id: {
        title: "外部编号",
        addHide: true,
        editHide: true,
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
            info: item.info ? JSON.stringify(item.info) : "",
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
        question_extend: question_extend ? question_extend : undefined,
    })

    return res
}
// service.search = createApi("rpc/question_search", schema).getBasic
service.search = createApi("search", schema).getBasic

service.uploadExcel = createBasicApi("project/import").post

export default {
    schema,
    service,
}
