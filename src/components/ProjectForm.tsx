import config from '@/config';
import { ProjectRead } from '@/services/api';
import { PlusOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import { Button, Checkbox, DatePicker, Divider, Form, Input, InputNumber, Radio, Select, Slider, Space, Switch, Tag, TimePicker, Typography } from 'antd';
import dayjs from 'dayjs';
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
        className='ml-6 max-w-xl'
      >
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: 'Please enter your project title!' }]}
          initialValue={initProject?.title}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Please enter your project description!' }]}
          initialValue={initProject?.description}
        >
          <TextArea rows={5} maxLength={500} showCount />
        </Form.Item>
        <ProjectDetailsForm initProject={initProject} />
        <ProjectCategoriesForm initProject={initProject} />
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}

interface ProjectDetailsFormProps {
  initProject?: ProjectRead,
}

function ProjectDetailsForm({ initProject }: ProjectDetailsFormProps) {
  return (
    config.project.details.map((detail) => (
      <Form.Item
        key={detail.name}
        name={detail.name}
        label={detail.title}
        tooltip={detail.description}
        rules={[{ required: detail.required, message: detail.message }]}
        initialValue={(() => {
          // TODO: Refactor!!
          // @ts-ignore
          const value = initProject?.[detail.name];
          if (detail.type === 'date' || detail.type === 'time') {
            return dayjs(value as string);
          }
          return value;
        })()}
        valuePropName={({
          // TODO: Refactor!!
          'switch': 'checked',
          'radio': 'defaultValue',
          'checkbox': 'defaultValue',
        } as any)[detail.type]}
      >
        {({
          // TODO: Refactor!!
          'textfield': <Input />,
          'textarea': <TextArea rows={5} maxLength={500} showCount />,
          'number': <InputNumber className='w-48' />,
          'slider': <Slider />,
          'date': <DatePicker className='w-48' />,
          'time': <TimePicker className='w-48' />,
          'switch': <Switch />,
          'select': (
            <Select
              className='w-48'
              options={detail.options?.map((option) => ({ value: option, label: option }))}
            />
          ),
          'checkbox': (
            <Checkbox.Group
              options={detail.options?.map((option) => ({ value: option, label: option }))}
            />
          ),
          'radio': (
            <Radio.Group
              options={detail.options?.map((option) => ({ value: option, label: option }))}
            />
          ),
        })[detail.type]}
      </Form.Item >
    ))
  );
}


interface ProjectCategoriesFormProps {
  initProject?: ProjectRead
}

function ProjectCategoriesForm({ initProject }: ProjectCategoriesFormProps) {
  // Propagate change up to the parent form component
  const form = useFormInstance();
  function setCategoriesWithForm(categories: string[]) {
    form.setFieldValue('categories', categories);
    setCategories(categories);
  }

  const [categories, setCategories] = useState<string[]>(initProject?.categories || []);
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
      initialValue={categories}
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
