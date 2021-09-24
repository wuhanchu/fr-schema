import schema from "@/schemas/dictType/schema"
import service from "@/schemas/dictType/service"
import DataList from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"

class List extends DataList {
    constructor(props) {
        super(props, {
            operateWidth: 250,
            schema,
            service,
            readOnly: true,
            addHide: true,
        })
    }

    renderSearchBar() {
        const { name, report_schema_key } = this.schema
        const filters = this.createFilters({ name, report_schema_key }, 5)
        return this.createSearchBar(filters)
    }
}

export default List
