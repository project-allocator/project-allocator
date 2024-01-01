import { useMessage } from "@/contexts/MessageContext";
import { useSendNotifications } from "@/hooks/notifications";
import { SendOutlined } from "@ant-design/icons";
import { Button, Checkbox, Divider, Form, Input, Typography } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useState } from "react";

const { Title, Paragraph } = Typography;

export default function ManageNotifications() {
  return (
    <>
      <Title level={3}>Manage Notifications</Title>
      <Divider />
      <ProjectApprovalNotifications />
      <Divider />
      <ProjectAllocationNotifications />
      <Divider />
      <CustomNotifications />
    </>
  );
}

function ProjectApprovalNotifications() {
  const { messageSuccess, messageError } = useMessage();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const sendNotifications = useSendNotifications();

  return (
    <>
      <Title level={4}>Project Approval Notifications</Title>
      <Paragraph className="text-slate-500">
        Click this to notify staff about the approval of their project proposals via email and in-app notification. The
        emails will be sent from your Microsoft account.
      </Paragraph>
      <Button
        icon={<SendOutlined />}
        loading={isLoading}
        onClick={() => {
          setIsLoading(true);
          const notification = {
            notification_data: {
              title: "Project proposals have been approved.",
              description: "Students will be able to view and shortlist your project proposals from now onwards.",
            },
            roles: ["staff", "admin"],
          };
          sendNotifications.mutate(notification, {
            onSuccess: () => messageSuccess("Successfully sent notifications."),
            onError: () => messageError("Failed to send notifications."),
            onSettled: () => setIsLoading(false),
          });
        }}
      >
        Send
      </Button>
    </>
  );
}

function ProjectAllocationNotifications() {
  const { messageSuccess, messageError } = useMessage();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const sendNotifications = useSendNotifications();

  return (
    <>
      <Title level={4}>Project Allocation Notifications</Title>
      <Paragraph className="text-slate-500">
        Click this to notify students about the project allocation via email and in-app notification. The emails will be
        sent from your Microsoft account.
      </Paragraph>
      <Button
        icon={<SendOutlined />}
        loading={isLoading}
        onClick={() => {
          setIsLoading(true);
          const notification = {
            notification_data: {
              title: "Projects have been allocated.",
              description: "Please accept or decline your project allocation on the Project Allocator.",
            },
            roles: ["student"],
          };
          sendNotifications.mutate(notification, {
            onSuccess: () => messageSuccess("Successfully sent notifications."),
            onError: () => messageError("Failed to send notifications."),
            onSettled: () => setIsLoading(false),
          });
        }}
      >
        Send
      </Button>
    </>
  );
}

function CustomNotifications() {
  const { messageSuccess, messageError } = useMessage();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const sendNotifications = useSendNotifications();

  return (
    <>
      <Title level={4}>Custom Notifications</Title>
      <Paragraph className="text-slate-500">
        Click this to notify your choice of users with a custom message via email and in-app notification. The emails
        will be sent from your Microsoft account.
      </Paragraph>
      <Form
        method="post"
        layout="vertical"
        autoComplete="off"
        className="max-w-xl"
        onFinish={(values) => {
          setIsLoading(true);
          sendNotifications.mutate(
            {
              notification_data: {
                title: values.title,
                description: values.description,
              },
              roles: values.roles,
            },
            {
              onSuccess: () => messageSuccess("Successfully sent notifications."),
              onError: () => messageError("Failed to send notifications."),
              onSettled: () => setIsLoading(false),
            }
          );
        }}
      >
        <Form.Item label="Title" name="title">
          <Input />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <TextArea rows={5} maxLength={10000} showCount />
        </Form.Item>
        <Form.Item label="Roles" name="roles" tooltip="The roles of users you want to send notifications to.">
          <Checkbox.Group
            options={[
              { value: "admin", label: "Admin" },
              { value: "staff", label: "Staff" },
              { value: "student", label: "Student" },
            ]}
          />
        </Form.Item>
        <Form.Item>
          <Button icon={<SendOutlined />} type="primary" htmlType="submit" loading={isLoading}>
            Send
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}
