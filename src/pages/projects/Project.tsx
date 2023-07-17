import Loading from "@/components/Loading";
import MessageContext from "@/contexts/message";
import { showErrorMessage } from "@/utils";
import { DeleteOutlined, EditOutlined, HeartOutlined } from '@ant-design/icons';
import { Button, Divider, Space, Tag, Tooltip, Typography } from "antd";
import { useContext } from "react";
import { useSearchParams } from 'react-router-dom';

const { Title, Paragraph } = Typography;

export default function Project() {
  const [params] = useSearchParams();
  const id = parseInt(params.get('id')!);
  const isStudent = Math.random() < 0.5;

  const { data, loading, error } = useQuery(GetProjectDocument, { variables: { id } });
  const project = data?.project;

  const message = useContext(MessageContext)!;
  if (loading) return <Loading />;
  if (error) showErrorMessage(message, error);

  return (
    <>
      <Title level={3} className="flex justify-between items-center">
        Project #{id}
        {isStudent ? (
          <Tooltip title="Shortlist">
            <Button shape="circle" icon={<HeartOutlined />} />
          </Tooltip>
        ) : (
          <Space>
            <Tooltip title="Edit">
              <Button href="./edit" shape="circle" icon={<EditOutlined />} />
            </Tooltip>
            <Tooltip title="Delete">
              <Button shape="circle" icon={<DeleteOutlined />} />
            </Tooltip>
          </Space>
        )}
      </Title>
      <Divider />
      <Title level={4}>Title</Title>
      <Paragraph>{project?.title}</Paragraph>
      <Title level={4}>Description</Title>
      <Paragraph>{project?.description}</Paragraph>
      {/* <Title level={4}>Supervisor</Title>
      <Paragraph>Sheldon Cooper</Paragraph> */}
      <Title level={4}>Categories</Title>
      <Space className="flex-wrap min-w-xl">
        {project?.categories.map((category: string) => (
          <Tag key={category}>{category}</Tag>
        ))}
      </Space>
    </>
  );
}