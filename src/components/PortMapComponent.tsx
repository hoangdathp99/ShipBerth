"use client";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import dynamic from "next/dynamic";
import { useState } from "react";
import { ControlPanel } from "./control/controlPanel";

interface PortMapComponentProps {
  // Define props here if needed
}

const RulerComponent = dynamic(() => import("./RulerComponent"), {
  ssr: false,
});
const PortMapComponent: React.FC<PortMapComponentProps> = () => {
  const [openControl, setOpenControl] = useState(false);
  const handleOpenControl = () => {
    setOpenControl(!openControl);
  };
  return (
    <>
      <RulerComponent />
      <div
        style={{
          position: "fixed",
          top: "16px",
          right: openControl ? "16px" : "-435px",
          transition: "right 0.5s ease-in-out",
          // width:0,
          // overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Tooltip
            title={openControl ? "Đóng bảng điều khiển" : "Mở bảng điều khiển"}
            placement="right"
          >
            <Button onClick={handleOpenControl} style={{ gap: 0 }}>
              {!openControl ? <LeftOutlined /> : <RightOutlined />}
            </Button>
          </Tooltip>
          <ControlPanel />
        </div>
      </div>
    </>
  );
};

export default PortMapComponent;
