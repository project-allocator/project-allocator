import { ProjectReadWithDetails } from "@/api";
import { useProjectDetailTemplates } from "@/hooks/projects";
import { Empty, Skeleton, Space, Tag, Typography } from "antd";
import dayjs from "dayjs";
import * as _ from "underscore";

const { Title, Paragraph } = Typography;

export default function ProjectDetails({ project }: { project: ProjectReadWithDetails }) {
  const templates = useProjectDetailTemplates();

  if (templates.isLoading) return <Skeleton active />;
  if (templates.isError) return <Empty description="Failed to load project detail templates" />;

  const sortedTemplates = _.sortBy(templates.data!, "key");
  const sortedDetails = _.sortBy(project!.details!, "key");
  const detailsWithTemplates = _.zip(sortedDetails, sortedTemplates);

  return detailsWithTemplates.map(([detail, template]) => (
    <div key={template.key}>
      <Title level={4}>{template.title}</Title>
      <Paragraph className="text-slate-500">{template.description}</Paragraph>
      <Paragraph>
        {(() => {
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
                    : "Not specified"}
                </Space>
              );
            default:
              return detail.value;
          }
        })()}
      </Paragraph>
    </div>
  ));
}
