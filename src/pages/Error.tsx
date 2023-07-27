import { Button, Layout, Result } from 'antd';
import { ResultStatusType } from "antd/es/result";
import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router-dom";

export default function Error() {
  const navigate = useNavigate();
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
              <Button type="primary" onClick={() => navigate(-1)}>
                Go Back
              </Button>
            }
          />
        ) : (
          <Result
            status="500"
            title="Something went wrong"
            extra={
              <Button type="primary" onClick={() => navigate(-1)}>
                Go Back
              </Button>
            }
          />
        )}
    </Layout>
  );
}
