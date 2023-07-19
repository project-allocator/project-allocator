import HeaderLayout from '@/components/layouts/HeaderLayout';
import SiderLayout from '@/components/layouts/SiderLayout';
import MessageContext from '@/contexts/message';
import { message } from 'antd';
import { Outlet } from 'react-router-dom';

const { useMessage } = message;

export default function App() {
  // Setup Ant Design message API
  const [message, contextHolder] = useMessage();

  // TODO: Instead of useNavigation() and errorElement,
  // we can catch all errors and useNavigation() to show loading/submitting
  // https://reactrouter.com/en/main/guides/deferred#using-defer
  return (
    <MessageContext.Provider value={message}>
      {contextHolder}
      <HeaderLayout>
        <SiderLayout>
          <Outlet />
        </SiderLayout>
      </HeaderLayout>
    </MessageContext.Provider>
  );
}
