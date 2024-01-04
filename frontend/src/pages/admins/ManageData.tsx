import { useMessage } from "@/contexts/MessageContext";
import { useExportData, useImportData, useResetDatabase } from "@/hooks/admins";
import { CheckOutlined, DownloadOutlined, ExclamationCircleOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Divider, Input, Modal, Select, Space, Typography, Upload, UploadFile } from "antd";
import { RcFile } from "antd/es/upload";
import { useState } from "react";

const { Title, Paragraph } = Typography;

export default function ManageData() {
  return (
    <>
      <Title level={3}>Manage Data</Title>
      <Divider />
      <ImportData />
      <Divider />
      <ExportData />
      <Divider />
      <ResetDatabase />
    </>
  );
}

function ImportData() {
  const { messageSuccess, messageError } = useMessage();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const importData = useImportData();

  return (
    <>
      <Title level={4}>Import Data</Title>
      <Paragraph className="text-slate-500">Import data from the JSON format.</Paragraph>
      <Paragraph className="text-slate-500">
        The format of the JSON file should be exactly identical to the file exported by the section below.
      </Paragraph>
      <Space direction="vertical">
        <Upload
          maxCount={1}
          fileList={fileList}
          onRemove={() => {
            setFileList([]);
          }}
          beforeUpload={(file) => {
            setFileList([file]);
            // Prevent triggering upload.
            return false;
          }}
        >
          <Button icon={<UploadOutlined />}>Select File</Button>
        </Upload>
        <Button
          icon={<CheckOutlined />}
          loading={isLoading}
          disabled={fileList.length === 0}
          onClick={() => {
            setIsLoading(true);
            const reader = new FileReader();
            reader.onload = (event) => {
              const content = event.target?.result as string;
              importData.mutate(JSON.parse(content), {
                onSuccess: () => messageSuccess("Successfully imported JSON data."),
                onError: () => messageError("Failed to import JSON data."),
                onSettled: () => setIsLoading(false),
              });
            };
            reader.readAsText(fileList[0] as RcFile);
          }}
        >
          Import
        </Button>
      </Space>
    </>
  );
}

function ExportData() {
  const { messageSuccess, messageError } = useMessage();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [exportType, setExportType] = useState<string>("json");
  const exportData = useExportData();

  return (
    <>
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
          loading={isLoading}
          onClick={() => {
            setIsLoading(true);
            exportData.mutate(exportType, {
              onSuccess: () => messageSuccess("Successfully exported data."),
              onError: () => messageError("Failed to export data."),
              onSettled: () => setIsLoading(false),
            });
          }}
        >
          Download File
        </Button>
      </Space>
    </>
  );
}

function ResetDatabase() {
  const { messageSuccess, messageError } = useMessage();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [confirmString, setConfirmString] = useState<string>("");
  const resetDatabase = useResetDatabase();

  return (
    <>
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
              disabled={confirmString != "RESET DATABASE"}
              onClick={() => {
                resetDatabase.mutate(undefined, {
                  onSuccess: () => messageSuccess("Successfully reset database."),
                  onError: () => messageError("Failed to reset database."),
                  onSettled: () => {
                    setConfirmString("");
                    setIsModalOpen(false);
                  },
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
        <Input value={confirmString} onChange={(event) => setConfirmString(event.target.value)} />
      </Modal>
    </>
  );
}
