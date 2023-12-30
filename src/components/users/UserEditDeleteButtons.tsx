import { useMessage } from "@/contexts/MessageContext";
import { useDeleteUser } from "@/hooks/users";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Space, Tooltip } from "antd";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function EditDeleteButtons() {
  const navigate = useNavigate();
  const { messageSuccess, messageError } = useMessage();

  const { id: userId } = useParams();
  const deleteUser = useDeleteUser(userId!);

  return (
    <Space>
      <Tooltip title="Edit">
        <Link to="./edit">
          <Button shape="circle" icon={<EditOutlined />} />
        </Link>
      </Tooltip>
      <Tooltip title="Delete">
        <Button
          shape="circle"
          icon={<DeleteOutlined />}
          onClick={() => {
            deleteUser.mutate(undefined, {
              onSuccess: () => {
                messageSuccess(`Successfully deleted user.`);
                navigate(-1);
              },
              onError: () => messageError(`Failed to delete user.`),
            });
          }}
        />
      </Tooltip>
    </Space>
  );
}
