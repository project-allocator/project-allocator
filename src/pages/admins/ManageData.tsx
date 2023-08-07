import { AdminService } from "@/api";
import { useMessage } from "@/contexts/MessageContext";
import { CheckOutlined, DownloadOutlined, InfoCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Divider, Popover, Select, Space, Typography, Upload, UploadFile } from "antd";
import { RcFile } from "antd/es/upload";
import { useState } from "react";

const { Title, Paragraph } = Typography;

const exampleContent = {
  "users": [
    {
      "id": 1,
      "name": "Ms Carole Bradley",
      "email": "whittakeramber@example.com",
      "role": "admin",
      "accepted": null,
      "allocated_id": null,
    }
  ],
  "projects": [
    {
      "id": 1,
      "title": "Dolorum excepturi nostrum ut perspiciatis accusantium.",
      "description": "Laboriosam reiciendis quas rerum voluptate ducimus corporis. Accusamus excepturi dignissimos molestias dolore modi nisi corporis. Vero ratione atque aliquid odit qui recusandae.",
      "categories": [
        "necessitatibus",
        "accusamus",
        "similique",
        "dicta",
        "dignissimos"
      ],
      "approved": true,
      "proposer_id": 1,
    }
  ]
}

export default function ManageData() {
  const [exportType, setExportType] = useState<string>("json");
  const [importFiles, setImportFiles] = useState<UploadFile[]>([]);
  const [importLoading, setImportLoading] = useState<boolean>(false);
  const { messageSuccess, messageError } = useMessage();

  return (
    <>
      <Title level={3}>
        Manage Data
      </Title>
      <Divider />
      <Title level={4}>Import Data</Title>
      <Paragraph className="text-slate-500">
        Import data from the JSON format.
      </Paragraph>
      <Paragraph className="text-slate-500">
        The format of the JSON file should be exactly identical to the file exported by the section below.
        &nbsp;
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
              console.log(JSON.parse(content))
              AdminService.importJson(JSON.parse(content))
                .then(() => messageSuccess("Successfully imported JSON data."))
                .catch((error) => messageError(`Failed to import JSON data. ${error.body.message || ''}`))
                .finally(() => setImportLoading(false));
            }
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
