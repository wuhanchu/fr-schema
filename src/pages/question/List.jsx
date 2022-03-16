import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import { connect } from "dva"
import ListPage from "@/components/ListPage/ListPage"
import schemas from "@/schemas"

@connect(({ global }) => ({
    dict: global.dict,
}))
@Form.create()
class List extends ListPage {
    constructor(props) {
        super(props, {
            schema: schemas.question.schema,
            service: schemas.question.service,
        })
    }
}

export default List
