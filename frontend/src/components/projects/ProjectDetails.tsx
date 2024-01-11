import { ProjectDetailTemplateRead, ProjectReadWithDetails } from "@/api";
import { useProjectDetailTemplates } from "@/hooks/projects";
import { Space, Tag, Typography } from "antd";
import dayjs from "dayjs";
import * as _ from "underscore";

const { Title, Paragraph } = Typography;

export default function ProjectDetails({ project }: { project: ProjectReadWithDetails }) {
  const templates = useProjectDetailTemplates();
  const sortedTemplates = _.sortBy(templates.data, (template) => template.key);

  function showDetailValue(template: ProjectDetailTemplateRead) {
    const detail = project.details.find((detail) => detail.template.key === template.key);
    if (detail === undefined) return "Not specified";
    switch (template.type) {
      case "date":
        return dayjs(detail.value as string).format("DD/MM/YYYY");
      case "time":
        return dayjs(detail.value as string).format("hh:mm:ss");
      case "switch":
        return detail.value ? "Yes" : "No";
      case "checkbox":
        return detail.value.length > 0 ? Array(detail.value).join(", ") : "Not specified";
      case "categories":
        return (
          <Space className="flex-wrap min-w-xl mt-2">
            {detail.value.length > 0
              ? detail.value.map((category: string) => <Tag key={category}>{category}</Tag>)
              : "No categories"}
          </Space>
        );
      default:
        return detail.value;
    }
  }

  return sortedTemplates.map((template) => {
    return (
      <div key={template.key}>
        <Title level={4}>{template.title}</Title>
        <Paragraph className="text-slate-500">{template.description}</Paragraph>
        <Paragraph>{showDetailValue(template)}</Paragraph>
      </div>
    );
  });
}
