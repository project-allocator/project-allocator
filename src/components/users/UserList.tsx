import { UserRead } from "@/api";
import { usePrefetchUser } from "@/hooks/users";
import { toInitialLetters } from "@/utils";
import { Avatar, Input, List } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";

const { Search } = Input;

export default function UserList({ users }: { users: UserRead[] }) {
  const [searchText, setSearchText] = useState<string>("");

  // Prefetch user data when hovering over a user item
  const prefetchUser = usePrefetchUser();

  return (
    <>
      <Search
        className="w-64 mb-4"
        placeholder="Enter search text"
        onChange={(event) => setSearchText(event.target.value)}
        onSearch={(searchText) => setSearchText(searchText)}
      />
      <List
        itemLayout="horizontal"
        pagination={users.length > 0 && { position: "bottom" }}
        dataSource={users.filter((user) =>
          [user.name, user.email, user.role].some((text) => text.toLowerCase().includes(searchText.toLowerCase()))
        )}
        renderItem={(user) => (
          <List.Item onMouseOver={() => prefetchUser(user.id)}>
            <List.Item.Meta
              avatar={<Avatar>{toInitialLetters(user.name)}</Avatar>}
              title={<Link to={`/users/${user.id}`}>{user.name}</Link>}
              description={user.email}
            />
          </List.Item>
        )}
      />
    </>
  );
}
