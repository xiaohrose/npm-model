import React from 'react';
import { Avatar, List } from 'antd';

const LocalList: React.FC<{ list: Array<{ title: string, [index: string]: string }>; onClick: (item: any) => void }> = (props) => {

    return (
        <List
            itemLayout="horizontal"
            dataSource={props.list}
            renderItem={(item, index) => {
                return <List.Item>
                    <List.Item.Meta
                        avatar={<Avatar src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${index}`} />}
                        title={<a onClick={() => props?.onClick(item)}>{item.title}</a>}
                        description={<><div>model: {item.name}</div><div>date: {item.date}</div></>}
                    />
                </List.Item>
            }}
        />
    )
};

export default LocalList;