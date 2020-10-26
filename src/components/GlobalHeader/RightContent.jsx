import { Tooltip, Tag } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import React from 'react';
import { connect } from 'umi';
import Avatar from './AvatarDropdown';
import HeaderSearch from '../HeaderSearch';
import SelectLang from '../SelectLang';
import styles from './index.less';

const ENVTagColor = {
    dev: 'orange',
    test: 'green',
    pre: '#87d068',
};

const GlobalHeaderRight = (props) => {
    const { theme, layout } = props;
    let className = styles.right;

    if (theme === 'dark' && layout === 'topmenu') {
        className = `${styles.right}  ${styles.dark}`;
    }

    return (
        <div className={className}>
            <Tooltip title="使用文档">
                <a
                    target="_blank"
                    href="https://www.yuque.com/ai_tech/gco871"
                    rel="noopener noreferrer"
                    className={styles.action}
                >
                    <QuestionCircleOutlined />
                </a>
            </Tooltip>
            <Avatar />
            {REACT_APP_ENV && (
                <span>
                    <Tag color={ENVTagColor[REACT_APP_ENV]}>{REACT_APP_ENV}</Tag>
                </span>
            )}
            <SelectLang className={styles.action} />
        </div>
    );
};

export default connect(({ settings }) => ({
    theme: settings.navTheme,
    layout: settings.layout,
}))(GlobalHeaderRight);
