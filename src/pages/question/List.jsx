import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { connect } from "dva"
import ListPage from "@/outter/fr-schema-antd-utils/src/components/Page/ListPage"
import schemas from "@/schemas"

@connect(({ global }) => ({
    dict: global.dict
}))
@Form.create()
class List extends ListPage {
    constructor(props) {
        super(props, {
            schema: schemas.question.schema,
            service: schemas.question.service
        })
    }
}

export default List
