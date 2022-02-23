import React from "react"
import { Select } from "antd"

function unique(arr, key) {
    if (!arr) return arr
    if (key === undefined) return [...new Set(arr)]
    const map = {
        string: (e) => e[key],
        function: (e) => key(e),
    }
    const fn = map[typeof key]
    const obj = arr.reduce((o, e) => ((o[fn(e)] = e), o), {})
    return Object.values(obj)
}
export default class MySelect extends React.Component {
    //  fundList_ = data.props.data.slice(0, 100)
    state = {
        fundList_: [],
    }
    componentDidMount() {
        console.log(this.props.defaultValue)
        let moreFundList = this.props.data.filter((item) => {
            return item.id === this.props.defaultValue
        })
        console.log(moreFundList)
        let fundList_ = [...this.props.data.slice(0, 100), ...moreFundList]
        fundList_ = unique(fundList_, "id")
        this.setState({
            fundList_: fundList_,
        })
    }
    searchValue = (value) => {
        const datas = []
        // const {fundList} = this.state
        // 对fundList进行遍历，将符合搜索条件的数据放入datas中
        this.props.data.forEach((item) => {
            if (item.name.indexOf(value) > -1) {
                datas.push(item)
            }
        })
        // 然后只显示符合搜索条件的所有数据中的前100条
        this.setState({ fundList_: datas.slice(0, 100) })
    }
    handleOnSearch = (value) => {
        // 函数节流，防止数据频繁更新，每300毫秒才搜索一次
        let that = this
        if (!this.timer) {
            this.timer = setTimeout(function () {
                that.searchValue(value)
                that.timer = null
            }, 300)
        }
    }
    render() {
        let { fundList_, defaultValue } = this.state
        let defaultValues = undefined
        if (this.props.form.form && this.props.form.form.current) {
            defaultValues = this.props.form.form.current.getFieldsValue()[
                this.props.keyIndex
            ]
        }
        return (
            <Select
                showSearch
                style={{ maxWidth: "400px", width: "100%" }}
                onSearch={(value) => this.handleOnSearch(value)}
                placeholder="请输入右实体"
                value={defaultValues}
                onChange={(item) => {
                    let keyIndex = {}
                    keyIndex[this.props.keyIndex] = item
                    this.props.form.form
                        ? this.props.form.form.current.setFieldsValue(keyIndex)
                        : this.props.form.setFieldsValue(keyIndex)
                }}
                filterOption={(input, option) =>
                    option &&
                    option.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                }
            >
                {fundList_ &&
                    fundList_.map((item, index) => {
                        return (
                            <Select.Option value={item.id} key={item.id}>
                                {item.name}
                            </Select.Option>
                        )
                    })}
            </Select>
        )
    }
}
