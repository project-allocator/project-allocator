import { useMessage } from "@/contexts/MessageContext";
import { useUpdateUser, useUser } from "@/hooks/users";
import { Button, Divider, Form, Input, Select, Typography } from "antd";
import { useNavigate, useParams } from "react-router-dom";

const { Title } = Typography;

export default function EditUser() {
  const navigate = useNavigate();
  const { messageError, messageSuccess } = useMessage();

  const { id: userId } = useParams();
  const user = useUser(userId!);
  const updateUser = useUpdateUser(userId!);

  return (
    <>
      <Title level={3}>Edit User Profile</Title>
      <Divider />
      <Form
        method="post"
        layout="vertical"
        autoComplete="off"
        className="ml-6 max-w-xl"
        onFinish={(values) =>
          updateUser.mutate(values, {
            onSuccess: () => {
              messageSuccess("Successfully updated user");
              navigate(-1);
            },
            onError: () => messageError("Failed to update user"),
          })
        }
      >
        <Form.Item label="Name" name="name" initialValue={user.data.name}>
          <Input disabled />
        </Form.Item>
        <Form.Item label="Email" name="email" initialValue={user.data.email}>
          <Input disabled />
        </Form.Item>
        <Form.Item label="Role" name="role" initialValue={user.data.role}>
          <Select
            className="w-48"
            options={[
              { value: "admin", label: "Admin" },
              { value: "staff", label: "Staff" },
              { value: "student", label: "Student" },
            ]}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}
