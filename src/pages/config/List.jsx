import schema from "@/schemas/config/schema"
import service from "@/schemas/config/service"
import {default as tempDataList} from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"
export const DataList = tempDataList


class List extends DataList {
    constructor(props) {
        super(props, {
            schema,
            service,
            queryArgs: { ...props.queryArgs, order: "id.desc" },
            addHide: true,
            showDelete: false,
            infoProps: {
                offline: true,
            },
        })
    }
}

export default List
