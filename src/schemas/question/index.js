import { createApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { verifyJson } from "@/outter/fr-schema-antd-utils/src/utils/component"
import { message } from "antd"

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
    info: {
        title: "属性说明",
        listHide: true,
        // // required: true,
        type: schemaFieldType.AceEditor,
        decoratorProps: { rules: verifyJson },
    },

    answer: {
        title: "答案",
        required: true,
        listHide: true,
        type: schemaFieldType.BraftEditor,
        // span: 24,
        lineWidth: "300px",
        props: {
            style: {
                height: "200px",
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
                    image:
                        "image/png,image/jpeg,image/gif,image/webp,image/apng,image/svg",
                    video: false,
                    audio: false,
                },
            },
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
service.getMinioConfig = async function (args) {
    const res = await createApi("minio", schema, null, "").get(args)
    return res
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
