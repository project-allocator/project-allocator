import { ProjectReadWithDetails } from "@/api";
import { Space, Tag, Typography } from "antd";
import dayjs from "dayjs";

const { Title, Paragraph } = Typography;

export default function ProjectDetails({ project }: { project: ProjectReadWithDetails }) {
  return project.details?.map((detail) => (
    <div key={detail.template.key}>
      <Title level={4}>{detail.template.title}</Title>
      <Paragraph className="text-slate-500">{detail.template.description}</Paragraph>
      <Paragraph>
        {(() => {
          switch (detail.template.type) {
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
