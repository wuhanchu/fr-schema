import React, { Fragment, useEffect, useState } from "react"
import {
    Card,
    Empty,
    Input,
    List,
    Spin,
    AutoComplete,
    message,
    Tag,
    Popconfirm,
    Button,
} from "antd"
import { listToDict } from "@/outter/fr-schema/src/dict"
import schemas from "@/schemas"
import { contentHeight } from "@/styles/global"
import * as _ from "lodash"
import utils from "@/outter/fr-schema-antd-utils/src"
import { downloadFile } from "@/utils/minio"
import { formatData } from "@/utils/utils"
import { EditOutlined } from "@ant-design/icons"
import InfoModal from "@/outter/fr-schema-antd-utils/src/components/Page/InfoModal"
import Question from "@/pages/question/components/BaseList"

const { url } = utils.utils
function unique(arr) {
    return Array.from(new Set(arr))
}
async function init(
    props,
    project_id,
    setState,
    state,
    callback,
    setOpeation,
    setLoading,
    setAllData,
    setProjectList
) {
    const response = await schemas.question.service.get({
        // ...this.meta.queryArgs,
        type: undefined,
        select: "label,group",
        limit: 9999,
        status: undefined,
    })

    let labelDictList = {}
    let groupDictList = {}

    response.list.forEach((item) => {
        if (!_.isNil(item.label)) {
            item.label.forEach((value) => {
                labelDictList[value] = {
                    value: value,
                    remark: value,
                }
            })
        }
        if (!_.isNil(item.group)) {
            groupDictList[item.group] = {
                value: item.group,
                remark: item.group,
            }
        }
    })
    let options = []
    Object.keys(groupDictList).forEach(function (key) {
        options.push({
            key: groupDictList[key].value,
            value: groupDictList[key].value,
        })
    })

    setState({ ...state, options: options })

    if (props.type !== "project_id") {
        let project = await schemas.project.service.get({
            domain_key: props.record && props.record.key,
            limit: 999,
        })
        project_id = "in.("
        project.list.map((item, index) => {
            if (index !== project.list.length - 1)
                project_id = project_id + item.id + ","
            else project_id = project_id + item.id
        })
        project_id = project_id + ")"
        setProjectList(project.list)
    }
    if (props.type !== "history" && !props.record.search) {
        await schemas.hotWord.service
            .get({
                domain_key: props.record && props.record.key,
                project_id: props.record && props.record.project_id,
                limit: 500,
            })
            .then((response) => {
                let allData = []
                response.list.forEach((item) => {
                    allData.push(item.question_standard)
                })
                setState({
                    ...state,
                    options: options,
                    allData,
                })
                setAllData(allData)
                setLoading(false)
            })
    } else {
        setState({
            ...state,
            options: options,
            data: props.data,
        })
        setLoading(false)
    }
    setOpeation(options)
    callback({
        ...state,
        options: options,
        data: props.data,
    })
    setLoading(false)
}

function renderTitle(
    item,
    setState,
    state,
    props,
    values,
    setLoading,
    handleSearch,
    setAction
) {
    return (
        <div style={{ width: "100%", display: "flex" }}>
            <span style={{ flex: 1 }}>
                <span
                    dangerouslySetInnerHTML={{
                        __html: item.question_standard
                            .replace(/<b>/g, "<b style='color:red;'>")
                            .replace(/\n/g, "<br/>"),
                    }}
                />
                {item.label && item.label.length !== 0 && (
                    <span style={{ marginLeft: "10px" }}>
                        {item.label.map((item) => {
                            return (
                                <Tag
                                    style={{ marginLeft: "3px" }}
                                    color="#2db7f5"
                                >
                                    {item}
                                </Tag>
                            )
                        })}
                    </span>
                )}
                {/* {<a style={{marginLeft: '10px', marginRight: '10px'}} onClick={()=>{setState({...state, visibleModal:true, listItem: item})}}><EditOutlined/></a>}
                {props.renderTitleOpeation && props.renderTitleOpeation(item)}
             */}
            </span>
            <span
                style={{
                    float: "right",
                    marginRight: "20px",
                }}
            >
                匹配度：
                {item.compatibility === 1
                    ? "1.00000"
                    : formatData(item.compatibility || 0, 5)}
            </span>
            {
                <a
                    style={{ marginLeft: "10px", marginRight: "10px" }}
                    onClick={() => {
                        setAction("edit")
                        setState({
                            ...state,
                            visibleModal: true,
                            listItem: item,
                        })
                    }}
                >
                    修改
                </a>
            }
            {
                <Popconfirm
                    title="是否补充扩展问到此问题？"
                    onConfirm={async (e) => {
                        setLoading(true)
                        let data = await schemas.question.service.getDetail(
                            item
                        )
                        let question_extend = []
                        if (data.question_extend) {
                            question_extend = data.question_extend.split("\n")
                        }
                        question_extend.push(values || props.record.search)
                        await schemas.question.service.patch(
                            {
                                id: item.id,
                                question_extend: unique(question_extend),
                            },
                            schemas.question.schema
                        )
                        message.success("补充成功")
                        setLoading(false)
                        e.stopPropagation()
                    }}
                >
                    <a style={{ marginLeft: "10px", marginRight: "10px" }}>
                        补充
                    </a>
                </Popconfirm>
            }
            {
                <Popconfirm
                    title="是否删除此问题？"
                    onConfirm={async (e) => {
                        setLoading(true)
                        console.log(item)
                        if (item.id) await schemas.question.service.delete(item)
                        message.success("删除成功")
                        handleSearch()
                        e.stopPropagation()
                    }}
                >
                    <a style={{ marginLeft: "10px", marginRight: "10px" }}>
                        删除
                    </a>
                </Popconfirm>
            }
            {props.renderTitleOpeation && props.renderTitleOpeation(item)}
        </div>
    )
}
function renderDescription(item, props) {
    return (
        <>
            <div
                style={{
                    p: {
                        marginTop: 0,
                        marginBottom: 0,
                    },
                    width: props.type === "history" ? "60%" : "65.2%",
                    verticalAlign: "top",
                    display: "inline-block",
                }}
                dangerouslySetInnerHTML={{
                    __html:
                        item.answer &&
                        item.answer
                            .replace(/<b>/g, "<b style='color:red;'>")
                            .replace(/\n/g, "<br/>")
                            .replace(/<p>/g, "<p style='margin:0;'>"),
                }}
            />
            {item.attachment && item.attachment.length !== 0 && (
                <>
                    <div>附件</div>
                    {item.attachment.map((itemStr, index) => {
                        let item = JSON.parse(itemStr)
                        return (
                            <a
                                style={{
                                    marginRight: "20px",
                                }}
                                onClick={() => {
                                    let href = downloadFile(
                                        item.bucketName,
                                        item.fileName,
                                        item.url
                                    )
                                }}
                            >
                                {item.fileName}
                            </a>
                        )
                    })}
                </>
            )}
            <div
                style={{
                    width: "25%",
                    verticalAlign: "top",
                    marginLeft: "4.2%",
                    color: "rgba(0,0,0,0.8)",
                    display: "inline-block",
                }}
            >
                匹配问题：{item.match_question_title}
            </div>
        </>
    )
}

function renderInfoModal(
    state,
    meta,
    props,
    setState,
    handleSearch,
    opeation,
    setLoading,
    action,
    projectList
) {
    const { form } = props
    const { visibleModal, infoData } = state
    const updateMethods = {
        handleVisibleModal: () => {
            console.log("handleVisibleModal")
            setState({ ...state, visibleModal: false })
        },
        handleUpdate: async (data, schema, method = "patch") => {
            // 更新
            let response
            try {
                response = await schemas.question.service.patch(
                    data,
                    schemas.question.schema
                )
                message.success("修改成功")
            } catch (error) {
                message.error(error.message)
            }
            if (props.type === "history") {
                setState({
                    ...state,
                    visibleModal: false,
                })
            } else {
                setState({
                    ...state,
                    visibleModal: false,
                })
                setLoading(true)
                handleSearch()
            }

            return response
        },
        handleAdd: async (data, schema) => {
            let response
            try {
                console.log(data)
                response = await schemas.question.service.post(
                    data,
                    schemas.question.schema
                )
                message.success("新增成功")
            } catch (error) {
                message.error(error.message)
            }
            setState({
                ...state,
                visibleModal: false,
            })
            setLoading(true)
            handleSearch()
            console.log("handleUpdate")
        },
    }

    return (
        visibleModal && (
            <InfoModal
                title={"问题修改"}
                action={action}
                {...updateMethods}
                visible={visibleModal}
                values={state.listItem}
                service={schemas.question.service}
                schema={{
                    project_id:
                        action === "add"
                            ? {
                                  title: "项目",
                                  type: "Select",
                                  sorter: true,
                                  required: true,
                                  dict: listToDict(projectList),
                              }
                            : undefined,
                    ...schemas.question.schema,
                    group: {
                        ...schemas.question.schema.group,
                        renderInput: (item, data) => {
                            return (
                                <AutoComplete
                                    style={{
                                        width: "100%",
                                        maxWidth: "300px",
                                    }}
                                    filterOption={(inputValue, option) =>
                                        option.value
                                            .toUpperCase()
                                            .indexOf(
                                                inputValue.toUpperCase()
                                            ) !== -1
                                    }
                                    options={opeation}
                                >
                                    {/* {options} */}
                                    <Input placeholder="请输入分组"></Input>
                                </AutoComplete>
                            )
                        },
                    },
                }}
                {...{
                    offline: false,
                    width: "1100px",
                    isCustomize: true,
                    customize: {
                        left: 10,
                        right: 14,
                    },
                }}
            />
        )
    )
}

function SearchPage(props) {
    const [state, setState] = useState({
        data: null,
        // allData: [],
        open: false,
    })
    const [loading, setLoading] = useState(true)
    const [allData, setAllData] = useState([])
    const [projectList, setProjectList] = useState([])

    const [action, setAction] = useState("edit")

    const [opeation, setOpeation] = useState([])
    const [values, setValues] = useState("")
    // if(props.record.search){
    //     setValues(props.record.search)
    // }

    const { data, open } = state

    // 判断是否外嵌模式
    let project_id = url.getUrlParams("project_id")
    let domain_key = url.getUrlParams("domain_key")

    let height = props.height || contentHeight
    if (props.record && props.record.id) {
        height = contentHeight - 200
        if (props.type === "domain_id") {
            domain_key = props.record && props.record.key
        } else {
            project_id = props.record && props.record.id
        }
    }

    const handleChange = (value) => {
        setState({
            ...state,
            open: true,
            value,
            dataSource:
                value &&
                allData &&
                allData.filter((item) => item.indexOf(value) >= 0),
        })
        setValues(value)
    }

    const handleSearch = async (searchValue, state) => {
        console.log(state)
        let value = searchValue || values || props.record.search
        if (_.isNil(value)) {
            setState({
                data: [],
                open: false,
                visibleModal: false,
            })
            setLoading(false)
            return
        }
        setState({
            ...state,
            open: false,
            visibleModal: false,
        })
        setLoading(true)

        let args = {}
        if (props.type !== "project_id") {
            args.domain_key = domain_key
                ? domain_key
                : props.record && props.record.domain_key
        } else {
            args.project_id = project_id || undefined
            args.domain_key = domain_key
                ? domain_key
                : props.record && props.record.domain_key
        }
        try {
            const response = await schemas.question.service.search({
                search: value,
                ...args,
            })
            setState({
                ...state,
                value,
                data: response.list,
                open: false,
                visibleModal: false,
            })
            setLoading(false)
        } catch (error) {
            message.error("搜索失败")
            setLoading(false)
        }
    }
    useEffect(() => {
        init(
            props,
            project_id,
            setState,
            state,
            (state) => {
                if (props.record.search && props.type !== "history") {
                    handleSearch(props.record.search, state)
                }
            },
            setOpeation,
            setLoading,
            setAllData,
            setProjectList
        )
    }, [])

    return (
        <Fragment>
            <div style={{ display: "flex" }}>
                <AutoComplete
                    dropdownMatchSelectWidth={252}
                    style={{ width: "100%", flex: 1 }}
                    onChange={handleChange}
                    backfill
                    open={open}
                    disabled={props.record.search ? true : loading}
                    onSelect={handleSearch}
                    defaultOpen={false}
                    defaultValue={
                        props.record.search ? props.record.search : null
                    }
                    dataSource={state.dataSource}
                >
                    <Input.Search
                        placeholder="输入想要搜索的问题"
                        enterButton
                        onBlur={() => {
                            setState({
                                ...state,
                                open: false,
                            })
                        }}
                        onSearch={handleSearch}
                        style={{ paddingBottom: 8 }}
                    />
                </AutoComplete>
                <Button
                    style={{ marginLeft: "5px" }}
                    onClick={() => {
                        let question_extend = values || props.record.search
                        setAction("add")
                        setState({
                            ...state,
                            visibleModal: true,
                            listItem: { question_extend: question_extend },
                        })
                    }}
                >
                    新增
                </Button>
                {props.renderOperationButton && props.renderOperationButton()}
            </div>

            <Spin tip={"加载中"} spinning={loading}>
                <Card>
                    {data && data.length > 0 ? (
                        <List
                            style={{
                                maxHeight: height,
                                overflowY: "scroll",
                                position: "relative",
                            }}
                            itemLayout="horizontal"
                            dataSource={data}
                            renderItem={(item) => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={renderTitle(
                                            item,
                                            setState,
                                            state,
                                            props,
                                            values,
                                            setLoading,
                                            (state) => {
                                                handleSearch()
                                            },
                                            setAction
                                        )}
                                        description={renderDescription(
                                            item,
                                            props
                                        )}
                                    />
                                    {/* <div>{renderDescription(item)}</div> */}
                                </List.Item>
                            )}
                        />
                    ) : (
                        <Empty />
                    )}
                </Card>
            </Spin>
            {state.visibleModal &&
                renderInfoModal(
                    state,
                    {},
                    props,
                    setState,
                    handleSearch,
                    opeation,
                    setLoading,
                    action,
                    projectList
                )}
        </Fragment>
    )
}

export default React.memo(SearchPage)
