import { NotificationRead } from "@/api";
import { useDeleteNotification, useMarkReadNotifications, useNotifications } from "@/hooks/notifications";
import { DeleteOutlined } from "@ant-design/icons";
import * as antd from "antd";
import { Button, Card, Empty, Space, Tooltip, Typography } from "antd";

const { Text } = Typography;

export default function Drawer({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (open: boolean) => void }) {
  const notifications = useNotifications();
  const markReadNotifications = useMarkReadNotifications();

  return (
    <antd.Drawer
      title="Notifications"
      placement="right"
      width={300}
      open={isOpen}
      onClose={() => {
        setIsOpen(false);
        markReadNotifications.mutate(notifications.data?.map((notification) => notification.id) || []);
      }}
    >
      <Space direction="vertical" className="w-full">
        <NotificationList notifications={notifications.data || []} />
      </Space>
    </antd.Drawer>
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
