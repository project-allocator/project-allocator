import { ProjectReadWithDetails } from "@/api";
import { useTemplates } from "@/contexts/TemplateContext";
import { Divider, Space, Tag, Typography } from "antd";
import dayjs from "dayjs";
import * as _ from "underscore";

const { Title, Paragraph } = Typography;

interface ProjectContentProps {
  project: ProjectReadWithDetails;
}

export function ProjectContent({ project }: ProjectContentProps) {
  const templates = useTemplates();
  const sortedTemplates = _.sortBy(templates, "key");
  const sortedDetails = _.sortBy(project!.details!, "key");
  const detailsWithTemplates = _.zip(sortedDetails, sortedTemplates);

  return (
    <>
      <Title level={4}>{project.title}</Title>
      <Paragraph>{project.description}</Paragraph>
      <Divider />
      {detailsWithTemplates.map(([detail, template]) => (
        <div key={template.key}>
          <Title level={4}>{template.title}</Title>
          <Paragraph className="text-slate-500">{template.description}</Paragraph>
          <Paragraph>
            {(() => {
              switch (detail.type) {
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
                        : "Not specified"}
                    </Space>
                  );
                default:
                  return detail.value;
              }
            })()}
          </Paragraph>
        </div>
      ))}
    </>
  );
}
