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

const { url } = utils.utils

async function init(props, project_id, setState, state) {
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
                allData,
                loading: false,
            })
            console.log(allData)
        })
    console.log("成功")
}

function renderTitle(item) {
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
            </span>
            <span
                style={{
                    width: "130px",
                }}
            >
                准确度：{formatData(item.compatibility || 0, 5)}
            </span>
        </div>
    )
}
function renderDescription(item) {
    return (
        <>
            <div
                dangerouslySetInnerHTML={{
                    __html:
                        item.answer &&
                        item.answer
                            .replace(/<b>/g, "<b style='color:red;'>")
                            .replace(/\n/g, "<br/>"),
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
        console.log(state.allData)
        console.log(state.dataSource)
    }

    const handleSearch = async (searchValue, event) => {
        let value = searchValue || state.value
        if (_.isNil(value)) {
            setState({
                data: [],
                open: false,
                loading: false,
            })
            return
        }

        setState({
            ...state,
            loading: true,
            open: false,
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
                disabled={loading}
                onSelect={handleSearch}
                defaultOpen={false}
                defaultValue={null}
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
                                        title={renderTitle(item)}
                                        description={renderDescription(item)}
                                    />
                                </List.Item>
                            )}
                        />
                    ) : (
                        <Empty />
                    )}
                </Card>
            </Spin>
        </Fragment>
    )
}

export default React.memo(SearchPage)
