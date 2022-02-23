import { connect } from "dva"
import DataList from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"
import schemas from "@/schemas"
import React from "react"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import frSchema from "@/outter/fr-schema/src"
import { Select } from "antd"
import MySelect from "./MySelect"

const { utils } = frSchema
@connect(({ global }) => ({
    dict: global.dict,
}))
@Form.create()
class List extends DataList {
    constructor(props) {
        super(props, {
            schema: schemas.relation.schema,
            service: schemas.relation.service,
            // readOnly: true,
            operateWidth: "120px",
            search: {
                span: 6,
            },
            infoProps: {
                // width: "900px",
                offline: true,
            },
        })
    }
    async componentDidMount() {
        let _this = this
        var oldresize = window.onresize

        let res = await schemas.entity.service.get({
            pageSize: 100,
        })
        this.entityDict = res.list
        let fundList_ = res.list.slice(0, 100)
        this.setState({ fundList_ })

        // let typeList = utils.dict.listToDict(res.list, null, "id", "name")
        res = await schemas.relationType.service.get({ pageSize: 10000 })
        let entityType = await schemas.entityType.service.get({
            pageSize: 10000,
        })

        let entityTypeDict = utils.dict.listToDict(
            entityType.list,
            null,
            "key",
            "name"
        )
        console.log("entityTypeDict", entityTypeDict)
        this.schema.to_entity_id.renderInput = (data, props, item) => {
            return (
                <MySelect
                    data={data.props.data}
                    entityTypeDict={entityTypeDict}
                    type_name={props && props.to_entity_type_name}
                    showSearch
                    form={item}
                    defaultLabel={props && props.to_entity_name}
                    defaultValue={props && props.to_entity_id}
                    keyIndex="to_entity_id"
                    style={{ width: "100%" }}
                    // onSearch={(value)=>handleOnSearch(value)}
                    placeholder="请输入右实体"
                ></MySelect>
            )
        }

        this.schema.from_entity_id.renderInput = (data, props, item) => {
            return (
                <MySelect
                    data={data.props.data}
                    showSearch
                    entityTypeDict={entityTypeDict}
                    form={item}
                    type_name={props && props.from_entity_type_name}
                    defaultLabel={props && props.from_entity_name}
                    defaultValue={props && props.from_entity_id}
                    keyIndex="from_entity_id"
                    style={{ width: "100%" }}
                    // onSearch={(value)=>handleOnSearch(value)}
                    placeholder="请输入左实体"
                ></MySelect>
            )
        }

        this.schema.from_entity_type_id.dict = utils.dict.listToDict(
            entityType.list,
            null,
            "id",
            "name"
        )
        this.schema.to_entity_type_id.dict = utils.dict.listToDict(
            entityType.list,
            null,
            "id",
            "name"
        )
        let relationTypeList = utils.dict.listToDict(
            res.list,
            null,
            "key",
            "name"
        )
        this.schema.domain_key.dict = this.props.dict.domain
        // this.schema.from_entity_id.dict = typeList
        // this.schema.to_entity_id.dict = typeList
        this.schema.to_entity_id.props = {
            data: this.entityDict,
            span: 6,
        }
        this.schema.from_entity_id.props = {
            data: this.entityDict,
            span: 6,
        }
        this.schema.relation_key.dict = relationTypeList
        super.componentDidMount()
    }

    renderSearchBar() {
        const {
            relation_key,
            domain_key,
            from_entity_id,
            to_entity_id,
            from_entity_type_id,
            to_entity_type_id,
        } = this.schema
        const filters = this.createFilters(
            {
                domain_key,
                from_entity_id,
                from_entity_type_id,
                to_entity_id,
                to_entity_type_id,
                relation_key,
            },
            5
        )
        return this.createSearchBar(filters)
    }
}

export default List
