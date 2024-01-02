import { ProjectDetailRead, ProjectDetailTemplateRead, ProjectReadWithDetails } from "@/api";
import { useProjectDetailTemplates } from "@/hooks/projects";
import { PlusOutlined } from "@ant-design/icons";
import type { InputRef } from "antd";
import {
  Button,
  Checkbox,
  DatePicker,
  Empty,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Skeleton,
  Slider,
  Space,
  Switch,
  Tag,
  TimePicker,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import * as _ from "underscore";

const { TextArea } = Input;
const { useForm, useFormInstance } = Form;

export default function ProjectForm({
  initProject,
  onFinish,
}: {
  initProject?: ProjectReadWithDetails;
  onFinish: (values: any) => void;
}) {
  const [form] = useForm();

  return (
    <>
      <Form
        form={form}
        method="post"
        layout="vertical"
        autoComplete="off"
        onFinish={(values) => {
          // Remove the detail- prefix from the form field names
          // and convert them to an array of details.
          values.details = [];
          for (const [key, value] of Object.entries(values)) {
            if (key.startsWith("detail-")) {
              values.details.push({ key: key.replace("detail-", ""), value });
              delete values[key];
            }
          }
          onFinish(values);
        }}
        className="ml-6 max-w-xl"
      >
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: "Please enter your project title!" }]}
          initialValue={initProject?.title}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
          rules={[
            {
              required: true,
              message: "Please enter your project description!",
            },
          ]}
          initialValue={initProject?.description}
        >
          <TextArea rows={5} maxLength={10000} showCount />
        </Form.Item>
        <ProjectDetailsForm initProject={initProject} />
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}

function ProjectDetailsForm({ initProject }: { initProject?: ProjectReadWithDetails }) {
  const templates = useProjectDetailTemplates();

  if (templates.isLoading) return <Skeleton active />;
  if (templates.isError) return <Empty description="Failed to load project detail templates" />;

  const sortedTemplates = _.sortBy(templates.data!, "key");
  const sortedDetails = _.sortBy(initProject?.details || [], "key");
  const detailsWithTemplates = _.zip(sortedDetails, sortedTemplates); // zip does not truncate to the shorter array

  return detailsWithTemplates.map(([detail, template]) => (
    <Form.Item
      key={template.key}
      name={`detail-${template.key}`}
      label={template.title}
      tooltip={template.description}
      rules={[{ required: template.required, message: template.message }]}
      initialValue={(() => {
        // No initial value if creating new project
        if (initProject === undefined) return undefined;
        switch (template.type) {
          case "date":
          case "time":
            return dayjs(detail.value as string);
          default:
            return detail.value;
        }
      })()}
      valuePropName={(() => {
        switch (template.type) {
          case "switch":
            return "checked";
          default:
            return undefined;
        }
      })()}
    >
      {(() => {
        const options = template.options?.map((option) => ({
          value: option,
          label: option,
        }));
        switch (template.type) {
          case "textfield":
            return <Input />;
          case "textarea":
            return <TextArea rows={5} maxLength={10000} showCount />;
          case "number":
            return <InputNumber className="w-48" />;
          case "slider":
            return <Slider />;
          case "date":
            return <DatePicker className="w-48" />;
          case "time":
            return <TimePicker className="w-48" />;
          case "switch":
            return <Switch />;
          case "select":
            return <Select className="w-48" options={options} />;
          case "checkbox":
            return <Checkbox.Group options={options} />;
          case "radio":
            return <Radio.Group options={options} />;
          case "categories":
            return <CategoriesField detail={detail} template={template} />;
        }
      })()}
    </Form.Item>
  ));
}

function CategoriesField({ detail, template }: { detail?: ProjectDetailRead; template: ProjectDetailTemplateRead }) {
  // Propagate change up to the parent form component
  const form = useFormInstance();
  function setCategoriesWithForm(categories: string[]) {
    form.setFieldValue(`detail-${template.key}`, categories);
    setCategories(categories);
  }

  const [categories, setCategories] = useState<string[]>(detail?.value || []);
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
    setCategoriesWithForm(categories.filter((tag) => tag !== removedTag));
  }

  function showAddInput() {
    setAddInputVisible(true);
  }

  function handleAddInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setAddInputValue(event.target.value);
  }

  function handleAddInputConfirm() {
    if (addInputValue && categories.indexOf(addInputValue) === -1) {
      setCategoriesWithForm([...categories, addInputValue]);
    }
    setAddInputVisible(false);
    setAddInputValue("");
  }

  function handleEditInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setEditInputValue(event.target.value);
  }

  function handleEditInputConfirm() {
    const newCategories = [...categories];
    newCategories[editInputIndex] = editInputValue;
    setCategoriesWithForm(newCategories);
    setEditInputIndex(-1);
    setAddInputValue("");
  }

  return (
    <Space size="small" wrap>
      {/* Edit the existing categories */}
      <Space size="small" wrap>
        {categories.map((category, index) => (
          <div key={category} className="w-32">
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
                onDoubleClick={(event) => {
                  setEditInputIndex(index);
                  setEditInputValue(category);
                  event.preventDefault();
                }}
                onClose={() => handleClose(category)}
                className="w-full flex justify-between items-center"
              >
                {category}
              </Tag>
            )}
          </div>
        ))}
      </Space>
      {/* Add a new category */}
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
            <PlusOutlined /> New Category
          </Tag>
        )}
      </div>
    </Space>
  );
}
