import { NotificationRead } from "@/api";
import { useDeleteNotification, useMarkReadNotifications, useNotifications } from "@/hooks/notifications";
import Await from "@/pages/Await";
import { DeleteOutlined } from "@ant-design/icons";
import { Button, Card, Drawer, Empty, Space, Tooltip, Typography } from "antd";

const { Text } = Typography;

export default function PageDrawer({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const notifications = useNotifications();
  const markReadNotifications = useMarkReadNotifications();

  const notificationIds = notifications.data?.map((notification) => notification.id) || [];

  return (
    <Drawer
      title="Notifications"
      placement="right"
      open={open}
      onClose={() => {
        setOpen(false);
        markReadNotifications.mutate(notificationIds);
      }}
    >
      <Space direction="vertical" className="w-full">
        <Await query={notifications} errorElement="Failed to load notifications">
          {(notifications) => <NotificationList notifications={notifications} />}
        </Await>
      </Space>
    </Drawer>
  );
}

function NotificationList({ notifications }: { notifications: NotificationRead[] }) {
  const deleteNotification = useDeleteNotification();

  if (notifications.length === 0) return <Empty />;

  return notifications.map((notification) => (
    <Card key={notification.id} size="small" className={notification.read_at ? "opacity-50" : ""}>
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <Text strong>{notification.title}</Text>
          <Text>{notification.description}</Text>
        </div>
        <Tooltip title="Dismiss">
          <Button
            className="border-none"
            icon={<DeleteOutlined />}
            onClick={() => deleteNotification.mutate(notification.id)}
          />
        </Tooltip>
      </div>
    </Card>
  ));
}
