import { UserRead, UserReadWithAllocation } from "@/api";
import { usePrefetchUser } from "@/hooks/users";
import { toInitialLetters } from "@/utils";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Avatar, Button, List, Select, Tooltip, Typography } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";

const { Text } = Typography;

export default function EditableUserList({
  selectedUsers,
  selectableUsers,
  children,
  onAdd,
  onDelete,
}: {
  selectedUsers: UserReadWithAllocation[];
  selectableUsers: UserRead[];
  children?: (user: UserReadWithAllocation) => React.ReactNode;
  onAdd?: (users: UserRead[]) => void;
  onDelete?: (user: UserRead) => void;
}) {
  // Prefetch user data when hovering over a user item
  const prefetchUser = usePrefetchUser();

  return (
    <>
      <ExtraUserSelect selectableUsers={selectableUsers} onAdd={onAdd} />
      <List
        className="mt-4"
        itemLayout="horizontal"
        dataSource={selectedUsers}
        renderItem={(user) => (
          <List.Item
            actions={[
              <Tooltip title="Delete">
                <Button className="border-none" icon={<DeleteOutlined />} onClick={() => onDelete && onDelete(user)} />
              </Tooltip>,
            ]}
            onMouseOver={() => prefetchUser(user.id)}
          >
            <List.Item.Meta
              avatar={<Avatar>{toInitialLetters(user.name)}</Avatar>}
              title={<Link to={`/users/${user.id}`}>{user.name}</Link>}
              description={user.email}
            />
            <Text>{children && children(user)}</Text>
          </List.Item>
        )}
      />
    </>
  );
}

function ExtraUserSelect({
  selectableUsers,
  onAdd,
}: {
  selectableUsers?: UserRead[];
  onAdd?: (users: UserRead[]) => void;
}) {
  const [extraUserIndices, setExtraUserIndices] = useState<number[]>([]);

  return (
    <div className="flex gap-x-2 mt-6 mr-2">
      <Select
        mode="multiple"
        allowClear
        className="w-full grow"
        placeholder="Select users to add"
        value={extraUserIndices}
        options={selectableUsers?.map((user, index) => ({
          label: `${user.name} (${user.email})`,
          value: index,
        }))}
        filterOption={(inputValue, option) => {
          if (!selectableUsers || !option) return false;
          const target = inputValue.toLowerCase();
          const user = selectableUsers[option!.value];
          return [user.email, user.name].some((item) => item.toLowerCase().includes(target));
        }}
        onChange={(indices) => setExtraUserIndices(indices)}
      />
      <Button
        shape="circle"
        className="flex-none"
        icon={<PlusOutlined />}
        onClick={() => {
          onAdd && onAdd(extraUserIndices.map((index) => selectableUsers![index]));
          setExtraUserIndices([]);
        }}
      />
    </div>
  );
}
