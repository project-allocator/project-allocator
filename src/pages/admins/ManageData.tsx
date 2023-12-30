import { useMessage } from "@/contexts/MessageContext";
import { useExportData, useImportData, useResetDatabase } from "@/hooks/admins";
import {
  CheckOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Button, Divider, Input, Modal, Popover, Select, Space, Typography, Upload, UploadFile } from "antd";
import { RcFile } from "antd/es/upload";
import { useState } from "react";

const { Title, Paragraph } = Typography;

const exampleContent = {
  users: [
    {
      id: "01HJJM36Y7C7BTCJFD1Z4Y74CQ",
      email: "jesse83@example.org",
      name: "Luke Glover",
      role: "staff",
    },
  ],
  projects: [
    {
      id: "01HJJM36Y7VHSA06C09QFMBVSQ",
      title: "Born already analysis allow alone author.",
      description: "International wrong admit society community Democrat. Themselves part window world.",
      approved: true,
      details: [
        {
          project_id: "01HJJM36Y7VHSA06C09QFMBVSQ",
          key: "ability-commercial",
          type: "radio",
          value: "discuss",
        },
      ],
      allocations: [
        {
          allocatee_id: "01HJJM371KGTC0AH4S5D37G0JE",
          allocated_project_id: "01HJJM36Z20YDY2PV0N9H5WRYF",
          accepted: null,
        },
      ],
    },
  ],
};

export default function ManageData() {
  const { messageSuccess, messageError } = useMessage();

  const [exportType, setExportType] = useState<string>("json");
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [importFiles, setImportFiles] = useState<UploadFile[]>([]);
  const [importLoading, setImportLoading] = useState<boolean>(false);
  const [resetDatabaseConfirmString, setResetDatabaseConfirmString] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const importData = useImportData();
  const exportData = useExportData();
  const resetDatabase = useResetDatabase();

  return (
    <>
      <Title level={3}>Manage Data</Title>
      <Divider />
      <Title level={4}>Import Data</Title>
      <Paragraph className="text-slate-500">Import data from the JSON format.</Paragraph>
      <Paragraph className="text-slate-500">
        The format of the JSON file should be exactly identical to the file exported by the section below. &nbsp;
        <Popover
          trigger="hover"
          title="Example of JSON Content"
          content={
            <pre className="max-w-lg max-h-60 whitespace-pre-wrap overflow-y-scroll">
              {JSON.stringify(exampleContent, null, 2)}
            </pre>
          }
        >
          <InfoCircleOutlined />
        </Popover>
      </Paragraph>
      <Space direction="vertical">
        <Upload
          maxCount={1}
          fileList={importFiles}
          onRemove={() => {
            setImportFiles([]);
          }}
          beforeUpload={(file) => {
            setImportFiles([file]);
            // Prevent triggering upload.
            return false;
          }}
        >
          <Button icon={<UploadOutlined />}>Select File</Button>
        </Upload>
        <Button
          icon={<CheckOutlined />}
          loading={importLoading}
          disabled={importFiles.length === 0}
          onClick={() => {
            setImportLoading(true);
            const reader = new FileReader();
            reader.onload = (event) => {
              const content = event.target?.result as string;
              importData.mutate(JSON.parse(content), {
                onSuccess: () => messageSuccess("Successfully imported JSON data."),
                onError: () => messageError("Failed to import JSON data."),
                onSettled: () => setImportLoading(false),
              });
            };
            reader.readAsText(importFiles[0] as RcFile);
          }}
        >
          Check
        </Button>
      </Space>
      <Divider />
      <Title level={4}>Export Data</Title>
      <Paragraph className="text-slate-500">Export data in the JSON or CSV format.</Paragraph>
      <Paragraph className="text-slate-500">
        The JSON format exports all information and is suitable for further processing data with Python etc.
        <br />
        The CSV format exports minimal information about the project and allocation and is ready to be shared with staff
        and students.
      </Paragraph>
      <Space direction="vertical">
        <Select
          defaultValue="json"
          className="w-20"
          options={[
            { value: "json", label: "JSON" },
            { value: "csv", label: "CSV" },
          ]}
          onChange={(value) => setExportType(value)}
        />
        <Button
          icon={<DownloadOutlined />}
          loading={exportLoading}
          onClick={() => {
            setExportLoading(true);
            exportData.mutate(exportType, {
              onSuccess: () => messageSuccess("Successfully exported data."),
              onError: () => messageError("Failed to export data."),
              onSettled: () => setExportLoading(false),
            });
          }}
        >
          Download File
        </Button>
      </Space>
      <Divider />
      <Title level={4}>Reset Database</Title>
      <Paragraph className="text-slate-500">
        Reset the database of this Project Allocator instance.
        <br />
        This will delete all users and projects registered in the application, except your admin account information,
        which will be preserved.
        <br />
        <b>This operation cannot be undone</b>.
      </Paragraph>
      <Button icon={<ExclamationCircleOutlined />} onClick={() => setIsModalOpen(true)}>
        Reset Database
      </Button>
      <Modal
        title="Are you sure you want to continue?"
        open={isModalOpen}
        footer={
          <Space>
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              disabled={resetDatabaseConfirmString != "RESET DATABASE"}
              onClick={() => {
                resetDatabase.mutate(undefined, {
                  onSuccess: () => messageSuccess("Successfully reset database."),
                  onError: () => messageError("Failed to reset database."),
                  onSettled: () => setIsModalOpen(false),
                });
              }}
            >
              OK
            </Button>
          </Space>
        }
        onCancel={() => setIsModalOpen(false)}
      >
        <Paragraph>
          If you are sure you want to continue, please type <b>RESET DATABASE</b> in the box below.
        </Paragraph>
        <Input
          value={resetDatabaseConfirmString}
          onChange={(event) => setResetDatabaseConfirmString(event.target.value)}
        />
      </Modal>
    </>
  );
}
