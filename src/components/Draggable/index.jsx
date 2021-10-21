import React from "react"
import { Modal } from "antd"
export default class DraggableModal extends React.Component {
    constructor(props) {
        super()
        const top = props.style && props.style.top ? props.style.top : 0
        const left = props.style && props.style.left ? props.style.left : 0

        this.state = { top, left }
    }

    handleDrag = (e) => {
        console.log("开始")

        console.log(e)
        console.log(document.body.clientWidth - 700)
        console.log(e.pageX)
        console.log(e.clientX)
        this.setState({ top: e.clientY - 32 })
        this.setState({ left: e.pageX - (document.body.clientWidth - 350) })
    }
    // handleDragEnd = (e) => {
    //   console.log("结束")
    //   console.log(e)
    //     this.setState({ top: e.clientY - 32 });
    //     this.setState({ left: e.clientX- 542 });

    // }
    render() {
        const { title, style, ...otherProps } = this.props
        const newTitle = (
            <div
                style={{ background: "#F0F0F0" }}
                draggable={true}
                onDrag={this.handleDrag}
                onDragEnd={this.handleDrag}
            >
                {title}
            </div>
        )
        const newStyle = {
            ...style,
            top: this.state.top,
            left: this.state.left,
        }

        return <Modal {...otherProps} title={newTitle} style={newStyle} />
    }
}

// import { Modal, Button } from "antd"
// import React from "react"
// import Draggable from "react-draggable"

// export default class Index extends React.Component {
//     state = {
//         visible: false,
//         disabled: true,
//         bounds: { left: 0, top: 0, bottom: 0, right: 0 },
//     }

//     draggleRef = React.createRef()

//     showModal = () => {
//         this.setState({
//             visible: true,
//         })
//     }

//     handleOk = (e) => {
//         console.log(e)
//         this.setState({
//             visible: false,
//         })
//     }

//     handleCancel = (e) => {
//         console.log(e)
//         this.setState({
//             visible: false,
//         })
//     }

//     onStart = (event, uiData) => {
//         const { clientWidth, clientHeight } = window?.document?.documentElement
//         const targetRect = this.draggleRef?.current?.getBoundingClientRect()
//         this.setState({
//             bounds: {
//                 left: -targetRect?.left + uiData?.x,
//                 right: clientWidth - (targetRect?.right - uiData?.x),
//                 top: -targetRect?.top + uiData?.y,
//                 bottom: clientHeight - (targetRect?.bottom - uiData?.y),
//             },
//         })
//     }

//     render() {
//         const { bounds, disabled, visible } = this.state
//         console.log(this.props)
//         return (
//             <Modal
//                 modalRender={(modal) => (
//                     <Draggable
//                         disabled={disabled}
//                         bounds={bounds}
//                         style={{width: "100%", height: '100%', position: "absolute"}}
//                         onStart={(event, uiData) => this.onStart(event, uiData)}
//                     >
//                         <div ref={this.draggleRef}>{modal}</div>
//                     </Draggable>
//                 )}
//                 {...this.props}
//                 title={
//                     <div
//                         style={{
//                             width: "100%",
//                             cursor: "move",
//                         }}
//                         onMouseOver={() => {
//                             if (disabled) {
//                                 this.setState({
//                                     disabled: false,
//                                 })
//                             }
//                         }}
//                         onMouseOut={() => {
//                             this.setState({
//                                 disabled: true,
//                             })
//                         }}
//                         onFocus={() => {}}
//                         onBlur={() => {}}
//                         // end
//                     >
//                         {this.props.title}
//                     </div>
//                 }
//             ></Modal>
//         )
//     }
// }
