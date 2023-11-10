import { Button, Layout, Result } from "antd";
import { ResultStatusType } from "antd/es/result";
import { useNavigate, useRouteError } from "react-router-dom";

export default function Error() {
  const navigate = useNavigate();
  const error = useRouteError() as any;
  // TODO: Print the error for debugging purposes.
  console.error(error);

  return (
    <Layout className="grid place-content-center">
      <Result
        status={error.status as ResultStatusType}
        title={`${error.status} ${error.statusText}`}
        subTitle={error.body?.detail}
        extra={
          <Button type="primary" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        }
      />
    </Layout>
  );
}
