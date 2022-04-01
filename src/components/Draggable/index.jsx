import React from "react"
import { Button, Icon } from "antd"
import PropTypes from "prop-types"
import styles from "./styles.less"

class ModalWin extends React.Component {
    constructor(props) {
        super(props)
        const { visible } = this.props
        const { clientWidth, clientHeight } = document.documentElement
        this.state = {
            visible: visible !== "" && visible !== null ? visible : false,
            clientWidth,
            clientHeight,
            pageX: clientWidth / 3,
            pageY: 50,
            moving: false,
        }
    }

    componentWillReceiveProps({ visible }) {
        if (visible !== "" && visible !== null) {
            this.setState({ visible })
        }
    }

    componentDidMount() {
        this.resize()
        window.addEventListener("resize", this.resize)
    }

    resize = () => {
        const { clientWidth, clientHeight } = document.documentElement
        const modal = document.getElementById("modal")
        if (modal) {
            console.log("data")
            const pageY = (clientHeight - 679) / 2
            const pageX = (clientWidth - modal.offsetWidth) / 2
            this.setState({ clientWidth, clientHeight, pageX, pageY })
        }
    }

    onCancel = () => {
        const { onCancel } = this.props
        if (onCancel) {
            onCancel()
        } else {
            this.setState({ visible: false })
        }
    }

    open = () => {
        this.setState({ visible: true })
    }

    // 获取鼠标点击title时的座标、title的座标以及两者的位移
    getPosition = (e) => {
        // 标题DOM元素titleDom
        const titleDom = e.target
        // titleDom的座标
        const X = titleDom.getBoundingClientRect().left
        const Y = titleDom.getBoundingClientRect().top
        // 鼠标点击的座标
        let mouseX = 0,
            mouseY = 0
        if (e.pageX || e.pageY) {
            //ff,chrome等浏览器
            mouseX = e.pageX
            mouseY = e.pageY
        } else {
            mouseX =
                e.clientX + document.body.scrollLeft - document.body.clientLeft
            mouseY =
                e.clientY + document.body.scrollTop - document.body.clientTop
        }
        // 鼠标点击位置与modal的位移
        const diffX = mouseX - X
        const diffY = mouseY - Y
        return { X, Y, mouseX, mouseY, diffX, diffY }
    }

    /**
     * 鼠标按下，设置modal状态为可移动，并注册鼠标移动事件
     * 计算鼠标按下时，指针所在位置与modal位置以及两者的差值
     **/
    onMouseDown = (e) => {
        const position = this.getPosition(e)
        window.onmousemove = this.onMouseMove
        this.setState({
            moving: true,
            diffX: position.diffX,
            diffY: position.diffY,
        })
    }

    // 松开鼠标，设置modal状态为不可移动,
    onMouseUp = (e) => {
        this.setState({ moving: false })
    }

    // 鼠标移动重新设置modal的位置
    onMouseMove = (e) => {
        const { moving, diffX, diffY } = this.state
        if (moving) {
            // 获取鼠标位置数据
            const position = this.getPosition(e)
            // 计算modal应该随鼠标移动到的座标
            const x = position.mouseX - diffX
            const y = position.mouseY - diffY
            // 窗口大小
            const { clientWidth, clientHeight } = document.documentElement
            const modal = document.getElementById("modal")
            if (modal) {
                // 计算modal座标的最大值
                const maxHeight = clientHeight - modal.offsetHeight
                const maxWidth = clientWidth - modal.offsetWidth
                // 判断得出modal的最终位置，不得超出浏览器可见窗口
                const left = x > 0 ? (x < maxWidth ? x : maxWidth) : 0
                const top = y > 0 ? (y < maxHeight ? y : maxHeight) : 0
                this.setState({ pageX: left, pageY: top })
            }
        }
    }

    render() {
        const {
            okText,
            onOk,
            cancelText,
            children,
            width,
            height,
            title,
        } = this.props
        const { visible, clientWidth, clientHeight, pageX, pageY } = this.state
        const modal = (
            <div
                className={styles.custom_modal_mask}
                onClick={() => {
                    this.onCancel()
                }}
                style={{ width: clientWidth, height: clientHeight }}
            >
                <div
                    id="modal"
                    onClick={(e) => {
                        e.stopPropagation()
                    }}
                    className={styles.custom_modal_win}
                    style={{
                        width: width ? width : clientWidth / 3,
                        height: height ? height : "unset",
                        marginLeft: pageX,
                        marginTop: pageY,
                    }}
                >
                    <div
                        className={styles.custom_modal_header}
                        onMouseDown={this.onMouseDown}
                        onMouseUp={this.onMouseUp}
                    >
                        {title ? title : null}
                        <div
                            className={styles.custom_modal_header_close}
                            onClick={this.onCancel}
                        >
                            <Icon type="close" />
                        </div>
                    </div>
                    <div className={styles.custom_modal_content}>
                        <div style={{ marginTop: "10px" }}>{children}</div>
                    </div>
                    <div className={styles.custom_modal_footer}>
                        <div className={styles.custom_modal_footer_inner}>
                            <Button onClick={this.onCancel}>
                                {cancelText ? cancelText : "取消"}
                            </Button>
                            <Button
                                type="primary"
                                onClick={onOk}
                                style={{ marginLeft: "10px" }}
                            >
                                {okText ? okText : "确定"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )
        return <div>{!visible ? null : modal}</div>
    }
}

ModalWin.propTypes = {
    visible: PropTypes.bool,
    title: PropTypes.string,
    width: PropTypes.any,
    height: PropTypes.any,
    closable: PropTypes.bool,
    okText: PropTypes.string,
    cancelText: PropTypes.string,
    onCancel: PropTypes.func,
    onOk: PropTypes.func,
    onOkLoading: PropTypes.bool,
}

export default ModalWin
