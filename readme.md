# fr-schema

前端的一个统一 schema 工具，设计 schema 来生成不同客户端以及不同框架的界面。
作为后端界面和小程序的 API 开发项目，主要提供 schema 类和后台进行对接。

## schema 的编写规范

####actions

```json
export default {
  add: 'add',
  update: 'update',
  show: 'show',
  search: 'search',
};
```

## DataList 的使用

-   meta
    -   scroll: table whether can scroll
    -   showSelect: whether show multi select
    -   selectedRows
    -   resource: schema resource name，
    -   service: 配置在 modules 中的 service
    -   title: page title,
    -   infoProps: infoForm props
    -   handleChangeCallback: data change call back
    -   queryArgs: fixed query args
    -   infoProps 会传给 InfoModal 的属性

### 列表操作

-   handleModalVisible: 信息框显示

## schema 的属性

schema 代表是一个数据对象的定义，一般来说会和数据库的设计有 8 成相似。

### field 的定义

-   type 控件类型 （默认为 Input,具体的范围参考 schemaFieldType）
    -   Select: "下拉框",
    -   MultiSelect: "多选下拉框",
    -   DatePicker: "日期选择",
    -   RangePicker: "日期范围选择",
    -   TextArea: "多行输入",
    -   Password: "密码",
    -   TreeSelect: "树选择",
    -   Slider: "范围选择",
    -   Input: "普通输入框"
-   required 是否必填
-   extra 字段说明
-   submitFormat 提交格式（当字段是日期格式时可用）
-   groupName 分组名称，如果字段太多，可进行分组，界面上会进行分区显示。
-   listHide 列表隐藏
-   infoHide 信息框隐藏
-   addHide 新增隐藏
-   editHide 编辑隐藏
-   showHide 弹出信息框 action 为 show 的时候隐藏。
-   readOnly 只读，在信息页面会显示但是不可修改。新增的时候可编辑（一般关联显示的信息需要配置）
-   dict 配置的字典(json 对象)
-   dictFunc 配置的字典方法（在 web 起来的时候可）
-   span 在 row 中占的位置（所有空间为 24）
-   props 传入到输入框的属性
-   itemProps 传入到 FormItem 的属性(如果有配置 表单)
-   decoratorProps form.getFieldDecorator 传入的参数数据（主要是校验规则等）
-   render 列表的渲染方法（可选）
-   renderInput(item, data, action): 输入框的渲染方法（可选）
    -   item： schema file 对象
    -   data：数据
    -   action: 当前操作 action

    ```javascript
    this.schema.detp.rednerInput = (item,data,action)=>{
    return <UserTree value={data.dept} >
    }
    ```

-   onChange: 数据修改时调用。
-   infoShowFunc： 显示控制，传入 state.data 信息来控制.

    ```javascript
    infoShowFunc: function(data) {
      return data && data.type === meeting.type.dict.offline.value
    }
    ```

### 类型属性

#### 日期类型

-   remoteFormat: 传到后台的数据格式（moment 的格式）

### 字典的编写

-   default: 选项中可加 true or false 配置,确定是否是默认数据

```json
dict: {
    wait: {
        value: 0,
        remark: "会议未开始"
    },
    running: {
        value: 1,
        remark: "会议进行中"
    },
    end: {
        value: 2,
        remark: "会议结束"
    },
    archived: {
        value: 3,
        remark: "归档"
    },
    abnormal: {
        value: -1,
        remark: "异常"
    }
}
```
