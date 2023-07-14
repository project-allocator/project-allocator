import HeaderLayout from '@/components/layouts/HeaderLayout';
import SiderLayout from '@/components/layouts/SiderLayout';
import MessageContext from '@/contexts/message';
import { message } from 'antd';
import { Outlet } from 'react-router-dom';

const { useMessage } = message;

export default function App() {
  // Setup Ant Design message API
  const [message, contextHolder] = useMessage();

  return (
    <MessageContext.Provider value={message}>
      {contextHolder}
      <HeaderLayout>
        <SiderLayout>
          <div className='text-pink-900'> hello, world!</div>
          <Outlet />
        </SiderLayout>
      </HeaderLayout>
    </MessageContext.Provider>
  );
}
