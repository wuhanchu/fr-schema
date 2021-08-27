import ListPage from "@/outter/fr-schema-antd-utils/src/components/Page/ListPage"
import schema from "@/schemas/config/schema"
import service from "@/schemas/config/service"

class List extends ListPage {
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
