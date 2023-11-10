import { UserRead, UserService } from "@/api";
import { useMessage } from "@/contexts/MessageContext";
import AdminRoute from "@/routes/AdminRoute";
import { toCapitalCase } from "@/utils";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Divider, Space, Tooltip, Typography } from "antd";
import {
  Link,
  LoaderFunctionArgs,
  useLoaderData,
  useNavigate,
} from "react-router-dom";

const { Title, Paragraph } = Typography;

export async function userLoader({ params }: LoaderFunctionArgs) {
  return await UserService.readUser(parseInt(params.id!));
}

export async function currentUserLoader() {
  return await UserService.readCurrentUser();
}

export default function User() {
  const user = useLoaderData() as UserRead;
  const navigate = useNavigate();
  const { messageSuccess, messageError } = useMessage();

  return (
    <>
      <Space className="flex items-end justify-between">
        <Title level={3} className="mb-0">
          User #{user.id}
        </Title>
        <AdminRoute>
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
                  UserService.deleteUser(user.id)
                    .then(() =>
                      messageSuccess(`Successfully deleted user #${user.id}.`),
                    )
                    .catch(messageError);
                  navigate("/admin");
                }}
              />
            </Tooltip>
          </Space>
        </AdminRoute>
      </Space>
      <Divider />
      <Title level={4}>Name</Title>
      <Paragraph className="text-slate-500">
        Full name of the user, which is based on the user's profile on
        Microsoft.
      </Paragraph>
      <Paragraph>{user.name}</Paragraph>
      <Title level={4}>Email Address</Title>
      <Paragraph className="text-slate-500">
        Email address of the user, which is based on the user's profile on
        Microsoft.
      </Paragraph>
      <Paragraph>{user.email}</Paragraph>
      <Title level={4}>Role</Title>
      <Paragraph className="text-slate-500">
        Role of the user. This will be one of student, staff or admin.
      </Paragraph>
      <Paragraph>{toCapitalCase(user.role)}</Paragraph>
    </>
  );
}
