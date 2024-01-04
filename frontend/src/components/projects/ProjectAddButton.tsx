import { useConfig } from "@/hooks/configs";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import { Link } from "react-router-dom";

export default function ProjectAddButton() {
  const proposalsShutdown = useConfig("proposals_shutdown");
  const isShutdown = proposalsShutdown.data!.value;

  return (
    <Tooltip title={isShutdown ? "Project proposals are currently shutdown" : "Add new project"}>
      <Link to="/projects/add">
        <Button shape="circle" icon={<PlusOutlined />} disabled={isShutdown} />
      </Link>
    </Tooltip>
  );
}
