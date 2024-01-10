import { MailOutlined } from "@ant-design/icons";
import { Input, Space, Tag } from "antd";
import { useState } from "react";

export default function EditableEmails({
  emails,
  onAdd,
  onDelete,
}: {
  emails: string[];
  onAdd: (email: string) => void;
  onDelete: (email: string) => void;
}) {
  const [inputValue, setInputValue] = useState("");

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(event.target.value);
  }

  function handleInputConfirm() {
    const regex = /\S+@\S+\.\S+/;
    if (inputValue && emails.indexOf(inputValue) === -1 && regex.test(inputValue)) {
      onAdd(inputValue);
      setInputValue("");
    }
  }

  return (
    <div className="flex flex-wrap w-full p-2 border border-solid border-gray-300 rounded-md">
      <Space size="small" wrap>
        {emails?.map((email) => (
          <Tag
            key={email}
            icon={<MailOutlined />}
            bordered={false}
            closable
            onClose={() => onDelete(email)}
            className="flex justify-between items-center h-8"
          >
            {email}
          </Tag>
        ))}
      </Space>
      <Input
        bordered={false}
        className="grow max-w-lg px-0"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputConfirm}
        onPressEnter={handleInputConfirm}
      />
    </div>
  );
}
