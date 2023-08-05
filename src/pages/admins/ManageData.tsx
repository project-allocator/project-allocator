import { AdminService } from "@/api";
import { CheckOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Divider, Select, Space, Typography, Upload, UploadFile } from "antd";
import { RcFile } from "antd/es/upload";
import { useState } from "react";

const { Title, Paragraph } = Typography;

export default function ManageData() {
  const [exportType, setExportType] = useState<string>("json");
  const [importFiles, setImportFiles] = useState<UploadFile[]>([]);
  const [importLoading, setImportLoading] = useState<boolean>(false);

  return (
    <>
      <Title level={3}>
        Import/Export Data
      </Title>
      <Divider />
      <Title level={4}>Import Data</Title>
      <Paragraph className="text-slate-500">
        Import data from the JSON format.
      </Paragraph>
      <Paragraph className="text-slate-500">
        The format of the JSON file should be exactly identical to the file exported by the section below.
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
            // reader.onload = async (event) => {
            //   const content = event.target?.result as string;
            //   // TODO: Handle import data
            // }
            reader.readAsText(importFiles[0] as RcFile);
          }}
        >
          Check
        </Button>
      </Space>
      <Divider />
      <Title level={4}>Export Data</Title>
      <Paragraph className="text-slate-500">
        Export data in the JSON or CSV format.
      </Paragraph>
      <Paragraph className="text-slate-500">
        The JSON format exports all information and is suitable for further processing data with Python etc.<br />
        The CSV format exports minimal information about the project and allocation and is ready to be shared with staff and students.
      </Paragraph>
      <Space direction="vertical">
        <Select
          defaultValue="json"
          className="w-20"
          options={[
            { value: 'json', label: 'JSON' },
            { value: 'csv', label: 'CSV' },
          ]}
          onChange={(value) => setExportType(value)}
        />
        <Button
          icon={<DownloadOutlined />}
          onClick={() => {
            (exportType === "json"
              ? AdminService.exportJson()
              : AdminService.exportCsv()
            ).then((response) => {
              // Create blob link to download
              // https://stackoverflow.com/questions/50694881/how-to-download-file-in-react-js
              const url = window.URL.createObjectURL(new Blob([response]));
              const linkElement = document.createElement('a');
              linkElement.href = url;
              linkElement.setAttribute('download', `output.${exportType}`);
              document.body.appendChild(linkElement);
              linkElement.click();
              document.body.removeChild(linkElement);
            });
          }}
        >
          Download File
        </Button>
      </Space>
    </>
  );
}
