import { AdminService, AllocationService, ProjectRead, ProjectService, ProposalService, ShortlistService } from "@/api";
import { useMessageContext } from "@/contexts/MessageContext";
import StaffRoute from "@/routes/StaffRoute";
import StudentRoute from "@/routes/StudentRoute";
import { DeleteOutlined, EditOutlined, HeartOutlined } from '@ant-design/icons';
import { Alert, Button, Space, Tooltip, Typography } from "antd";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';

const { Title } = Typography;

interface ProjectHeaderProps {
  title: string,
  project: ProjectRead | null;
  hasConflict?: boolean | null;
}

export default function ProjectHeader({ title, project, hasConflict }: ProjectHeaderProps) {
  // Set values in state to show the change immediagely in the UI.
  const [isProposed, setIsProposed] = useState(false);
  const [isShortlisted, setIsShortlisted] = useState<boolean>(false);
  const [isAllocated, setIsAllocated] = useState<boolean>(false);
  const [isAccepted, setIsAccepted] = useState<boolean | null>(null);
  const [areUndosShutdown, setAreUndosShutdown] = useState<boolean>(false);

  // Avoid using React Router's data loader
  // to speed up UI by showing project details first.
  useEffect(() => {
    if (!project) return;
    ProposalService.isProposed(project.id)
      .then((value) => setIsProposed(value));
    ShortlistService.isShortlisted(project.id)
      .then((value) => setIsShortlisted(value));
    AllocationService.isAllocated(project.id)
      .then((value) => setIsAllocated(value));
    AllocationService.isAccepted()
      .then((value) => setIsAccepted(value));
    AdminService.areUndosShutdown()
      .then((value) => setAreUndosShutdown(value));
  }, []);

  const navigate = useNavigate();
  const location = useLocation();
  const { messageSuccess } = useMessageContext();

  return (
    <>
      <StaffRoute>
        {hasConflict !== null && (
          hasConflict
            ? <Alert
              type="error"
              showIcon
              message="This project allocation has a conflict."
              description="There are students who declined or did not respond to this project allocation."
            />
            : <Alert
              type="success"
              showIcon
              message="This project allocation has no conflict."
              description="Every student allocated to this project has accepted this project allocation."
            />
        )}
      </StaffRoute>
      <StudentRoute>
        {isAllocated &&
          (isAccepted === null
            ? (
              <Alert
                type="info"
                showIcon
                message="You have been allocated to this project."
                description="Please accept or decline this project allocation."
                action={
                  <Space direction="vertical">
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => {
                        AllocationService.acceptAllocation();
                        setIsAccepted(true);
                      }}
                    >
                      Accept
                    </Button>
                    <Button
                      size="small"
                      onClick={() => {
                        AllocationService.declineAllocation();
                        setIsAccepted(false);
                      }}
                    >
                      Decline
                    </Button>
                  </Space>
                }
              />
            ) : (
              <Alert
                type="info"
                showIcon
                message={isAccepted
                  ? "You have accepted this project allcoation."
                  : "You have declined this project allocation."}
                description="Contact your administrators for further information."
                action={
                  areUndosShutdown &&
                  <Button
                    size="small"
                    type="primary"
                    className="my-4"
                    onClick={() => {
                      AllocationService.undoAllocation();
                      setIsAccepted(null);
                    }}
                  >
                    Undo
                  </Button>
                }
              />
            ))}
      </StudentRoute>
      <Space className="flex items-end justify-between">
        <Title level={3} className="mb-0">
          {title}
        </Title>
        <StudentRoute>
          <Tooltip title="Shortlist">
            <Button
              shape="circle"
              icon={<HeartOutlined />}
              type={isShortlisted ? "primary" : "default"}
              onClick={() => {
                if (!project) return;
                !isShortlisted
                  ? ShortlistService.setShortlisted(project.id)
                  : ShortlistService.unsetShortlisted(project.id);
                messageSuccess(isShortlisted
                  ? "Successfully unshortlisted project."
                  : "Successfully shortlisted project.");
                setIsShortlisted(!isShortlisted);
              }}
            />
          </Tooltip>
        </StudentRoute>
        <StaffRoute>
          {isProposed &&
            <Space>
              <Tooltip title="Edit">
                <Link to="./edit" >
                  <Button shape="circle" icon={<EditOutlined />} />
                </Link>
              </Tooltip>
              <Tooltip title="Delete">
                <Button
                  shape="circle"
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    if (!project) return;
                    ProjectService.deleteProject(project.id);
                    // Navigate back to either '/projects' or '/proposed'
                    // or to '/projects' if the history stack is empty.
                    location.key === 'default'
                      ? navigate('/projects')
                      : navigate(-1);
                  }}
                />
              </Tooltip>
            </Space>}
        </StaffRoute>
      </Space>
    </>
  );
}