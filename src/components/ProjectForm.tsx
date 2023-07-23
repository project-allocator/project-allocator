import config from '@/config';
import { ProjectRead } from '@/services/api';
import { PlusOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import { Button, Checkbox, DatePicker, Divider, Form, Input, InputNumber, Radio, Select, Slider, Space, Switch, Tag, TimePicker, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useSubmit } from 'react-router-dom';

const { Title } = Typography;
const { TextArea } = Input;
const { useForm, useFormInstance } = Form;

interface ProjectFormProps {
  title: string,
  initProject?: ProjectRead,
}

export function ProjectForm({ title, initProject }: ProjectFormProps) {
  const [form] = useForm();
  const submit = useSubmit();

  return (
    <>
      <Title level={3}>{title}</Title>
      <Divider />
      <Form
        form={form}
        method="post"
        layout="vertical"
        autoComplete="off"
        onFinish={(values) =>
          submit(values, {
            method: 'post',
            encType: "application/json"
          })
        }
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
          <TextArea rows={5} maxLength={500} showCount />
        </Form.Item>
        <ProjectCategoriesForm />
        <ProjectDetailsForm />
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
    <Form.Item
      label="Categories"
      name="categories"
    >
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
    </Form.Item>
  );
};

function ProjectDetailsForm() {
  return (
    config.project.details.map((detail) => (
      <Form.Item
        key={detail.name}
        name={detail.name}
        label={detail.title}
        tooltip={detail.description}
        rules={[{ required: detail.required, message: detail.message }]}
      >
        {(() => {
          switch (detail.type) {
            case 'textfield':
              return <Input />;
            case 'textarea':
              return <TextArea rows={5} maxLength={500} showCount />;
            case 'number':
              return <InputNumber className='w-48' />;
            case 'slider':
              return <Slider />;
            case 'date':
              return <DatePicker className='w-48' />;
            case 'time':
              return <TimePicker className='w-48' />;
            case 'switch':
              return <Switch />;
            case 'select':
              return (
                <Select
                  className='w-48'
                  options={[
                    { value: 'jack', label: 'Jack' },
                    { value: 'lucy', label: 'Lucy' },
                    { value: 'Yiminghe', label: 'yiminghe' },
                    { value: 'disabled', label: 'Disabled' },
                  ]}
                />
              );
            case 'checkbox':
              return (
                <Checkbox.Group
                  options={[
                    { label: 'Apple', value: 'Apple' },
                    { label: 'Pear', value: 'Pear' },
                    { label: 'Orange', value: 'Orange' },
                  ]}
                />
              );
            case 'radio':
              return (
                <Radio.Group>
                  <Radio value={1}>A</Radio>
                  <Radio value={2}>B</Radio>
                  <Radio value={3}>C</Radio>
                  <Radio value={4}>D</Radio>
                </Radio.Group>
              );
            default:
              throw new Error("Unknown project detail type");
          }
        })()}
      </Form.Item>
    ))
  );
}