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
} from "antd"

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

async function init(props, project_id, setState, state) {
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

    console.log(options)
    setState({ ...state, options: options })

    if (props.type === "domain_id") {
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
    }
    if (props.type !== "history") {
        await schemas.hotWord.service
            .get({
                // project_id:
                //     props.type === "domain_id" ? project_id : "eq." + project_id,
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
                    loading: false,
                })
            })
    } else {
        setState({
            ...state,
            loading: false,
            options: options,
            data: props.data,
        })
    }
}

function renderTitle(item, setState, state, props) {
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
                匹配度：{formatData(item.compatibility || 0, 5)}
            </span>
            {
                <a
                    style={{ marginLeft: "10px", marginRight: "10px" }}
                    onClick={() => {
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
            {props.renderTitleOpeation && props.renderTitleOpeation(item)}
        </div>
    )
}
function renderDescription(item) {
    return (
        <>
            <div
                style={{
                    p: {
                        marginTop: 0,
                        marginBottom: 0,
                    },
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
        </>
    )
}

function renderInfoModal(state, meta, props, setState, handleSearch) {
    const { form } = props
    const { visibleModal, infoData, action } = state
    const updateMethods = {
        handleVisibleModal: () => {
            console.log("handleVisibleModal")
            setState({ ...state, visibleModal: false })
        },
        handleUpdate: async (data, schema, method = "patch") => {
            // 更新
            console.log(data)
            let response
            try {
                response = await schemas.question.service.patch(data, schema)
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
                    loading: true,
                    visibleModal: false,
                })
                handleSearch()
            }

            return response
        },
        handleAdd: () => {
            console.log("handleUpdate")
        },
    }

    return (
        visibleModal && (
            <InfoModal
                title={"问题修改"}
                action={"edit"}
                {...updateMethods}
                visible={visibleModal}
                values={state.listItem}
                service={schemas.question.service}
                schema={{
                    // project_id: this.schema.project_id,
                    ...schemas.question.schema,
                    group: {
                        ...schemas.question.schema.group,
                        renderInput: (item, data) => {
                            console.log(state.options)
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
                                    options={state.options}
                                >
                                    {/* {options} */}
                                    {/* <Input placeholder="请输入分组1"></Input> */}
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
        allData: [],
        loading: true,
        open: false,
    })

    const { data, loading, open, allData } = state

    // 判断是否外嵌模式
    let project_id = url.getUrlParams("project_id")
    let domain_key = url.getUrlParams("domain_key")

    let height = contentHeight
    if (props.record && props.record.id) {
        height = contentHeight - 200
        if (props.type === "domain_id") {
            domain_key = props.record && props.record.key
        } else {
            project_id = props.record && props.record.id
        }
    }
    useEffect(() => {
        init(props, project_id, setState, state, () => {
            console.log("成功")
        })
    }, [])

    const handleChange = (value) => {
        setState({
            ...state,
            open: true,
            value,
            dataSource:
                value &&
                state.allData &&
                state.allData.filter((item) => item.indexOf(value) >= 0),
        })
    }

    const handleSearch = async (searchValue, event) => {
        let value = searchValue || state.value
        if (_.isNil(value)) {
            setState({
                data: [],
                open: false,
                loading: false,
                visibleModal: false,
            })
            return
        }

        setState({
            ...state,
            loading: true,
            open: false,
            visibleModal: false,
        })
        let args = {}
        if (props.type === "domain_id") {
            args.domain_key = domain_key
        } else {
            args.project_id = project_id
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
                loading: false,
                visibleModal: false,
            })
        } catch (error) {
            message.error("搜索失败")
            setState({
                loading: false,
            })
        }
    }

    return (
        <Fragment>
            <AutoComplete
                dropdownMatchSelectWidth={252}
                style={{ width: "100%" }}
                onChange={handleChange}
                backfill
                open={open}
                disabled={props.type === "history" ? true : loading}
                onSelect={handleSearch}
                defaultOpen={false}
                defaultValue={
                    props.type === "history" ? props.record.search : null
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
            <Spin tip={"加载中"} spinning={loading}>
                <Card>
                    {data && data.length > 0 ? (
                        <List
                            style={{
                                maxHeight: height,
                                overflowY: "scroll",
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
                                            props
                                        )}
                                        description={renderDescription(item)}
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
                renderInfoModal(state, {}, props, setState, handleSearch)}
        </Fragment>
    )
}

export default React.memo(SearchPage)
