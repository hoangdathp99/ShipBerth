"use client";
import { socket } from "@/lib/socketClient";
import fetchShips from "@/services/fetchShip";
import { ReloadOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  DatePicker,
  message,
  Select,
  Space,
  TimePicker,
  TimePickerProps,
} from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react"; // Re-add useState import
import "../../styles/controlPanel.scss";
import ShipImageWithFallback from "./ShipImageWithFallback"; // Import the new component

export const ControlPanel = () => {
  const [shipId, setShipId] = useState<number | undefined>(undefined);
  const [selectedShip, setSelectedShip] = useState<any>();
  const [timeBerth, setTimeBerth] = useState<string>();
  const [dateBerth, setDateBerth] = useState<string>();
  const router = useRouter();
  const { data, refetch } = useQuery({
    queryKey: ["ships"],
    queryFn: () => fetchShips({ pageParam: 1 }),
    select: (data) => {
      return data.ships?.map((item: any) => ({
        value: item.ShipID,
        label: item.ShipName,
        nLoa: item.nLoa,
        image: `/uploads/${item.ShipName.replace(" ", "_")}.png`,
      }));
    },
  });
  // const { data, refetch } = useInfiniteQuery({
  //   queryKey: ["ships"],
  //   queryFn: ({ pageParam }) => {
  //     return fetchShips({ pageParam });
  //   },
  //   select: (data) => {
  //     return data.pages?.[0].ships?.map((item: any) => ({
  //       value: item.ShipID,
  //       label: item.ShipName,
  //       nLoa: item.nLoa,
  //       image: `/uploads/${item.ShipName.replace(" ", "_")}.png`,
  //     }));
  //   },
  //   initialPageParam: 1,
  //   getNextPageParam: (lastPage, allPages) => {
  //     return lastPage?.nextPage;
  //   },
  // });
  const onChangeTime: TimePickerProps["onChange"] = (time, timeString) => {
    console.log(timeString);

    setTimeBerth(timeString as any);
  };
  const onChangeDate: TimePickerProps["onChange"] = (date, dateString) => {
    console.log(dateString);

    setDateBerth(dateString as any);
  };
  const handleSubmit = () => {
    if (!selectedShip) {
      message.error("Vui lòng chọn tàu");
      return;
    }
    if (!timeBerth || !dateBerth) {
      message.error("Vui lòng chọn thời gian cập bến");
      return;
    }
    socket.emit("addShip", {
      id: selectedShip.value,
      length: selectedShip.nLoa,
      shipName: selectedShip.label,
      position: { x: 0, y: 0 },
      image: selectedShip.image,
      timeBerth,
      dateBerth,
    });
  };
  const optionRender = (option: any) => {
    return (
      <Space>
        <ShipImageWithFallback
          src={option.data.image}
          alt={option.data.label}
          style={{ width: "50px", height: "auto", backdropFilter: "blur(5px)" }}
          placeholderText="No Image"
        />
        {option.data.label}
      </Space>
    );
  };
  return (
    <div>
      <Space direction="vertical">
        <div className="control-panel">
          <div className="select-ship-container">
            <Select
              placeholder="Chọn tàu..."
              value={shipId}
              onChange={(value, option) => {
                setShipId(value);
                setSelectedShip(option);
              }}
              options={data}
              showSearch
              optionFilterProp="label"
              className="select-ship"
              optionRender={optionRender}
            ></Select>

            <Button type="default" onClick={() => refetch()}>
              <ReloadOutlined />
            </Button>
          </div>
          <div className="select-ship-container">
            <div style={{ minWidth: "max-content", textAlign: "center" }}>
              Ngày cập bến
            </div>
            <TimePicker onChange={onChangeTime} needConfirm={false}/>
            <DatePicker onChange={onChangeDate} needConfirm={false}/>
          </div>
          <Button type="primary" onClick={handleSubmit}>
            Thêm tàu
          </Button>
        </div>
        <div className="control-panel">
          <Button type="default" onClick={() => router.push("/image_manage")}>
            Quản lý thư viện ảnh tàu
          </Button>
        </div>
      </Space>
    </div>
  );
};
