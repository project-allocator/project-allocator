import { useConfig } from "@/hooks/configs";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import { Link } from "react-router-dom";

export default function ProjectAddButton() {
  const proposalsShutdown = useConfig("proposals_shutdown");

  if (!proposalsShutdown.data!.value) return null;

  return (
    <Tooltip title="Add">
      <Link to="/projects/add">
        <Button shape="circle" icon={<PlusOutlined />} />
      </Link>
    </Tooltip>
  );
}
