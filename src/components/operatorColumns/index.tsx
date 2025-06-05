import React from 'react';
import { Space, Button, Dropdown, Menu } from 'antd';

interface Action {
    icon?: React.ReactNode;
    type?: 'link' | 'text' | 'default' | 'primary' | 'dashed';
    danger?: boolean;
    text: React.ReactNode;
    onClick: (record: any) => void;
    disabled?: (record: any) => boolean;
    requiredPermission?: string;
}

interface OperatorColumnsProps {
    actions: Action[];
    record: any;
    maxVisible?: number;
}

/**
 * OperatorColumns 组件用于渲染操作按钮组，支持显示部分按钮，剩余按钮收纳到下拉菜单中。
 * @param actions 操作按钮配置数组
 * @param record 当前行数据
 * @param maxVisible 最大可见按钮数，超出部分收纳到下拉菜单，默认3
 */
export const OperatorColumns: React.FC<OperatorColumnsProps> = ({
    actions,
    record,
    maxVisible = 3,
}) => {
    // 过滤掉需要权限的操作（如需支持权限可自行扩展）
    const filteredActions = actions.filter(action => !action.requiredPermission);

    // 可见按钮
    const visibleActions = filteredActions.slice(0, maxVisible);
    // 收纳到下拉菜单的按钮
    const hiddenActions = filteredActions.slice(maxVisible);

    return (
        <Space size="small">
            {visibleActions.map((action, idx) => (
                <Button
                    key={idx}
                    icon={action.icon}
                    type={action.type || 'default'}
                    danger={action.danger}
                    onClick={() => action.onClick(record)}
                    disabled={action.disabled?.(record) || false}
                    size="small"
                >
                    {action.text}
                </Button>
            ))}

            {hiddenActions.length > 0 && (
                <Dropdown
                    overlay={
                        <Menu>
                            {hiddenActions.map((action, idx) => (
                                <Menu.Item
                                    key={idx}
                                    icon={action.icon}
                                    disabled={action.disabled?.(record) || false}
                                    onClick={() => action.onClick(record)}
                                >
                                    {action.text}
                                </Menu.Item>
                            ))}
                        </Menu>
                    }
                    trigger={['click']}
                >
                    <Button size="small">更多</Button>
                </Dropdown>
            )}
        </Space>
    );
};

