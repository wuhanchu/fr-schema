import React, { Fragment, useEffect, useState } from "react"
import { Card, Empty, Input, List, Spin, AutoComplete } from "antd"
import schemas from "@/schemas"
import { contentHeight } from "@/styles/global"
import * as _ from "lodash"
import utils from "@/outter/fr-schema-antd-utils/src"

const { url } = utils.utils

function SearchPage(props) {
    const [state, setState] = useState({
        data: null,
        allData: [],
        loading: false,
    })

    const { data, loading } = state

    // 判断是否外嵌模式
    let project_id = url.getUrlParams("project_id")
    let height = contentHeight
    if (props.record && props.record.id) {
        project_id = props.record && props.record.id
        height = contentHeight - 200
    }

    useEffect(() => {
        schemas.question.service
            .get({ project_id: project_id, limit: 999 })
            .then((response) => {
                let allData = []
                response.list.forEach((item) => {
                    allData.push(item.question_standard)
                })
                setState({
                    ...state,
                    allData,
                })
            })
    }, [])

    const handleChange = (value) => {
        setState({
            ...state,
            value,
            dataSource:
                value &&
                state.allData &&
                state.allData.filter((item) => item.indexOf(value) >= 0),
        })
    }

    const handleSearch = async (searchValue, event) => {
        event && event.preventDefault && event.preventDefault()
        event && event.stopPropagation && event.stopPropagation()

        let value = searchValue || state.value
        if (_.isNil(value)) {
            setState({
                data: [],
                loading: false,
            })
            return
        }

        setState({
            loading: true,
        })

        const response = await schemas.question.service.search({
            search: value,
            project_id,
        })
        setState({
            ...state,
            value,
            data: response.list,
            loading: false,
        })
    }

    return (
        <Fragment>
            <AutoComplete
                dropdownMatchSelectWidth={252}
                style={{ width: "100%" }}
                onChange={handleChange}
                onSelect={handleSearch}
                defaultOpen={false}
                defaultValue={null}
                dataSource={state.dataSource}
            >
                <Input.Search
                    placeholder="输入想要搜索的问题"
                    enterButton
                    onSearch={handleSearch}
                    style={{ paddingBottom: 8 }}
                />
            </AutoComplete>
            <Spin tip="查询中" spinning={loading}>
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
                                        title={
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html: item.question_standard
                                                        .replace(
                                                            /<b>/g,
                                                            "<b style='color:red;'>"
                                                        )
                                                        .replace(
                                                            /\n/g,
                                                            "<br/>"
                                                        ),
                                                }}
                                            ></div>
                                        }
                                        description={
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html: item.answer
                                                        .replace(
                                                            /<b>/g,
                                                            "<b style='color:red;'>"
                                                        )
                                                        .replace(
                                                            /\n/g,
                                                            "<br/>"
                                                        ),
                                                }}
                                            ></div>
                                        }
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
