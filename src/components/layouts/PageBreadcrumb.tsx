import { HomeOutlined } from "@ant-design/icons";
import { Breadcrumb } from "antd";
import { Link, UIMatch, useMatches } from "react-router-dom";

export default function PageBreadcrumb() {
  const matches = useMatches() as UIMatch<any, any>[];
  const breadcrumbs = matches.filter((match) => match.handle?.crumb);

  return (
    <Breadcrumb className="my-4">
      <Breadcrumb.Item>
        <Link to="/">
          <HomeOutlined />
        </Link>
      </Breadcrumb.Item>
      {breadcrumbs.map((match) => (
        <Breadcrumb.Item key={match.pathname}>
          <Link to={match.pathname}>{match.handle?.crumb}</Link>
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
  );
}
