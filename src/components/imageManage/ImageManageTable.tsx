"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  InboxOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type {
  InputRef,
  TableColumnsType,
  TableColumnType,
  UploadProps,
} from "antd";
import { Button, Input, message, Progress, Space, Table, Tooltip } from "antd";
import type { FilterDropdownProps } from "antd/es/table/interface";
import { useQuery } from "@tanstack/react-query";
import fetchShips from "@/services/fetchShip";
import Dragger from "antd/es/upload/Dragger";
import { socket } from "@/lib/socketClient";
import ShipImageWithFallback from "../control/ShipImageWithFallback";

interface DataType {
  shipName: string;
  nLoa: number;
}
interface UploadFileStatus {
  uid: string;
  name: string;
  percent: number;
  status: "active" | "success" | "exception";
}
type DataIndex = keyof DataType;

const ImageManageTable: React.FC = () => {
  const [fileStatuses, setFileStatuses] = useState<UploadFileStatus[]>([]);

  const searchInput = useRef<InputRef>(null);
  const [cacheBuster, setCacheBuster] = useState(Date.now());
  const { data: shipData, refetch } = useQuery({
    queryKey: ["ships"],
    queryFn: () => fetchShips({ pageParam: 1 }),
    select: (data) => {
      return data.ships?.map((item: any) => ({
        shipName: item.ShipName,
        nLoa: item.nLoa,
        image: `/uploads/${item.ShipName.replace(
          " ",
          "_"
        )}.png?t=${cacheBuster}`,
        id: item.ShipID,
      }));
    },
  });
  const handleRefresh = async () => {
    await refetch(); // re-run query
    setCacheBuster(Date.now()); // force new timestamp, reselect data with new image URL
  };
  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"],
    dataIndex: DataIndex
  ) => {
    confirm();
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
  };
  const updateFileStatus = (
    uid: string,
    updates: Partial<UploadFileStatus>
  ) => {
    setFileStatuses((prev) =>
      prev.map((file) => (file.uid === uid ? { ...file, ...updates } : file))
    );
  };
  const removeFileStatus = (uid: string) =>
    setFileStatuses((prev) => prev.filter((file) => file.uid !== uid));
  const handleFindProgress = (uid: string) =>
    fileStatuses.find((file) => file.uid === uid);
  const handleUpload: any = async (options: any, fileName: string) => {
    const { file, onSuccess, onError, onProgress } = options;
    const uid = fileName;
    setFileStatuses((prev) => [
      ...prev,
      { uid, name: fileName, percent: 0, status: "active" },
    ]);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", fileName);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/uploads");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        updateFileStatus(uid, { percent });
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        updateFileStatus(uid, { percent: 100, status: "success" });
        message.success("Upload thành công!");
        socket.emit("updateShipImage");
      } else {
        message.error("Lỗi upload");
        updateFileStatus(uid, { status: "exception" });
      }
      setTimeout(() => removeFileStatus(uid), 1000);
    };

    xhr.onerror = () => {
      message.error("Lỗi kết nối.");
      updateFileStatus(uid, { status: "exception" });
      setTimeout(() => removeFileStatus(uid), 1000);
    };

    xhr.send(formData);
  };
  const beforeupload = (file: any) => {
    const isPNG = file.type === "image/png";
    if (!isPNG) {
      message.error(`${file.name} is not a png file`);
    }
    return isPNG;
  };
  const getColumnSearchProps = (
    dataIndex: DataIndex
  ): TableColumnType<DataType> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>

          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    render: (text) => text,
  });

  const columns: TableColumnsType<DataType> = [
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      width: 100,
      render: (text) => (
        <ShipImageWithFallback src={text} alt="Ship" style={{ width: "100%", height: "auto" }} />
      ),
    },
    {
      title: "Tên tàu",
      dataIndex: "shipName",
      key: "shipName",
      width: "20%",
      sorter: (a, b) => a.shipName.localeCompare(b.shipName),
      ...getColumnSearchProps("shipName"),
    },
    {
      title: "Độ dài",
      dataIndex: "nLoa",
      key: "nLoa",
      width: "20%",
    },
    {
      title: "Cập nhật ảnh",
      key: "action",
      width: "20%",
      fixed: "right",
      render: (_, record) => {
        const progress = handleFindProgress(record.shipName);
        return (
          <Dragger
            multiple={false}
            name="file"
            showUploadList={false}
            beforeUpload={beforeupload}
            customRequest={(e) => handleUpload(e, record.shipName)}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p>Kéo ảnh hoặc click để chọn</p>
            {progress && (
              <Progress percent={progress?.percent} status={progress.status} />
            )}
          </Dragger>
        );
      },
    },
  ];
  useEffect(() => {
    socket.on("message", (data) => {
      console.log(data);

      if (data === "updatedImage") {
        setCacheBuster(Date.now()); // force new timestamp, reselect data with new image URL
      }
    });
    return () => {
      socket.off("message");
    };
  }, []);
  return (
    <div>
      <Tooltip title="Làm mới dữ liệu" placement="top">
        <Button
          style={{ marginBottom: "10px" }}
          onClick={() => handleRefresh()}
        >
          <ReloadOutlined />
        </Button>
      </Tooltip>

      <Table
        bordered
        columns={columns}
        dataSource={shipData}
        scroll={{ y: 130 * 5, x: 'max-content' }}
        rowKey={"id"}
      />
    </div>
  );
};

export default ImageManageTable;
