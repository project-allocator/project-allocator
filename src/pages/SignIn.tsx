import { useMessage } from "@/contexts/MessageContext";
import { useSpin } from "@/contexts/SpinContext";
import { useSignInUser } from "@/hooks/users";
import { UserOutlined, WindowsOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Layout, Space, Typography } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph } = Typography;

export default function SignIn() {
  const signInUser = useSignInUser();
  const navigate = useNavigate();
  const { messageSuccess, messageError } = useMessage();
  const { setIsSpinning } = useSpin();

  return (
    <Layout className="grid place-content-center">
      <Card className="p-4">
        <Space direction="vertical" className="flex items-center">
          <Avatar size={96} icon={<UserOutlined />} />
          <Space direction="vertical" className="text-center">
            <Title level={3}>Project Allocator</Title>
            <Paragraph className="max-w-sm">Project Allocator for Imperial College London</Paragraph>
            <Button
              type="primary"
              onClick={() => {
                setIsSpinning(true);
                signInUser.mutate(undefined, {
                  onSuccess: () => {
                    messageSuccess("Successfully signed in.");
                    navigate("/");
                  },
                  onError: () => messageError("Failed to sign in."),
                  onSettled: () => setIsSpinning(false),
                });
              }}
            >
              <Space>
                Sign in with Microsoft
                <WindowsOutlined />
              </Space>
            </Button>
          </Space>
        </Space>
      </Card>
    </Layout>
  );
}
