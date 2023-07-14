import { Spin } from 'antd';

export default function Loading() {
  return (
    <div className='grid place-content-center'>
      <Spin size="large" />
    </div>
  );
}