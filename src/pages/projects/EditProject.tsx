import Loading from '@/components/Loading';
import MessageContext from '@/contexts/message';
import { getData } from '@/services/api';
import { Project } from '@/services/projects';
import { showErrorMessage, showSuccessMessage } from '@/utils';
import { useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProjectForm } from './AddProject';

export default function EditProject() {
  const [params] = useSearchParams();
  const id = parseInt(params.get('id')!);

  const { data: initData, loading: initLoading, error: initError } = getData();
  const initProject = initData?.project;

  const [editProject, { loading: submitLoading, error: submitError }] = getData();
  async function handleFinish(values: Project) {
    await editProject({ variables: { id, data: values } });
    showSuccessMessage(message, `Successfully edited project #${id}`);
    // TODO: Redirect using router actions
    // https://reactrouter.com/en/main/start/tutorial#mutation-discussion
    // router.push(`/projects/${id}`);
  }

  const message = useContext(MessageContext)!;
  if (initLoading || submitLoading) return <Loading />;
  if (initError || submitError) showErrorMessage(message, initError || submitError);

  return <ProjectForm title={`Edit Project #${id}`} handleFinish={handleFinish} initProject={initProject as Project} />
}