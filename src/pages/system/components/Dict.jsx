import schema from "@/schemas/dict/schema"
import service from "@/schemas/dict/service"
import frSchema from "@/outter/fr-schema/src"
import DataList from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"
import { connect } from "dva"

const { utils } = frSchema

class List extends DataList {
    constructor(props) {
        super(props, {
            operateWidth: 250,
            schema,
            service,
            // readOnly: true,
            addHide: true,
        })
    }

    renderSearchBar() {
        const { name } = this.schema
        const filters = this.createFilters({ name }, 5)
        return this.createSearchBar(filters)
    }

    async componentDidMount() {
        const dict_type = await this.service.getDictType()
        this.schema.key.dict = utils.dict.listToDict(
            dict_type.list,
            null,
            "key",
            "name"
        )
        super.componentDidMount()
    }
}

export default connect(({ global }) => ({
    dict: global.dict,
}))(List)
