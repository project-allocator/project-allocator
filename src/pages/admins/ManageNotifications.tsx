import { NotificationService } from "@/api";
import { useMessage } from "@/contexts/MessageContext";
import { SendOutlined } from "@ant-design/icons";
import { Button, Checkbox, Divider, Form, Input, Typography } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useState } from "react";

const { Title, Paragraph } = Typography;

export default function ManageNotifications() {
  const [proposalNotificationsLoading, setProposalNotificationsLoading] =
    useState<boolean>(false);
  const [allocationNotificationsLoading, setAllocationNotificationsLoading] =
    useState<boolean>(false);
  const [sendNotificationsLoading, setCustomNotificationsLoading] =
    useState<boolean>(false);
  const { messageSuccess, messageError } = useMessage();

  return (
    <>
      <Title level={3}>Manage Notifications</Title>
      <Divider />
      <Title level={4}>Project Approvals</Title>
      <Paragraph className="text-slate-500">
        Click this to notify staff about the approval of their project proposals
        via email and in-app notification. The emails will be sent from your
        Microsoft account.
      </Paragraph>
      <Button
        icon={<SendOutlined />}
        loading={proposalNotificationsLoading}
        onClick={async () => {
          setProposalNotificationsLoading(true);
          await NotificationService.sendNotifications(
            "Project proposals have been approved.",
            "Students will be able to view and shortlist your project proposals from now onwards.",
            ["staff", "admin"],
          )
            .then(() => messageSuccess("Successfully sent notifications."))
            .catch(messageError);
          setProposalNotificationsLoading(false);
        }}
      >
        Send
      </Button>
      <Title level={4}>Project Allocations</Title>
      <Paragraph className="text-slate-500">
        Click this to notify students about the project allocation via email and
        in-app notification. The emails will be sent from your Microsoft
        account.
      </Paragraph>
      <Button
        icon={<SendOutlined />}
        loading={allocationNotificationsLoading}
        onClick={async () => {
          setAllocationNotificationsLoading(true);
          await NotificationService.sendNotifications(
            "Projects have been allocated.",
            "Please accept or decline your project allocation on the Project Allocator.",
            ["student"],
          )
            .then(() => messageSuccess("Successfully sent notifications."))
            .catch(messageError);
          setAllocationNotificationsLoading(false);
        }}
      >
        Send
      </Button>
      <Title level={4}>Custom Notifications</Title>
      <Paragraph className="text-slate-500">
        Click this to notify your choice of users with a custom message via
        email and in-app notification. The emails will be sent from your
        Microsoft account.
      </Paragraph>
      <Form
        method="post"
        layout="vertical"
        autoComplete="off"
        className="max-w-xl"
        onFinish={async (values) => {
          setCustomNotificationsLoading(true);
          await NotificationService.sendNotifications(
            values.title,
            values.description,
            values.roles,
          )
            .then(() => messageSuccess("Successfully sent notifications."))
            .catch(messageError);
          setCustomNotificationsLoading(false);
        }}
      >
        <Form.Item label="Title" name="title">
          <Input />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <TextArea rows={5} maxLength={10000} showCount />
        </Form.Item>
        <Form.Item
          label="Roles"
          name="roles"
          tooltip="The roles of users you want to send notifications to."
        >
          <Checkbox.Group
            options={[
              { value: "admin", label: "Admin" },
              { value: "staff", label: "Staff" },
              { value: "student", label: "Student" },
            ]}
          />
        </Form.Item>
        <Form.Item>
          <Button
            icon={<SendOutlined />}
            type="primary"
            htmlType="submit"
            loading={sendNotificationsLoading}
          >
            Send
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}
