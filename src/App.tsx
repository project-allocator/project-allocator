import MessageContext from '@/contexts/message';
import { message } from 'antd';

const { useMessage } = message;


interface Props {
  children: React.ReactNode;
};

export default function App({ children }: Props) {
  // Setup Ant Design message API
  const [message, contextHolder] = useMessage();

  // TODO: Instead of useNavigation() and errorElement,
  // we can catch all errors and useNavigation() to show loading/submitting
  // https://reactrouter.com/en/main/guides/deferred#using-defer
  return (
    <MessageContext.Provider value={message}>
      {contextHolder}
      {children}
    </MessageContext.Provider>
  );
}
