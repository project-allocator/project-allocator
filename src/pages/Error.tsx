import { Button, Layout, Result } from 'antd';
import { ResultStatusType } from "antd/es/result";
import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";

export default function Error() {
  const error = useRouteError() as any;
  console.error(error);

  return (
    <Layout className="grid place-content-center">
      {isRouteErrorResponse(error)
        ? (
          <Result
            status={error.status as ResultStatusType}
            title={`${error.status} ${error.statusText}`}
            subTitle={`${error.error?.message}`}
            extra={
              <Link to="/">
                <Button type="primary">Back Home</Button>
              </Link>
            }
          />
        ) : (
          <Result
            status="500"
            title="Something went wrong"
            extra={
              <Link to="/">
                <Button type="primary">Back Home</Button>
              </Link>
            }
          />
        )}
    </Layout>
  );
}
