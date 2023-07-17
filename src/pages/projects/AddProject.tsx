import Loading from '@/components/Loading';
import MessageContext from '@/contexts/message';
import { showErrorMessage, showSuccessMessage } from '@/utils';
import { PlusOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import { Button, Divider, Form, Input, Space, Tag, Typography } from 'antd';
import { useContext, useEffect, useRef, useState } from 'react';

const { Title } = Typography;
const { TextArea } = Input;
const { useForm, useFormInstance } = Form;

export default function AddProject() {
  const [addProject, { loading, error }] = useMutation(AddProjectDocument);
  async function handleFinish(values: Project) {
    await addProject({ variables: { data: values } });
    showSuccessMessage(message, "Successfully add a new project");
  }

  const message = useContext(MessageContext)!;
  if (loading) return <Loading />;
  if (error) showErrorMessage(message, error);

  return <ProjectForm title="Add a New Project" handleFinish={handleFinish} />
}

interface Props {
  title: string,
  handleFinish: (values: any) => void
  initProject?: Project,
}

export function ProjectForm({ title, handleFinish, initProject }: Props) {
  const [form] = useForm();

  return (
    <>
      <Title level={3}>{title}</Title>
      <Divider />
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        onFinish={handleFinish}
        initialValues={initProject}
        className='ml-6 max-w-xl'
      >
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: 'Please enter your project title!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Please enter your project description!' }]}
        >
          <TextArea
            showCount
            rows={5}
            maxLength={500}
          />
        </Form.Item>
        <Form.Item
          label="Categories"
          name="categories"
        >
          <ProjectCategoriesForm />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}

function ProjectCategoriesForm() {
  // Propagate change up to the parent form component
  const form = useFormInstance();
  function setCategoriesWithForm(categories: string[]) {
    form.setFieldValue('categories', categories);
    setCategories(categories);
  }

  const initCategories: string[] = form.getFieldValue('categories') || [];
  const [categories, setCategories] = useState<string[]>(initCategories);

  const [addInputVisible, setAddInputVisible] = useState(false);
  const [addInputValue, setAddInputValue] = useState('');
  const [editInputIndex, setEditInputIndex] = useState(-1);
  const [editInputValue, setEditInputValue] = useState('');
  const addInputRef = useRef<InputRef>(null);
  const editInputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (addInputVisible) {
      addInputRef.current?.focus();
    }
  }, [addInputVisible]);

  useEffect(() => {
    editInputRef.current?.focus();
  }, [addInputValue]);

  function handleClose(removedTag: string) {
    setCategoriesWithForm(categories.filter((tag) => tag !== removedTag));
  }

  function showAddInput() {
    setAddInputVisible(true);
  }

  function handleAddInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setAddInputValue(event.target.value);
  }

  function handleAddInputConfirm() {
    if (addInputValue && categories.indexOf(addInputValue) === -1) {
      setCategoriesWithForm([...categories, addInputValue]);
    }
    setAddInputVisible(false);
    setAddInputValue('');
  }

  function handleEditInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setEditInputValue(event.target.value);
  }

  function handleEditInputConfirm() {
    const newCategories = [...categories];
    newCategories[editInputIndex] = editInputValue;
    setCategoriesWithForm(newCategories);
    setEditInputIndex(-1);
    setAddInputValue('');
  }

  return (
    <Space size="small" wrap>
      {/* Edit the existing categories */}
      <Space size="small" wrap>
        {categories.map((category, index) =>
          <div key={category} className='w-32'>
            {editInputIndex === index ?
              (
                <Input
                  ref={editInputRef}
                  size="small"
                  value={editInputValue}
                  onChange={handleEditInputChange}
                  onBlur={handleEditInputConfirm}
                  onPressEnter={handleEditInputConfirm}
                  className='w-full'
                />
              ) : (
                <Tag
                  closable
                  onDoubleClick={(event) => {
                    setEditInputIndex(index);
                    setEditInputValue(category);
                    event.preventDefault();
                  }}
                  onClose={() => handleClose(category)}
                  className='w-full flex justify-between items-center'
                >
                  {category}
                </Tag>
              )}
          </div>
        )}
      </Space>
      {/* Add a new category */}
      <div className='w-32'>
        {addInputVisible ? (
          <Input
            ref={addInputRef}
            type="text"
            size="small"
            value={addInputValue}
            onChange={handleAddInputChange}
            onBlur={handleAddInputConfirm}
            onPressEnter={handleAddInputConfirm}
            className='w-full'
          />
        ) : (
          <Tag
            onClick={showAddInput}
            className='w-full border-dashed text-center'
          >
            <PlusOutlined /> New Category
          </Tag>
        )}
      </div>
    </Space>
  );
};
