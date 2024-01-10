import { ProjectDetailTemplateRead } from "@/api";
import EditableTags from "@/components/common/EditableTags";
import { useMessage } from "@/contexts/MessageContext";
import {
  useCreateProjectDetailTemplate,
  useDeleteProjectDetailTemplate,
  useProjectDetailTemplates,
  useUpdateProjectDetailTemplate,
} from "@/hooks/projects";
import { toCapitalCase } from "@/utils";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Divider, Form, Input, Select, Space, Switch, Typography } from "antd";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

const { Title } = Typography;
const { TextArea } = Input;
const { useForm } = Form;

export default function ManageTemplates() {
  const { messageSuccess, messageError } = useMessage();
  const projectDetailTemplates = useProjectDetailTemplates();
  const [extraTemplateIds, setExtraTemplateIds] = useState<string[]>([]);

  const createProjectDetailTemplate = useCreateProjectDetailTemplate();
  const updateProjectDetailTemplate = useUpdateProjectDetailTemplate();
  const deleteProjectDetailTemplate = useDeleteProjectDetailTemplate();

  return (
    <>
      <Title level={3}>Manage Templates</Title>
      <Divider />
      <div className="flex flex-wrap place-items-start gap-4">
        {projectDetailTemplates.data.map((template) => (
          <TemplateItem
            key={template.key}
            template={template}
            onFinish={(values) => {
              // prettier-ignore
              updateProjectDetailTemplate.mutate({ template: values, key: template.key }, {
                onSuccess: () => messageSuccess("Successfully updated project detail template."),
                onError: () => messageError("Failed to update project detail template."),
              });
            }}
            onDelete={() =>
              deleteProjectDetailTemplate.mutate(template.key, {
                onSuccess: () => messageSuccess("Successfully deleted project detail template."),
                onError: () => messageError("Failed to delete project detail template."),
              })
            }
          />
        ))}
        {extraTemplateIds.map((templateId) => (
          <TemplateItem
            key={templateId}
            onFinish={(values) => {
              createProjectDetailTemplate.mutate(values, {
                onSuccess: () => {
                  messageSuccess("Successfully created project detail template.");
                  setExtraTemplateIds(extraTemplateIds.filter((id) => id !== templateId));
                },
                onError: () => messageError("Failed to create project detail template."),
              });
            }}
            onDelete={() => setExtraTemplateIds(extraTemplateIds.filter((id) => id !== templateId))}
          />
        ))}
      </div>
      <div className="flex justify-center my-8">
        <Button
          icon={<PlusOutlined />}
          onClick={() => {
            const extraId = uuidv4();
            setExtraTemplateIds([...extraTemplateIds, extraId]);
          }}
        >
          Add Template
        </Button>
      </div>
    </>
  );
}

function TemplateItem({
  template,
  onFinish,
  onDelete,
}: {
  template?: ProjectDetailTemplateRead;
  onFinish: (values: any) => void;
  onDelete: () => void;
}) {
  const [form] = useForm();
  const [options, setOptions] = useState(template?.options ?? []);
  const [hasOptions, setHasOptions] = useState(["select", "checkbox", "radio"].includes(template?.type ?? ""));

  return (
    <Form
      form={form}
      method="post"
      layout="vertical"
      autoComplete="off"
      initialValues={template}
      onFinish={onFinish}
      className="max-w-md basis-full p-4 bg-gray-50 rounded-md"
    >
      <Form.Item
        label="Key"
        name="key"
        rules={[
          { required: true, message: "Please enter your project detail template key!" },
          { pattern: /^[a-z0-9-]+$/, message: "Please enter a valid project detail template key!" },
        ]}
      >
        <Input disabled={!!template} />
      </Form.Item>
      <Form.Item
        label="Type"
        name="type"
        rules={[{ required: true, message: "Please enter your project detail template type!" }]}
      >
        <Select
          options={[
            "textfield",
            "textarea",
            "number",
            "slider",
            "date",
            "time",
            "switch",
            "select",
            "checkbox",
            "radio",
            "categories",
          ].map((type) => ({ value: type, label: toCapitalCase(type) }))}
          onChange={(value) => setHasOptions(["select", "checkbox", "radio"].includes(value))}
        />
      </Form.Item>
      <Form.Item
        label="Title"
        name="title"
        rules={[{ required: true, message: "Please enter your project detail template title!" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Description"
        name="description"
        rules={[{ required: true, message: "Please enter your project detail template description!" }]}
      >
        <TextArea />
      </Form.Item>
      <Form.Item
        label="Message"
        name="message"
        rules={[{ required: true, message: "Please enter your project detail template message!" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item label="Required" name="required">
        <Switch />
      </Form.Item>
      {hasOptions && (
        <Form.Item
          label="Options"
          name="options"
          rules={[{ required: true, message: "Please enter your project detail template options!" }]}
        >
          <EditableTags
            tags={options!}
            onUpdate={(values) => {
              form.setFieldValue("options", values);
              setOptions(values);
            }}
          />
        </Form.Item>
      )}
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
          <Button onClick={onDelete}>Delete</Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
