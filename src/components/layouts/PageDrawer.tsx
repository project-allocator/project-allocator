import { useDeleteNotification, useMarkNotifications, useNotifications } from "@/hooks/notifications";
import Loading from "@/pages/Loading";
import { DeleteOutlined } from "@ant-design/icons";
import { Button, Card, Drawer, Space, Tooltip, Typography } from "antd";

const { Text } = Typography;

export default function PageDrawer({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const notifications = useNotifications();
  const markNotifications = useMarkNotifications();
  const deleteNotification = useDeleteNotification();

  const notificationIds = notifications.data?.map((notification) => notification.id) || [];
  return (
    <Drawer
      title="Notifications"
      placement="right"
      open={open}
      onClose={() => {
        setOpen(false);
        markNotifications.mutate(notificationIds);
      }}
    >
      <Space direction="vertical" className="w-full">
        {notifications.data?.map((notification) => (
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
          // TODO
        )) || <Loading />}
      </Space>
    </Drawer>
  );
}
