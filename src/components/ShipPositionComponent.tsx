"use client";
import { useDraggable } from "@dnd-kit/core";
import { useMemo, useState } from "react";
import "../styles/ship.scss";
import { Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { socket } from "@/lib/socketClient";

interface ShipPositionComponentProps {
  viewMode?: boolean;
  ship: {
    id: string;
    length: number;
    shipName: string;
    image: string;
    position: {
      x: number;
      y: number;
    };
    dateBerth: string;
    timeBerth: string;
  };
  scale: number;
  id: string;
  overlay?: boolean;
  start: number;
  cacheBuster?: number;
}

const ShipPositionComponent: React.FC<ShipPositionComponentProps> = ({
  ship,
  scale,
  id,
  overlay,
  start,
  viewMode,
  cacheBuster
}) => {
  const shipWidth = useMemo(() => ship.length * scale, [ship.length, scale]);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
  });
  console.log(ship);
  
  return (
    <div
      className={`ship-position-container ${
        overlay ? "overlay" : "not-overlay"
      } ${isDragging ? "dragging" : "not-dragging"}`}
      style={{
        left: !overlay ? 20 + (ship.position.x - start) * scale : 0,
        width: `${shipWidth}px`,
        animation: !overlay ? "wave 4s ease-in-out infinite" : "none",
      }}
      
      onClick={() => console.log(ship.id)}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
    >
      <div className="ship">
        <div className="startPoint" style={viewMode ? { display: "block" } : {}}>
          <label>{overlay ? "" : `${Math.round(ship.position.x)}m`}</label>
        </div>
        <img
          src={`${ship.image}?t=${cacheBuster}`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/uploads/shipContainer.png";
          }}
          style={{
            width: `${shipWidth}px`,
            height: "auto",
            // backdropFilter: "blur(5px)",
          }}
          alt="Ship"
        />

        <div className="popup" style={viewMode ? { display: "block" } : {}}>
          <div>

          <span id="ship-name-text">{ship.shipName}</span>:{" "}
          <span id="ship-length-text">{ship.length}m</span>
          </div>
          <div>Ngày cập bến: {ship.dateBerth} - {ship.timeBerth}</div>
        </div>
        {!viewMode && (
          <div className="delete-btn">
            <Button
              danger
              type="primary"
              onClick={() => socket.emit("removeShip", ship.id)}
            >
              <DeleteOutlined />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShipPositionComponent;
