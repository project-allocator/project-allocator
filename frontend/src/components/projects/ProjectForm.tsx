import { ProjectDetailReadWithTemplate, ProjectDetailTemplateRead, ProjectReadWithDetails } from "@/api";
import { useProjectDetailTemplates } from "@/hooks/projects";
import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Slider,
  Switch,
  TimePicker,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import EditableTags from "../common/EditableTags";

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

  function handleFinish(values: any) {
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
  }

  return (
    <>
      <Form form={form} method="post" layout="vertical" autoComplete="off" className="max-w-xl" onFinish={handleFinish}>
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
          rules={[{ required: true, message: "Please enter your project description!" }]}
          initialValue={initProject?.description}
        >
          <TextArea rows={5} maxLength={10000} showCount />
        </Form.Item>
        <ProjectDetailItems initProject={initProject} />
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}

function ProjectDetailItems({ initProject }: { initProject?: ProjectReadWithDetails }) {
  const templates = useProjectDetailTemplates();

  return templates.data.map((template) => {
    return (
      <ProjectDetailItem
        key={template.key}
        detail={initProject?.details.find((detail) => detail.template.key === template.key)}
        template={template}
      />
    );
  });
}

function ProjectDetailItem({
  detail,
  template,
}: {
  detail?: ProjectDetailReadWithTemplate;
  template: ProjectDetailTemplateRead;
}) {
  function getInitialValue() {
    // No initial value if creating new project
    if (detail === undefined) return undefined;
    switch (template.type) {
      case "date":
      case "time":
        return dayjs(detail.value as string);
      default:
        return detail.value;
    }
  }

  function getValuePropName() {
    switch (template.type) {
      case "switch":
        return "checked";
      default:
        return undefined;
    }
  }

  function showFormInput() {
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
        return <Slider min={0} max={100} />;
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
  }

  return (
    <Form.Item
      key={template.key}
      name={`detail-${template.key}`}
      label={template.title}
      tooltip={template.description}
      rules={[{ required: template.required, message: template.message }]}
      initialValue={getInitialValue()}
      valuePropName={getValuePropName()}
    >
      {showFormInput()}
    </Form.Item>
  );
}

function CategoriesField({
  detail,
  template,
}: {
  detail?: ProjectDetailReadWithTemplate;
  template: ProjectDetailTemplateRead;
}) {
  const [categories, setCategories] = useState<string[]>(detail?.value || []);

  // Propagate change up to the parent form component
  const form = useFormInstance();
  function setCategoriesWithForm(categories: string[]) {
    form.setFieldValue(`detail-${template.key}`, categories);
    setCategories(categories);
  }

  return <EditableTags tags={categories} onUpdate={setCategoriesWithForm} />;
}
