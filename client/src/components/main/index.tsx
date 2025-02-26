import React from 'react';
import { UserOutlined } from '@ant-design/icons';
import { Flex } from 'antd';
import { Bubble } from '@ant-design/x';
import Markdown from '../mark-down';

const fooAvatar: React.CSSProperties = {
    color: '#f56a00',
    backgroundColor: '#fde3cf',
};

const Content: React.FC<{
    messages: Array<{
        role: 'user' | 'assistant'; // 可以根据实际需求扩展更多角色
        content: string;
        timestamp: number; // 时间戳
    }>
}> = (props) => {
    return (
        <Flex gap="middle" vertical>
            {
                props.messages.map(item => {
                    return <>
                        <Bubble
                            placement={item.role === 'user' ? "end" : "start"}
                            content={<Markdown markdown={item.content}></Markdown>}
                            avatar={{ icon: <UserOutlined />, style: fooAvatar }}
                        />
                    </>
                })
            }
        </Flex>
    )
};

export default Content;