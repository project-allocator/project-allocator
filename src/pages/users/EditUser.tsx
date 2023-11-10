import { UserRead, UserService } from "@/api";
import { Button, Divider, Form, Input, Select, Typography } from "antd";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
  useLoaderData,
  useSubmit,
} from "react-router-dom";

const { Title } = Typography;

export async function editUserLoader({ params }: LoaderFunctionArgs) {
  return await UserService.readUser(parseInt(params.id!));
}

export async function editUserAction({ request, params }: ActionFunctionArgs) {
  const data = await request.json();
  await UserService.updateUser(parseInt(params.id!), data);
  return redirect(`/users/${params.id}`);
}

export function EditUser() {
  const user = useLoaderData() as UserRead;
  const submit = useSubmit();

  return (
    <>
      <Title level={3}>Edit User #{user.id}</Title>
      <Divider />
      <Form
        method="post"
        layout="vertical"
        autoComplete="off"
        className="ml-6 max-w-xl"
        onFinish={(values) =>
          submit(values, {
            method: "post",
            encType: "application/json",
          })
        }
      >
        <Form.Item label="Name" name="name" initialValue={user.name}>
          <Input disabled />
        </Form.Item>
        <Form.Item label="Email" name="email" initialValue={user.email}>
          <Input disabled />
        </Form.Item>
        <Form.Item label="Role" name="role" initialValue={user.role}>
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
