import { ProjectRead } from "@/api";
import config from "@/config";
import { Divider, Space, Tag, Typography } from "antd";
import dayjs from 'dayjs';

const { Title, Paragraph } = Typography;

interface ProjectContentProps {
  project: ProjectRead;
}

export function ProjectContent({ project }: ProjectContentProps) {
  return (
    <>
      <Title level={4}>{project.title}</Title>
      <Paragraph>{project.description}</Paragraph>
      <Divider />
      {config.project.details.map((detail) => (
        <div key={detail.name}>
          <Title level={4}>{detail.title}</Title>
          <Paragraph className="text-slate-500">{detail.description}</Paragraph>
          <Paragraph>
            {(() => {
              const value = project[detail.name as keyof ProjectRead];
              switch (detail.type) {
                case 'date':
                  return dayjs(value as string).format('DD/MM/YYYY');
                case 'time':
                  return dayjs(value as string).format('hh:mm:ss');
                case 'switch':
                  return value ? 'Yes' : 'No';
                case 'checkbox':
                  return Array(value).length > 0
                    ? Array(value).join(', ')
                    : "Not specified"
                default:
                  return value;
              }
            })()}
          </Paragraph>
        </div>
      ))}
      <Title level={4}>Categories</Title>
      <Paragraph className="text-slate-500">
        List of categories set by the proposer will be shown here.
      </Paragraph>
      <Space className="flex-wrap min-w-xl mt-2">
        {project.categories.length > 0
          ? project.categories.map((category: string) => (<Tag key={category}>{category}</Tag>))
          : "Not specified"}
      </Space>
    </>
  )
}