import { PlusOutlined } from "@ant-design/icons";
import type { InputRef } from "antd";
import { Input, Space, Tag } from "antd";
import { useEffect, useRef, useState } from "react";

export default function EditableTags({ tags, onUpdate }: { tags: string[]; onUpdate: (tags: string[]) => void }) {
  const [addInputVisible, setAddInputVisible] = useState(false);
  const [addInputValue, setAddInputValue] = useState("");
  const [editInputIndex, setEditInputIndex] = useState(-1);
  const [editInputValue, setEditInputValue] = useState("");
  const addInputRef = useRef<InputRef>(null);
  const editInputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (addInputVisible) {
      addInputRef.current?.focus();
    }
  }, [addInputVisible]);

  useEffect(() => {
    editInputRef.current?.focus();
  }, [addInputValue]);

  function handleClose(removedTag: string) {
    onUpdate(tags.filter((tag) => tag !== removedTag));
  }

  function showAddInput() {
    setAddInputVisible(true);
  }

  function handleAddInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setAddInputValue(event.target.value);
  }

  function handleAddInputConfirm() {
    if (addInputValue && tags.indexOf(addInputValue) === -1) {
      onUpdate([...tags, addInputValue]);
    }
    setAddInputVisible(false);
    setAddInputValue("");
  }

  function handleEditInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setEditInputValue(event.target.value);
  }

  function handleEditInputConfirm() {
    const newTags = [...tags];
    newTags[editInputIndex] = editInputValue;
    onUpdate(newTags);
    setEditInputIndex(-1);
    setAddInputValue("");
  }

  return (
    <Space size="small" wrap>
      {/* Edit the existing tags */}
      <Space size="small" wrap>
        {tags.map((tag, index) => (
          <div key={tag} className="w-32">
            {editInputIndex === index ? (
              <Input
                ref={editInputRef}
                size="small"
                value={editInputValue}
                onChange={handleEditInputChange}
                onBlur={handleEditInputConfirm}
                onPressEnter={handleEditInputConfirm}
                className="w-full"
              />
            ) : (
              <Tag
                closable
                onClick={(event) => {
                  setEditInputIndex(index);
                  setEditInputValue(tag);
                  event.preventDefault();
                }}
                onClose={() => handleClose(tag)}
                className="w-full flex justify-between items-center"
              >
                {tag}
              </Tag>
            )}
          </div>
        ))}
      </Space>
      {/* Add a new tag */}
      <div className="w-32">
        {addInputVisible ? (
          <Input
            ref={addInputRef}
            type="text"
            size="small"
            value={addInputValue}
            onChange={handleAddInputChange}
            onBlur={handleAddInputConfirm}
            onPressEnter={handleAddInputConfirm}
            className="w-full"
          />
        ) : (
          <Tag onClick={showAddInput} className="w-full border-dashed text-center">
            <PlusOutlined /> Add New Tag
          </Tag>
        )}
      </div>
    </Space>
  );
}
