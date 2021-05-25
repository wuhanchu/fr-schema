import { Tooltip, Tag } from "antd"
import { QuestionCircleOutlined } from "@ant-design/icons"
import React from "react"
import { connect } from "umi"
import Avatar from "./AvatarDropdown"
import HeaderSearch from "../HeaderSearch"
import SelectLang from "../SelectLang"
import styles from "./index.less"
const config = SETTING

const ENVTagColor = {
    dev: "orange",
    test: "green",
    pre: "#87d068",
}

const GlobalHeaderRight = (props) => {
    const { theme, layout } = props
    let className = styles.right

    if (theme === "dark" && layout === "topmenu") {
        className = `${styles.right}  ${styles.dark}`
    }

    return (
        <div>
            <div className={className}>
                {config.useDocumentation && (
                    <Tooltip title="使用文档">
                        <a
                            target="_blank"
                            href={config.useDocumentation}
                            rel="noopener noreferrer"
                            className={styles.action}
                        >
                            <QuestionCircleOutlined />
                        </a>
                    </Tooltip>
                )}
                <Avatar />
                {REACT_APP_ENV && (
                    <span>
                        <Tag color={ENVTagColor[REACT_APP_ENV]}>
                            {REACT_APP_ENV}
                        </Tag>
                    </span>
                )}
            </div>
        </div>
    )
}

export default connect(({ settings }) => ({
    theme: settings.navTheme,
    layout: settings.layout,
}))(GlobalHeaderRight)
