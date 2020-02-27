import React, { Fragment, useEffect, useState } from "react"
import { Card, Divider, Empty, Input, List, Spin } from "antd"
import schemas from "@/schemas"
import { contentHeight } from "@/styles/global"
import * as _ from "lodash"
import utils from "@/outter/fr-schema-antd-utils/src/utils"

const { url } = utils

function SearchPage(props) {
    const [state, setState] = useState({
        data: null,
        loading: false
    })

    const { data, loading } = state

    // 判断是否外嵌模式
    let project_id = url.getUrlParams("project_id")
    let height = contentHeight
    if (props.record && props.record.id) {
        project_id = props.record && props.record.id
        height = contentHeight - 200
    }

    return (
        <Fragment>
            <Input.Search
                placeholder="输入想要搜索的问题"
                onSearch={async value => {
                    if (_.isNil(value)) {
                        setState({
                            data: [],
                            loading: false
                        })
                        return
                    }

                    setState({
                        loading: true
                    })

                    const response = await schemas.question.service.search({
                        search: value.replace(/\s+/g, "|"),
                        project_id
                    })
                    setState({
                        data: response.data.list,
                        loading: false
                    })
                }}
                enterButton
                style={{ paddingBottom: 8 }}
            />
            <Spin tip="查询中" spinning={loading}>
                <Card>
                    {data && data.length > 0 ? (
                        <List
                            style={{
                                maxHeight: height,
                                overflowY: "scroll"
                            }}
                            itemLayout="horizontal"
                            dataSource={data}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html: item.question_standard_mark
                                                        .replace(
                                                            /<b>/g,
                                                            "<b style='color:red;'>"
                                                        )
                                                        .replace(/\n/g, "<br/>")
                                                }}
                                            ></div>
                                        }
                                        description={
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html: item.answer_mark
                                                        .replace(
                                                            /<b>/g,
                                                            "<b style='color:red;'>"
                                                        )
                                                        .replace(/\n/g, "<br/>")
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
