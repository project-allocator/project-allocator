import { AdminService, AllocationService, ProjectRead, ProjectService, ProposalService, ShortlistService } from "@/api";
import { useMessage } from "@/contexts/MessageContext";
import AdminRoute from "@/routes/AdminRoute";
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
  hasAllocatees?: boolean;
}

export default function ProjectHeader({ title, project, hasConflict, hasAllocatees }: ProjectHeaderProps) {
  // Set values in state to show the change immediagely in the UI.
  const [isProposed, setIsProposed] = useState(false);
  const [isAllocated, setIsAllocated] = useState<boolean>(false);
  const [isAccepted, setIsAccepted] = useState<boolean | null>(null);
  const [isApproved, setIsApproved] = useState<boolean | null>(project?.approved || null);
  const [isShortlisted, setIsShortlisted] = useState<boolean>(false);
  const [areProposalsShutdown, setAreProposalsShutdown] = useState<boolean>(false);
  const [areUndosShutdown, setAreUndosShutdown] = useState<boolean>(false);

  // Avoid using React Router's data loader
  // to speed up UI by showing project details first.
  useEffect(() => {
    if (!project) return;
    ProposalService.isProposed(project.id).then(setIsProposed);
    ShortlistService.isShortlisted(project.id).then(setIsShortlisted);
    AllocationService.isAllocated(project.id).then(setIsAllocated);
    AllocationService.isAccepted().then(setIsAccepted);
    AdminService.areProposalsShutdown().then(setAreProposalsShutdown);
    AdminService.areUndosShutdown().then(setAreUndosShutdown);
  }, []);

  const navigate = useNavigate();
  const location = useLocation();
  const { messageSuccess, messageError } = useMessage();

  return (
    <>
      <AdminRoute>
        {isApproved === null
          ? (
            <Alert
              type="warning"
              showIcon
              message="This project allocation has not been approved."
              description="Administrators must approve or reject this project proposal."
              action={
                <Space direction="vertical">
                  <Button
                    size="small"
                    type="primary"
                    className="w-20"
                    onClick={() => {
                      ProposalService.approveProposal(project!.id);
                      setIsApproved(true);
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    size="small"
                    className="w-20"
                    onClick={() => {
                      ProposalService.rejectProposal(project!.id);
                      setIsApproved(false);
                    }}
                  >
                    Reject
                  </Button>
                </Space>
              }
            />
          ) : (
            <Alert
              type="info"
              showIcon
              message={isApproved
                ? "You have approved this project proposal."
                : "You have rejected this project proposal."}
              description="Staff member who proposed this project will be notified shortly."
              action={
                <Button
                  size="small"
                  type="primary"
                  className="w-20"
                  onClick={() => {
                    ProposalService.undoProposal(project!.id);
                    setIsApproved(null);
                  }}
                >
                  Undo
                </Button>
              }
            />
          )}
      </AdminRoute>
      <StaffRoute>
        {(hasAllocatees && hasConflict !== null) &&
          (hasConflict
            ? (
              <Alert
                type="error"
                showIcon
                message="This project allocation has a conflict."
                description="There are students who declined or did not respond to this project allocation."
              />
            ) : (
              <Alert
                type="success"
                showIcon
                message="This project allocation has no conflict."
                description="Every student allocated to this project has accepted this project allocation."
              />
            ))}
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
                      className="w-20"
                      onClick={() => {
                        AllocationService.acceptAllocation();
                        setIsAccepted(true);
                      }}
                    >
                      Accept
                    </Button>
                    <Button
                      size="small"
                      className="w-20"
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
                  ? "You have accepted this project allocation."
                  : "You have declined this project allocation."}
                description="Contact your administrators for further information."
                action={
                  !areUndosShutdown &&
                  <Button
                    size="small"
                    type="primary"
                    className="w-20"
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
              onClick={async () => {
                // TODO: This check may be unnecessary.
                if (!project) return;
                await (!isShortlisted
                  ? ShortlistService.setShortlisted(project.id)
                  : ShortlistService.unsetShortlisted(project.id))
                  .then(() => messageSuccess(isShortlisted
                    ? `Successfully unshortlisted project #${project.id}.`
                    : `Successfully shortlisted project #${project.id}.`))
                  .catch(messageError);
                setIsShortlisted(!isShortlisted);
              }}
            />
          </Tooltip>
        </StudentRoute>
        <StaffRoute>
          {(isProposed && !areProposalsShutdown) &&
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
                    // TODO: This check may be unnecessary.
                    if (!project) return;
                    ProjectService.deleteProject(project.id)
                      .then(() => messageSuccess(`Successfully deleted project #${project.id}.`))
                      .catch(messageError);
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